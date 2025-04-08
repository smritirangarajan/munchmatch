// models/DinnerPlan.js
const mongoose = require('mongoose');

const dinnerPlanSchema = new mongoose.Schema({
  creator: { type: String, required: true }, // userId
  group: {
    type: [String], // userIds
    validate: [arr => arr.length >= 1 && arr.length <= 4, 'Group must have 1 to 4 members besides creator'],
  },
  budget: String,
  diningStyle: String,
  cuisines: [String],
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  radius: { type: Number, required: true },
  radius: Number,
  matchType: { type: String, enum: ["direct", "rating"], default: "direct" }, // Default to "direct"
  done:[String],
  votes: {
    type: [[{
      id: String,
      name: String,
      distance: Number,
      cuisine: String,
      diningStyle: String,
      budget: String,
      image: String,
      score: { type: Number, default: 0 } // ✅ Move score here
    }]],
    default: []
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DinnerPlan', dinnerPlanSchema);
