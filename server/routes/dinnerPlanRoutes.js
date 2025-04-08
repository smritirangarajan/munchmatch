const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/dinnerPlanController");

router.post("/", createDinnerPlan);
router.get("/user", getDinnerPlanForUser); // ✅ Add this
router.get("/get-matching-details", getMatchingDetails); 
router.patch("/update-vote", updateVote);
router.patch("/mark-user-done", markUserDone);
router.get("/get-by-user/:userId", getDinnerPlanByUserId);
router.get("/user/:userId", getDinnerPlanByUser);
router.delete("/delete/:userId", deleteDinnerPlanByUser);
router.get("/match-result/:userId", getMatchResult);
router.patch("/save-restaurants", saveRestaurants);

module.exports = router;
