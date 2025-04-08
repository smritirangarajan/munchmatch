const express = require("express");
const ratingMatch = require("../controllers/matchController");
const router = express.Router();

router.post("/rating-match", async (req, res) => {
  try {
    const { planId, userId, restaurantId, rating } = req.body;
    const result = await ratingMatch(planId, userId, restaurantId, rating);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;