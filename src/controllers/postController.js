const Post = require("../models/Post");
const Review = require("../models/Review");
const slugify = require("../utils/slugify");
const mongoose = require("mongoose");

/**
 * create post
 */
exports.createPost = async (req, res, next) => {
  try {
    const data = req.body;
    data.author = req.user._id;
    data.slug = data.slug ? slugify(data.slug) : slugify(data.title);
    if (data.isPublished) data.publishedAt = new Date();
    const post = await Post.create(data);
    res.status(201).json({ post });
  } catch (err) { next(err); }
};

/**
 * update post
 */
exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    // only author or admin/editor can edit
    if (!post.author.equals(req.user._id) && !req.user.roles.includes("admin") && !req.user.roles.includes("editor")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (req.body.title) req.body.slug = slugify(req.body.title);
    if (req.body.isPublished && !post.isPublished) req.body.publishedAt = new Date();
    const updated = await Post.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ post: updated });
  } catch (err) { next(err); }
};

/**
 * get post by slug or id (with comments and author)
 */
exports.getPost = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const query = mongoose.Types.ObjectId.isValid(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
    const post = await Post.findOne(query)
      .populate("author", "name avatar")
      .populate("categories", "name slug")
      .populate("tags", "name slug")
      .lean();
    if (!post) return res.status(404).json({ message: "Post not found" });

    // increment view count (non-blocking)
    Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } }).catch(() => {});

    res.json({ post });
  } catch (err) { next(err); }
};

/**
 * delete post
 */
exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Not found" });
    if (!post.author.equals(req.user._id) && !req.user.roles.includes("admin")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await Post.findByIdAndDelete(id);
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
};

/**
 * list posts with filtering, sorting, pagination
 * query params supported:
 * page, limit, search, category, tags (comma), author, featured, sort (newest, oldest, popular, top-rated)
 * minRating, isPublished, from (date), to (date)
 */
exports.listPosts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, search, category, tags, author,
      featured, sort, minRating, isPublished, from, to
    } = req.query;

    const filter = {};
    if (isPublished !== undefined) filter.isPublished = isPublished === "true";
    if (category) filter.categories = category; // expect category id or slug (improvement: resolve slug)
    if (tags) filter.tags = { $in: tags.split(",") };
    if (author) filter.author = author;
    if (featured) filter.isFeatured = featured === "true";
    if (minRating) filter["rating.avg"] = { $gte: Number(minRating) };
    if (from || to) filter.publishedAt = {};
    if (from) filter.publishedAt.$gte = new Date(from);
    if (to) filter.publishedAt.$lte = new Date(to);

    let query = Post.find(filter)
      .populate("author", "name avatar")
      .populate("categories", "name slug")
      .populate("tags", "name slug");

    // text search
    if (search) {
      query = query.find({ $text: { $search: search } });
    }

    // sorting
    switch (sort) {
      case "newest": query = query.sort({ publishedAt: -1 }); break;
      case "oldest": query = query.sort({ publishedAt: 1 }); break;
      case "popular": query = query.sort({ views: -1, likes: -1 }); break;
      case "top-rated": query = query.sort({ "rating.avg": -1 }); break;
      default: query = query.sort({ createdAt: -1 });
    }

    const total = await Post.countDocuments(query.getQuery());
    const p = Math.max(1, parseInt(page, 10));
    const l = Math.min(100, parseInt(limit, 10));
    const posts = await query.skip((p - 1) * l).limit(l).lean();

    res.json({ meta: { total, page: p, limit: l, pages: Math.ceil(total / l) }, posts });
  } catch (err) { next(err); }
};

/**
 * toggle like/dislike
 */
exports.toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const liked = post.likes.some(u => u.equals(userId));
    if (liked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
      // remove dislike if present
      if (post.dislikes.some(u => u.equals(userId))) post.dislikes.pull(userId);
    }
    await post.save();
    res.json({ likes: post.likes.length, dislikes: post.dislikes.length });
  } catch (err) { next(err); }
};

exports.toggleDislike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const disliked = post.dislikes.some(u => u.equals(userId));
    if (disliked) {
      post.dislikes.pull(userId);
    } else {
      post.dislikes.push(userId);
      // remove like if present
      if (post.likes.some(u => u.equals(userId))) post.likes.pull(userId);
    }
    await post.save();
    res.json({ likes: post.likes.length, dislikes: post.dislikes.length });
  } catch (err) { next(err); }
};

/**
 * share endpoint increments share count
 */
exports.share = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { $inc: { shares: 1 } }, { new: true });
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json({ shares: post.shares });
  } catch (err) { next(err); }
};

/**
 * add review/rating
 * ensures one review per user per post; updates aggregated rating
 */
exports.addOrUpdateReview = async (req, res, next) => {
  try {
    const { id } = req.params; // post id
    const { rating, comment } = req.body;
    const userId = req.user._id;

    let review = await Review.findOne({ post: id, user: userId });
    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({ post: id, user: userId, rating, comment });
    }

    // recalculate aggregation
    const agg = await Review.aggregate([
      { $match: { post: review.post, isApproved: true } },
      { $group: { _id: "$post", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    if (agg.length > 0) {
      await Post.findByIdAndUpdate(id, { "rating.avg": agg[0].avg, "rating.count": agg[0].count });
    } else {
      await Post.findByIdAndUpdate(id, { "rating.avg": 0, "rating.count": 0 });
    }
    res.json({ review });
  } catch (err) { next(err); }
};
