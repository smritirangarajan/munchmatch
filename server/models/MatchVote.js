const mongoose = require("mongoose");

const matchVoteSchema = new mongoose.Schema({
  dinnerPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "DinnerPlan", required: true },
  userId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  vote: { type: String, enum: ["yes", "no"], default: null },
  rating: { type: Number, min: 1, max: 5, default: null },
});

module.exports = mongoose.model("MatchVote", matchVoteSchema);