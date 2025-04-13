// /server/routes/friends.js

const express = require("express");
const router = express.Router();
const {findFriend, sendFriendRequest, acceptFriendRequest, getIncomingRequests, getFriends, declineFriendRequest} = require("../controllers/friendController");

// Find a friend by userId
router.get("/find-friends", findFriend);

// Send a friend request
router.post("/send-request", sendFriendRequest);

// Accept a friend request
router.post("/accept-request", acceptFriendRequest);

// Get incoming friend requests for a user
router.get("/requests", getIncomingRequests);

router.get('/dinner-friend', getFriends);

router.post('/decline', declineFriendRequest);

module.exports = router;

