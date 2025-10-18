const User = require("../models/User");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) { next(err); }
};

exports.follow = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const me = req.user;
    if (me._id.equals(targetId)) return res.status(400).json({ message: "Can't follow yourself" });
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: "User not found" });

    // toggle follow
    const isFollowing = me.following.some(f => f.equals(target._id));
    if (isFollowing) {
      me.following.pull(target._id);
      target.followers.pull(me._id);
    } else {
      me.following.push(target._id);
      target.followers.push(me._id);
    }
    await me.save();
    await target.save();
    res.json({ following: !isFollowing });
  } catch (err) { next(err); }
};
