const mongoose = require("mongoose");
const mysql = require("mysql2");

// MongoDB connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  }
};


module.exports = { connectMongoDB};




