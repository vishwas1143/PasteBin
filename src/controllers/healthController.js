const { connectDB } = require("../config/database");

const healthCheck = async (req, res) => {
  try {
    const dbConnected = await connectDB();

    res.status(200).json({
      ok: true,
      timestamp: new Date().toISOString(),
      database: dbConnected ? "connected" : "disconnected",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Health check failed",
      details: error.message,
    });
  }
};

module.exports = { healthCheck };
