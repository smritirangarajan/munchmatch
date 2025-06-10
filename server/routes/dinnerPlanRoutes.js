const express = require("express");
const router = express.Router();
const {
  createDinnerPlan,
  getDinnerPlanForUser, 
  getMatchingDetails,
  updateVote,
  markUserDone,
  deleteDinnerPlanByUser,
  getMatchResult,
  saveRestaurants
} = require("../controllers/dinnerPlanController");

router.post("/", createDinnerPlan);
router.get("/user", getDinnerPlanForUser); // ✅ Add this
router.get("/get-matching-details", getMatchingDetails); 
router.patch("/update-vote", updateVote);
router.patch("/mark-user-done", markUserDone);
router.delete("/delete/:userId", deleteDinnerPlanByUser);
router.get("/match-result/:userId", getMatchResult);
router.post("/save-restaurants", saveRestaurants);

module.exports = router;
