const User = require("../models/User");

// Improved controller implementations
const getIncomingRequests = async (req, res) => {
    const { userId } = req.query;
  
    try {
        const user = await User.findOne({ userId }).populate('friendRequests');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
  
        res.status(200).json({ requests: user.friendRequests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
const findFriend = async (req, res) => {
    const { username } = req.query;
    const currentUserId = req.userId || req.headers["user-id"]; // however you're identifying current user
  
    try {
      const users = await User.find({
        userId: username, // case-insensitive match
      }).select('name userId _id'); // select all the fields needed
  
      if (users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }
  
      res.status(200).json({ users });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  };

const sendFriendRequest = async (req, res) => {
    const { senderId, receiverId } = req.body;
    console.log("doing")
    console.log(senderId)
    try {
        const sender = await User.findOne({ userId: senderId });
        const receiver = await User.findOne({_id: receiverId });
        

        if (!sender || !receiver) {
            console.log("generating")
            return res.status(404).json({ message: "User(s) not found" });
        }

        if (receiver.friendRequests.includes(sender._id)) {
            return res.status(400).json({ message: "Request already sent" });
        }

        if (sender.friends.includes(receiver._id)) {
            return res.status(400).json({ message: "Already friends" });
        }

        receiver.friendRequests.push(sender._id);
        await receiver.save();

        res.status(200).json({ message: "Friend request sent" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const acceptFriendRequest = async (req, res) => {
    const { senderId, receiverId } = req.body; // Changed parameters for clarity
    console.log("sender" + senderId)
    console.log("receiver" + receiverId)
    try {
        const user = await User.findOne({ userId: receiverId });
        const requester = await User.findOne({userId: senderId});

        if (!user || !requester) {
            return res.status(404).json({ message: "User(s) not found" });
        }

        // Remove from requests and add to friends for both users
        user.friendRequests = user.friendRequests.filter(
            id => id.toString() !== requester._id.toString()
        );
        user.friends.push(requester._id);
        requester.friends.push(user._id);

        await user.save();
        await requester.save();

        res.status(200).json({ message: "Friend request accepted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};



// Function to get the current user's friends
const getFriends = async (req, res) => {
    try {
      const userId = req.query.userId;  // Get the userId from query params
  
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
  
      // Fetch the user document and populate the 'friends' field with name and userId
      const user = await User.findOne({ userId }).populate('friends', 'userId name');
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Map the populated friends data into a simpler object format
      const friendList = user.friends.map(friend => ({
        id: friend.userId,  // The friend's userId
        name: friend.name   // The friend's name
      }));
      friendList.forEach(friend => {
        console.log(friend.name);  // This will log the name of each friend
      });
      
  
      // Send the friend list as the response
      res.status(200).json(friendList);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch friends.' });
    }
  };

  const declineFriendRequest = async (req, res) => {
    const { senderId, receiverId } = req.body;
  
    try {
      const receiver = await User.findOne({ userId: receiverId });
      const sender = await User.findOne({ userId: senderId });
  
      if (!receiver || !sender) {
        return res.status(404).json({ message: "User(s) not found." });
      }
  
      const initialLength = receiver.friendRequests.length;
      receiver.friendRequests = receiver.friendRequests.filter(
        id => id.toString() !== sender._id.toString()
      );
  
      if (receiver.friendRequests.length === initialLength) {
        return res.status(404).json({ message: "Friend request not found." });
      }
  
      await receiver.save();
      res.status(200).json({ message: "Friend request declined." });
    } catch (err) {
      console.error("Error declining friend request:", err);
      res.status(500).json({ message: "Server error." });
    }
  };
  
module.exports = { findFriend, sendFriendRequest, acceptFriendRequest, getIncomingRequests, getFriends, declineFriendRequest};