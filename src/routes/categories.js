const express = require("express");
const router = express.Router();
const categoryCtrl = require("../controllers/categoryController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/roles");

router.get("/", categoryCtrl.list);
router.post("/", auth, authorize(["admin","editor","user"]), categoryCtrl.createCategory);

module.exports = router;
