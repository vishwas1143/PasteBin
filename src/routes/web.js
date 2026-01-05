const express = require("express");
const router = express.Router();
const { viewPaste } = require("../controllers/viewController");
const path = require("path");

// Serve static files from public directory
router.use(express.static("public"));

// View paste page
router.get("/p/:id", viewPaste);

module.exports = router;
