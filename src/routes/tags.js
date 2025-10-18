const express = require("express");
const router = express.Router();
const tagCtrl = require("../controllers/tagController");
const auth = require("../middleware/auth");

router.get("/", tagCtrl.list);
router.post("/", auth, tagCtrl.createTag);

module.exports = router;
