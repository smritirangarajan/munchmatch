const User = require("../models/User");

/**
 * Fetch all incoming friend requests for a user.
 * - Looks up the user by `userId` and populates their `friendRequests` field.
 */
const getIncomingRequests = async (req, res) => {
  const { userId } = req.query;

  try {
    const user = await User.findOne({ userId }).populate('friendRequests');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ requests: user.friendRequests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Search for a user to add as a friend.
 * - Finds users by exact `userId` match.
 * - Only returns essential fields to the client.
 */
const findFriend = async (req, res) => {
  const { username } = req.query;
  const currentUserId = req.userId || req.headers["user-id"];

  try {
    const users = await User.find({ userId: username }).select('name userId _id');

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Send a friend request from one user to another.
 * - Prevents sending to self.
 * - Prevents duplicate requests or adding an existing friend.
 */
const sendFriendRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    const sender = await User.findOne({ userId: senderId });
    const receiver = await User.findOne({ _id: receiverId });

    if (!sender || !receiver)
      return res.status(404).json({ message: "User(s) not found" });

    if (sender.userId === receiver.userId)
      return res.status(400).json({ message: "Cannot send friend request to yourself" });

    if (receiver.friendRequests.includes(sender._id))
      return res.status(400).json({ message: "Request already sent" });

    if (sender.friends.includes(receiver._id))
      return res.status(400).json({ message: "Already friends" });

    receiver.friendRequests.push(sender._id);
    await receiver.save();

    res.status(200).json({ message: "Friend request sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Accept a friend request and update both users’ friend lists.
 * - Removes sender from receiver’s pending requests.
 * - Adds each user to the other's `friends` list.
 */
const acceptFriendRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    const user = await User.findOne({ userId: receiverId });
    const requester = await User.findOne({ userId: senderId });

    if (!user || !requester)
      return res.status(404).json({ message: "User(s) not found" });

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

/**
 * Get list of a user's current friends.
 * - Populates the friend documents to include name and userId.
 * - Returns a simplified list with `id` and `name`.
 */
const getFriends = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    const user = await User.findOne({ userId }).populate('friends', 'userId name');
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const friendList = user.friends.map(friend => ({
      id: friend.userId,
      name: friend.name
    }));

    res.status(200).json(friendList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch friends.' });
  }
};

/**
 * Decline a received friend request.
 * - Removes the request if it exists.
 */
const declineFriendRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    const receiver = await User.findOne({ userId: receiverId });
    const sender = await User.findOne({ userId: senderId });

    if (!receiver || !sender)
      return res.status(404).json({ message: "User(s) not found." });

    const initialLength = receiver.friendRequests.length;

    receiver.friendRequests = receiver.friendRequests.filter(
      id => id.toString() !== sender._id.toString()
    );

    if (receiver.friendRequests.length === initialLength)
      return res.status(404).json({ message: "Friend request not found." });

    await receiver.save();
    res.status(200).json({ message: "Friend request declined." });
  } catch (err) {
    console.error("Error declining friend request:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  findFriend,
  sendFriendRequest,
  acceptFriendRequest,
  getIncomingRequests,
  getFriends,
  declineFriendRequest
};
