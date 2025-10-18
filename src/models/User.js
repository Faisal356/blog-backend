const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, trim: true, index: true },
  email: { type: String, unique: true, lowercase: true, index: true },
  password: { type: String },
  avatar: { type: String }, // URL or path
  bio: { type: String },
  roles: { type: [String], default: ["user"] }, // e.g. ['user', 'admin', 'editor', 'moderator']
  isVerified: { type: Boolean, default: false },
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

// password hash
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const saltRounds = parseInt(process.env.SALT_ROUNDS || "12", 10);
  const salt = await bcrypt.genSalt(saltRounds);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
