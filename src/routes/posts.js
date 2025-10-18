const express = require("express");
const router = express.Router();
const postCtrl = require("../controllers/postController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/roles");
const validateObjectId = require("../middleware/validateObjectId");

router.get("/", postCtrl.listPosts);
router.post("/", auth, authorize(["admin","editor"]), postCtrl.createPost);
router.get("/slug/:idOrSlug", postCtrl.getPost);
router.get("/:id", validateObjectId("id"), postCtrl.getPost); // supports id
router.put("/:id", auth, validateObjectId("id"), postCtrl.updatePost);
router.delete("/:id", auth, validateObjectId("id"), postCtrl.deletePost);

// actions
router.post("/:id/like", auth, validateObjectId("id"), postCtrl.toggleLike);
router.post("/:id/dislike", auth, validateObjectId("id"), postCtrl.toggleDislike);
router.post("/:id/share", auth, validateObjectId("id"), postCtrl.share);
router.post("/:id/review", auth, validateObjectId("id"), postCtrl.addOrUpdateReview);

module.exports = router;
