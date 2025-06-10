/**
 * Dinner Plan Controller
 * Handles creation, participation tracking, voting, and result calculation for restaurant matching.
 */

const DinnerPlan = require('../models/DinnerPlan');

// Create a new dinner plan for a group of users
const createDinnerPlan = async (req, res) => {
  const {
    creator, group, budget, diningStyle, cuisines,
    streetAddress, city, state, zipCode, radius, matchType
  } = req.body;

  const allParticipants = [creator, ...group];

  try {
    // Prevent users from joining multiple active plans
    const existingPlans = await DinnerPlan.find({
      $or: [
        { creator: { $in: allParticipants } },
        { group: { $in: allParticipants } }
      ]
    });

    if (existingPlans.length > 0) {
      return res.status(400).json({
        message: "One or more users are already in an active dinner plan."
      });
    }

    // Save new dinner plan
    const newDinnerPlan = new DinnerPlan({
      creator, group, budget, diningStyle, cuisines,
      streetAddress, city, state, zipCode, radius, matchType,
      votes: [], done: [], matchedRestaurant: null
    });

    await newDinnerPlan.save();

    return res.status(201).json({
      message: "Dinner plan created successfully.",
      plan: newDinnerPlan
    });

  } catch (err) {
    console.error("❌ Error creating dinner plan:", err);
    return res.status(500).json({ message: "Server error while creating dinner plan." });
  }
};

// Fetch the active dinner plan for a user
const getDinnerPlanForUser = async (req, res) => {
  try {
    const userId = req.query.userId;

    const plan = await DinnerPlan.findOne({
      $or: [{ creator: userId }, { group: userId }]
    });

    res.status(plan ? 200 : 404).json(plan || null);
  } catch (error) {
    console.error("Error fetching dinner plan for user:", error);
    res.status(500).json({ error: "Failed to fetch dinner plan." });
  }
};

// Return matching preferences + voting progress for a group
const getMatchingDetails = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const plan = await DinnerPlan.findOne({
      $or: [{ creator: userId }, { group: userId }]
    });

    if (!plan) return res.status(404).json({ message: "No dinner plan found for this user." });

    const { creator, group, done, votes, createdAt, ...matchingDetails } = plan.toObject();

    res.status(200).json({ matchingDetails, creator, group, done });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch matching details." });
  }
};

// Update vote for a restaurant by a user
const updateVote = async (req, res) => {
  const { userId, restaurantId, voteValue, restaurantDetails } = req.body;

  try {
    const plan = await DinnerPlan.findOne({
      $or: [{ creator: userId }, { group: userId }]
    });

    if (!plan) return res.status(404).json({ error: "Dinner plan not found" });

    let updated = false;

    // Try updating score in existing votes
    plan.votes = plan.votes.map(innerArr => 
      innerArr.map(restaurant => {
        if (restaurant.id === restaurantId) {
          updated = true;
          return { ...restaurant, score: (restaurant.score || 0) + voteValue };
        }
        return restaurant;
      })
    );

    // If not found, add as new vote entry
    if (!updated) {
      const newRestaurant = { ...restaurantDetails, id: restaurantId, score: voteValue };
      plan.votes.push([newRestaurant]);
    }

    await plan.save();
    res.status(200).json({ message: "Vote processed successfully" });
  } catch (error) {
    console.error("Error updating vote:", error);
    res.status(500).json({ error: "Failed to update vote" });
  }
};

// Mark user as finished voting
const markUserDone = async (req, res) => {
  const { userId } = req.body;

  try {
    const plan = await DinnerPlan.findOne({
      $or: [{ creator: userId }, { group: userId }]
    });

    if (!plan) return res.status(404).json({ error: "Dinner plan not found" });

    if (!plan.done.includes(userId)) {
      plan.done.push(userId);
      await plan.save();
    }

    res.status(200).json({ message: "User marked as done" });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark user as done" });
  }
};

// Compute final match if all users are done
const getMatchResult = async (req, res) => {
  const { userId } = req.params;

  try {
    const plan = await DinnerPlan.findOne({
      $or: [{ creator: userId }, { group: userId }]
    });

    if (!plan) return res.status(404).json({ error: "Dinner plan not found" });

    const totalUsers = 1 + plan.group.length;
    if (plan.done.length < totalUsers) {
      return res.status(400).json({ error: "Not all users are done voting yet." });
    }

    const flattenedVotes = plan.votes.flat();
    if (flattenedVotes.length === 0) {
      return res.status(404).json({ error: "No votes found" });
    }

    // Select restaurant with highest score (must meet minimum threshold)
    let topRestaurant = null;
    let maxScore = 0;

    for (const restaurant of flattenedVotes) {
      if (restaurant.score >= totalUsers && restaurant.score > maxScore) {
        topRestaurant = restaurant;
        maxScore = restaurant.score;
      }
    }

    if (!topRestaurant) {
      return res.status(404).json({ error: "No restaurant received enough votes (minimum 2)." });
    }

    return res.status(200).json(topRestaurant);
  } catch (error) {
    console.error("Error determining match result:", error);
    res.status(500).json({ error: "Failed to determine match result" });
  }
};

// Delete a user's dinner plan
const deleteDinnerPlanByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const deleted = await DinnerPlan.findOneAndDelete({
      $or: [{ creator: userId }, { group: userId }]
    });

    if (!deleted) {
      return res.status(404).json({ error: "Dinner plan not found" });
    }

    res.status(200).json({ message: "Dinner plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting dinner plan:", error);
    res.status(500).json({ error: "Failed to delete dinner plan" });
  }
};

// Save list of restaurant candidates
const saveRestaurants = async (req, res) => {
  try {
    const { userId, restaurants } = req.body;

    if (!userId || !Array.isArray(restaurants)) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const dinnerPlan = await DinnerPlan.findOne({
      $or: [{ creator: userId }, { group: userId }]
    });

    if (!dinnerPlan) {
      return res.status(404).json({ error: "Dinner plan not found" });
    }

    dinnerPlan.matchingDetails.restaurants = restaurants;
    await dinnerPlan.save();

    res.status(200).json({ message: "Restaurants saved successfully" });
  } catch (error) {
    console.error("Error saving restaurants:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createDinnerPlan,
  getDinnerPlanForUser,
  getMatchingDetails,
  updateVote,
  markUserDone,
  deleteDinnerPlanByUser,
  getMatchResult,
  saveRestaurants
};
