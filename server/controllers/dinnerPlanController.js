const DinnerPlan = require('../models/DinnerPlan');

const createDinnerPlan = async (req, res) => {
  const {
    creator,
    group,
    budget,
    diningStyle,
    cuisines,
    streetAddress,
    city,
    state,
    zipCode,
    radius,
    matchType
  } = req.body;

  const allParticipants = [creator, ...group];

  try {
    // ✅ Check if any user is already in a dinner plan
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

    // ✅ Create and save the new dinner plan
    const newDinnerPlan = new DinnerPlan({
      creator,
      group,
      budget,
      diningStyle,
      cuisines,
      streetAddress,
      city,
      state,
      zipCode,
      radius,
      matchType,
      votes: [],
      done: [],
      matchedRestaurant: null
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

// ✅ NEW CONTROLLER
const getDinnerPlanForUser = async (req, res) => {
  console.log("NEW CONTROLLER")
  try {
    const userId = req.query.userId;
    console.log(userId)

    const plan = await DinnerPlan.findOne({
      $or: [
        { creator: userId },
        { group: userId }
      ]
    });

    if (plan) {
      res.status(200).json(plan);
    } else {
      res.status(404).json(null); // No plan found
    }
  } catch (error) {
    console.error("Error fetching dinner plan for user:", error);
    res.status(500).json({ error: "Failed to fetch dinner plan." });
  }
};
const getMatchingDetails = async (req, res) => {
  try {
    const userId = req.query.userId;

    // If userId is not provided, send error response
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    console.log("Fetching matching details for user:", userId);

    // Find the dinner plan where the user is either the creator or in the group
    const plan = await DinnerPlan.findOne({
      $or: [
        { creator: userId },  // Check if the user is the creator
        { group: userId }      // Check if the user is in the group
      ]
    });

    if (plan) {
      // Return the dinner plan matching details along with creator, group, and done fields
      const { creator, group, done, votes, createdAt, ...matchingDetails } = plan.toObject();
    
      // Add the creator, group, and done fields to the response
      res.status(200).json({
        matchingDetails,
        creator,
        group,
        done,
      });
    
      console.log("Matching details found:", matchingDetails);
    } else {
      // If no plan is found, return a 404 with a message
      console.log("No dinner plan found for the user.");
      res.status(404).json({ message: "No dinner plan found for this user." });
    }
    
  } catch (error) {
    // Handle server errors
    console.error("Error fetching matching details:", error);
    res.status(500).json({ error: "Failed to fetch matching details." });
  }
};

const updateVote = async (req, res) => {
  console.log("Updating vote...");
  const { userId, restaurantId, voteValue, restaurantDetails } = req.body;

  try {
    const plan = await DinnerPlan.findOne({
      $or: [{ creator: userId }, { group: userId }]
    });

    if (!plan) {
      return res.status(404).json({ error: "Dinner plan not found" });
    }

    let updated = false;

    // Look for the restaurant and update the score if found
    plan.votes = plan.votes.map(innerArr => {
      return innerArr.map(restaurant => {
        if (restaurant.id === restaurantId) {
          updated = true;
          return {
            ...restaurant,
            score: (restaurant.score || 0) + voteValue
          };
        }
        return restaurant;
      });
    });

    // If not found, add it in a new inner array
    if (!updated) {
      const newRestaurant = {
        ...restaurantDetails,
        id: restaurantId,
        score: voteValue
      };
      plan.votes.push([newRestaurant]); // Push into a new inner array
    }

    await plan.save();
    res.status(200).json({ message: "Vote processed successfully" });
  } catch (error) {
    console.error("Error updating vote:", error);
    res.status(500).json({ error: "Failed to update vote" });
  }
};

const markUserDone = async (req, res) => {
  const { userId } = req.body;

  try {
    const plan = await DinnerPlan.findOne({
      $or: [{ creator: userId }, { group: userId }]
    });

    if (!plan) {
      return res.status(404).json({ error: "Dinner plan not found" });
    } 
    
    // Only mark as done if not already done
    if (!plan.done.includes(userId)) {
      plan.done.push(userId);
      await plan.save();
    }

    res.status(200).json({ message: "User marked as done" });
  } catch (error) {
    console.error("Error marking user as done:", error);
    res.status(500).json({ error: "Failed to mark user as done" });
  }
};


const getDinnerPlanByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const plan = await DinnerPlan.findOne({
      $or: [{ creator: userId }, { group: userId }]
    });

    if (!plan) {
      return res.status(404).json({ error: "Dinner plan not found" });
    }

    res.status(200).json(plan);
  } catch (error) {
    console.error("Error getting dinner plan:", error);
    res.status(500).json({ error: "Failed to get dinner plan" });
  }
};

const getDinnerPlanByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const plan = await DinnerPlan.findOne({
      $or: [{ creator: userId }, { group: userId }]
    });

    if (!plan) {
      return res.status(404).json({ error: "Dinner plan not found" });
    }

    res.status(200).json(plan);
  } catch (error) {
    console.error("Error fetching dinner plan:", error);
    res.status(500).json({ error: "Failed to fetch dinner plan" });
  }
};

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

// Determine the top restaurant after all users are done
const getMatchResult = async (req, res) => {
  const { userId } = req.params;

  try {
    const plan = await DinnerPlan.findOne({
      $or: [{ creator: userId }, { group: userId }]
    });

    if (!plan) {
      return res.status(404).json({ error: "Dinner plan not found" });
    }

    const totalUsers = 1 + plan.group.length;

    if (plan.done.length < totalUsers) {
      return res.status(400).json({ error: "Not all users are done voting yet." });
    }

    const flattenedVotes = plan.votes.flat(); // flatten the nested arrays
    if (flattenedVotes.length === 0) {
      return res.status(404).json({ error: "No votes found" });
    }

    // Find restaurant with highest score (min score of 2)
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

const saveRestaurants = async (req, res) => {
  try {
    const { userId, restaurants } = req.body;

    if (!userId || !Array.isArray(restaurants)) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Find the dinner plan that includes this user
    const dinnerPlan = await DinnerPlan.findOne({
      $or: [
        { "creator.userId": userId },
        { "group.userId": userId }
      ]
    });

    if (!dinnerPlan) {
      return res.status(404).json({ error: "Dinner plan not found" });
    }

    // Save restaurants in matchingDetails
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
  getDinnerPlanByUserId,
  getDinnerPlanByUser,
  deleteDinnerPlanByUser,
  getMatchResult,
  saveRestaurants
};