const mongoose = require("mongoose");
const { Schema } = mongoose;

const tagSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model("Tag", tagSchema);
