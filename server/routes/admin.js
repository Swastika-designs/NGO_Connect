const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const NGO = require('../models/NGO');
const Donation = require('../models/Donation');
const VolunteerInterest = require('../models/VolunteerInterest');

// GET /api/admin/users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/admin/users/:id/block — block/unblock user
router.put('/users/:id/block', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot block admin' });
    user.isVerified = !user.isVerified; // repurpose isVerified as active status for now
    // Add blocked field if needed — for now toggle a blocked field
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success: true, user, message: user.isBlocked ? 'User blocked' : 'User unblocked' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/stats — full admin stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalNGOs, pendingNGOs, approvedNGOs, blockedNGOs, tier1, tier2, tier3, totalDonations, agg] = await Promise.all([
      User.countDocuments(),
      NGO.countDocuments(),
      NGO.countDocuments({ isApproved: false }),
      NGO.countDocuments({ isApproved: true }),
      NGO.countDocuments({ isBlocked: true }),
      NGO.countDocuments({ verificationTier: 1 }),
      NGO.countDocuments({ verificationTier: 2 }),
      NGO.countDocuments({ verificationTier: 3 }),
      Donation.countDocuments({ status: 'completed' }),
      Donation.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);
    const byRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    res.json({
      success: true,
      stats: {
        totalUsers, totalNGOs, pendingNGOs, approvedNGOs, blockedNGOs,
        tier1NGOs: tier1, tier2NGOs: tier2, tier3NGOs: tier3,
        totalDonations, totalAmount: agg[0]?.total || 0,
        usersByRole: Object.fromEntries(byRole.map(r => [r._id, r.count])),
      }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/admin/volunteer-interests/:id
router.put('/volunteer-interests/:id', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const interest = await VolunteerInterest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!interest) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, interest });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
