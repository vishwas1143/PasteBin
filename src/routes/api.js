const express = require("express");
const router = express.Router();
const { healthCheck } = require("../controllers/healthController");
const { createPaste, getPaste } = require("../controllers/pasteController");
const { validatePaste } = require("../middleware/validation");

// Health check
router.get("/healthz", healthCheck);

// Create paste
router.post("/pastes", validatePaste, createPaste);

// Get paste
router.get("/pastes/:id", getPaste);

module.exports = router;
