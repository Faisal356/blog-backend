const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/userController");
const auth = require("../middleware/auth");

router.get("/:id", userCtrl.getProfile);
router.post("/:id/follow", auth, userCtrl.follow);

module.exports = router;
