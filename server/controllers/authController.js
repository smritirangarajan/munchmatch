const express = require("express");
const cors = require("cors");

const {connectMongoDB} = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Connect to databases
connectMongoDB();

// Routes
app.get("/", (req, res) => {
  res.send("Backend is up and running 🚀");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

const authRoutes = require("./routes/authRoutes");
const friendRoutes = require("./routes/friendRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/friends", friendRoutes);

const userRoutes = require('./routes/userRoutes');
const dinnerPlanRoutes = require('./routes/dinnerPlanRoutes');

app.use('/api/users', userRoutes);
app.use('/api/dinner-plan', dinnerPlanRoutes);

const matchRoutes = require("./routes/matchRoutes");
app.use("/api/match", matchRoutes);


const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  const { name, userId, password, confirmPassword, dietaryRestrictions } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  try {
    const existingUser = await User.findOne({ userId });
    if (existingUser) return res.status(400).json({ message: "User ID already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      userId,
      password: hashedPassword,
      dietaryRestrictions,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during sign up." });
  }
};

const login = async (req, res) => {
  const { userId, password } = req.body;

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user._id }, 'your_secure_jwt_secret', {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "Login successful!", token, userId: user.userId });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

module.exports = { signup, login };