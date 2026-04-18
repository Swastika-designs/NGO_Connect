const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const VolunteerInterest = require('../models/VolunteerInterest');

// GET /api/admin/users — all users (no password)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/volunteer-interests/:id — update status (accept/reject)
router.put('/volunteer-interests/:id', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const interest = await VolunteerInterest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!interest) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, interest });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
