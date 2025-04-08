const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Signup route
router.post("/signup", async (req, res) => {
  const { name, userId, password, dietaryRestrictions } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ message: "User ID already taken" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      userId,
      password: hashedPassword,
      dietaryRestrictions,
    });

    // Save the user
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
    const { userId, password } = req.body;
  
    try {
      // Check if user exists
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      // Compare the password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      // Generate JWT token (you can adjust the expiry time as needed)
      const token = jwt.sign({ userId: user.userId }, 'your_secure_jwt_secret', {
        expiresIn: "1h", // Token expires in 1 hour
      });
  
      res.json({ token, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;