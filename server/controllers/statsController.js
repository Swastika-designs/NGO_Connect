const NGO = require('../models/NGO');
const User = require('../models/User');
const Donation = require('../models/Donation');

exports.getStats = async (req, res) => {
  try {
    const [totalNGOs, totalUsers, totalDonations, agg] = await Promise.all([
      NGO.countDocuments({ isActive: true, isApproved: true }),
      User.countDocuments(),
      Donation.countDocuments({ status: 'completed' }),
      Donation.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, totalAmount: { $sum: '$amount' } } }])
    ]);
    res.json({ success: true, stats: { totalNGOs, totalUsers, totalDonations, totalAmount: agg[0]?.totalAmount || 0 } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
