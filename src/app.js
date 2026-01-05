require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/database");

const apiRoutes = require("./routes/api");
const webRoutes = require("./routes/web");

const app = express();

// Custom CSP configuration for Helmet
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
    scriptSrc: ["'self'"], // Only allow scripts from same origin
    scriptSrcAttr: ["'none'"], // Disallow inline event handlers
    fontSrc: ["'self'", "data:"],
    imgSrc: ["'self'", "data:"],
  },
};

// Middleware
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? cspConfig : false,
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to MongoDB
connectDB().then((connected) => {
  if (!connected && process.env.NODE_ENV !== "test") {
    console.warn("Running without database connection");
  }
});

// Routes
app.use("/api", apiRoutes);
app.use("/", webRoutes);

// Serve index.html for root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// 404 handler for web routes
app.use("*", (req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Page Not Found</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 40px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          text-align: center;
          max-width: 500px;
        }
        h1 { color: #e53e3e; margin-bottom: 20px; }
        p { color: #666; margin-bottom: 20px; }
        a { 
          color: #667eea; 
          text-decoration: none;
          font-weight: bold;
        }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <p><a href="/">Go back to home</a></p>
      </div>
    </body>
    </html>
  `);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (req.path.startsWith("/api")) {
    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } else {
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 500px;
          }
          h1 { color: #e53e3e; margin-bottom: 20px; }
          p { color: #666; margin-bottom: 20px; }
          a { 
            color: #667eea; 
            text-decoration: none;
            font-weight: bold;
          }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Internal Server Error</h1>
          <p>Something went wrong. Please try again later.</p>
          <p><a href="/">Go back to home</a></p>
        </div>
      </body>
      </html>
    `);
  }
});

const PORT = process.env.PORT || 3000;

// For Vercel, export the app
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // For local development
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(
      `Test mode: ${process.env.TEST_MODE === "1" ? "ENABLED" : "DISABLED"}`
    );
  });
}
