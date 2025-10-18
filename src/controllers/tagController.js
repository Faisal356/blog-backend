const Category = require("../models/Category");
const Tag = require("../models/Tag");
const slugify = require("../utils/slugify");

exports.createTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = slugify(name);
    const exists = await Tag.findOne({ slug });
    if (exists) return res.status(400).json({ message: "Tag exists" });
    const tag = await Tag.create({ name,slug});
    res.status(201).json({ tag });
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json({ tags });
  } catch (err) { next(err); }
};
