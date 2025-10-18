const Category = require("../models/Category");
const slugify = require("../utils/slugify");

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, isFeatured } = req.body;
    const slug = slugify(name);
    const exists = await Category.findOne({ slug });
    if (exists) return res.status(400).json({ message: "Category exists" });
    const category = await Category.create({ name, slug, description, isFeatured });
    res.status(201).json({ category });
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) { next(err); }
};
