const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/auth');

// GET all feedback (admin)
router.get('/', protect, async (req, res) => {
  try {
    const feedback = await Feedback.find().populate('user','name role').sort({ createdAt:-1 }).limit(50);
    res.json({ success:true, feedback });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST new feedback (any logged in user)
router.post('/', protect, async (req, res) => {
  try {
    const { message, rating } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });
    const fb = await Feedback.create({
      user: req.user._id,
      name: req.user.name,
      message,
      rating: rating || 5,
      role: req.user.role,
    });
    res.status(201).json({ success:true, feedback: fb });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
