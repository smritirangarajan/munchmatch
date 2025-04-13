const express = require('express');
 const router = express.Router();
 const User = require('../models/User');
 
 // Get current user's friends
 router.get('/friends', async (req, res) => {
   const userId = req.query.userId; // This should come from session/token ideally
 
   try {
     const user = await User.findOne({ userId });
     if (!user) return res.status(404).json({ error: 'User not found' });
     res.json(user.friends);
   } catch (err) {
     res.status(500).json({ error: 'Server error' });
   }
 });
 
 module.exports = router;