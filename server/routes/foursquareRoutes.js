const express = require("express");
 const router = express.Router();
 const {
   findMatches
 } = require("../utils/foursquare");
 
 router.get("/find-matches", findMatches);
 
 module.exports = router;