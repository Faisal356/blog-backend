const mongoose = require("mongoose");
module.exports = (param = "id") => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[param])) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  next();
};
