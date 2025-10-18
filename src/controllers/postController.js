const Post = require("../models/Post");
const Review = require("../models/Review");
const slugify = require("../utils/slugify");
const mongoose = require("mongoose");

exports.createPost = async (req, res, next) => {
  try {
    const data = req.body;
    data.author = req.user._id;
    data.slug = data.slug ? slugify(String(data.slug)) : slugify(String(data.title));
    if (data.isPublished) data.publishedAt = new Date();
    const post = await Post.create(data);
    res.status(201).json({ post });
  } catch (err) { next(err); }
};