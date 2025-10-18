const Comment = require("../models/Comment");
const Post = require("../models/Post");

exports.addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, parent } = req.body;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content,
      parent: parent || null
    });
    res.status(201).json({ comment });
  } catch (err) { next(err); }
};

exports.listByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    // get nested comments with simple approach: fetch root comments & populate children separately
    const comments = await Comment.find({ post: postId, parent: null }).populate("author", "name avatar").sort({ createdAt: -1 }).lean();

    // optionally fetch replies for each comment
    const roots = await Promise.all(comments.map(async (c) => {
      const replies = await Comment.find({ parent: c._id }).populate("author", "name avatar").sort({ createdAt: 1 }).lean();
      return { ...c, replies };
    }));

    res.json({ comments: roots });
  } catch (err) { next(err); }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    const uid = req.user._id;
    const liked = comment.likes.some(u => u.equals(uid));
    if (liked) comment.likes.pull(uid);
    else comment.likes.push(uid);
    await comment.save();
    res.json({ likes: comment.likes.length });
  } catch (err) { next(err); }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Not found" });
    // only author or admin/moderator can delete
    if (!comment.author.equals(req.user._id) && !req.user.roles.includes("admin") && !req.user.roles.includes("moderator")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await Comment.findByIdAndDelete(id);
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
};
