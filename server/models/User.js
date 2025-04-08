const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      unique: true, // ensures no two users have the same ID
    },
    password: {
      type: String,
      required: true,
    },
    dietaryRestrictions: {
      type: [String],
      enum: ["vegetarian", "vegan", "gluten-free"],
      default: [],
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  });
  
  module.exports = mongoose.model("User", UserSchema);
  