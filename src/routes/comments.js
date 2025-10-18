const express = require("express");
const router = express.Router();
const commentCtrl = require("../controllers/commentController");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");

router.post("/:postId", auth, validateObjectId("postId"), commentCtrl.addComment);
router.get("/:postId", validateObjectId("postId"), commentCtrl.listByPost);
router.post("/:id/like", auth, validateObjectId("id"), commentCtrl.toggleLike);
router.delete("/:id", auth, validateObjectId("id"), commentCtrl.deleteComment);

module.exports = router;
