const DinnerPlan = require("../models/DinnerPlan");
 
 const ratingVotes = {}; // Stores user ratings temporarily
 
 const ratingMatch = async (planId, userId, restaurantId, rating) => {
   const plan = await DinnerPlan.findById(planId);
   if (!plan) throw new Error("Dinner plan not found.");
 
   // Only proceed if the selected match type is 'rating'
   if (plan.matchType !== "rating") return { error: "Rating-based matching is not selected for this plan." };
 
   const key = `${planId}:${restaurantId}`;
   if (!ratingVotes[key]) ratingVotes[key] = {};
 
   ratingVotes[key][userId] = rating;
 
   const totalUsers = plan.group.length + 1; // Including the creator
 
   // Check if all users have voted
   if (Object.keys(ratingVotes[key]).length === totalUsers) {
     // Calculate average ratings for all restaurants
     const restaurantRatings = {};
 
     for (const restaurantKey in ratingVotes) {
       const ratings = Object.values(ratingVotes[restaurantKey]);
       const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
       restaurantRatings[restaurantKey] = avgRating;
     }
 
     // Find the highest-rated restaurant
     const bestMatch = Object.keys(restaurantRatings).reduce((a, b) =>
       restaurantRatings[a] > restaurantRatings[b] ? a : b
     );
 
     return { matched: true, restaurantId: bestMatch };
   }
 
   return { pending: true };
 };
 
 module.exports = { ratingMatch };