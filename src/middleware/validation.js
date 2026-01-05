const validatePaste = (req, res, next) => {
  const { content, ttl_seconds, max_views } = req.body;

  // Validate content
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({
      error: "Content is required and must be a non-empty string",
    });
  }

  // Validate ttl_seconds if provided
  if (ttl_seconds !== undefined) {
    if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
      return res.status(400).json({
        error: "ttl_seconds must be an integer ≥ 1 if provided",
      });
    }
  }

  // Validate max_views if provided
  if (max_views !== undefined) {
    if (!Number.isInteger(max_views) || max_views < 1) {
      return res.status(400).json({
        error: "max_views must be an integer ≥ 1 if provided",
      });
    }
  }

  next();
};

const getTestTime = (req) => {
  if (process.env.TEST_MODE === "1" && req.headers["x-test-now-ms"]) {
    const testTimeMs = parseInt(req.headers["x-test-now-ms"], 10);
    if (!isNaN(testTimeMs)) {
      return new Date(testTimeMs);
    }
  }
  return new Date();
};

module.exports = { validatePaste, getTestTime };
