const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectMongoDB } = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

console.log('Environment Variables:', {
  MONGO_URI: process.env.MONGO_URI,
  DB_USER: process.env.DB_USER,
  PORT: process.env.PORT
});

// Connect to MongoDB
connectMongoDB();

// Routes
const authRoutes = require("./routes/authRoutes");
const friendRoutes = require("./routes/friendRoutes");
//const userRoutes = require("./routes/userRoutes");
const dinnerPlanRoutes = require("./routes/dinnerPlanRoutes");
const matches = require("./routes/foursquareRoutes")
const matchRoutes = require("./routes/matchRoutes");


app.get("/", (req, res) => {
  res.send("Backend is up and running 🚀");
});

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/friends", friendRoutes);
//app.use("/api/users", userRoutes);
app.use("/api/dinner-plan", dinnerPlanRoutes);
app.use("/api/foursquare", matches)
//app.use("/api/match", matchRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
