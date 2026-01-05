const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGODB_URI;

    // For Vercel deployment, use MongoDB Atlas
    if (process.env.VERCEL) {
      mongoURI = process.env.MONGODB_ATLAS_URI;
    }

    if (!mongoURI) {
      console.error("MongoDB URI not found in environment variables");
      return false;
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    return false;
  }
};

module.exports = { connectDB };
