const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
