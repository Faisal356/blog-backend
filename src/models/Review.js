const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

// ensure one review per user per post
reviewSchema.index({ post: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
