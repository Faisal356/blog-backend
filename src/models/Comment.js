const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    parent: { type: Schema.Types.ObjectId, ref: "Comment", default: null }, // nested comments
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isApproved: { type: Boolean, default: true }, // moderation
    isSpam: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
