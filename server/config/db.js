const mongoose = require("mongoose");
const mysql = require("mysql2");
require("dotenv").config();

// MongoDB connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://testuser:TestPassword123@cluster0.vfqykes.mongodb.net/munch?retryWrites=true&w=majority&appName=Cluster0', {
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




