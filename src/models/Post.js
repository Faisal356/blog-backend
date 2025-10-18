const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema({
  title: { type: String, required: false, index: true },
  slug: { type: String, required: false, unique: true, index: true },
  excerpt: { type: String },
  content: { type: String }, // markdown or HTML
  author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  categories: [{ type: Schema.Types.ObjectId, ref: "Category", index: true }],
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag", index: true }],
  featuredImage: { type: String },
  isPublished: { type: Boolean, default: false, index: true },
  publishedAt: { type: Date },
  views: { type: Number, default: 0 },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  shares: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false, index: true },
  meta: {
    readingTime: Number,
    language: String
  },
  rating: { // aggregated rating summary
    avg: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  status: { type: String, enum: ["draft","published","archived","pending"], default: "draft" }
}, { timestamps: true });

// full-text index for searching title + excerpt + content
postSchema.index({ title: "text", excerpt: "text", content: "text" });

module.exports = mongoose.model("Post", postSchema);
