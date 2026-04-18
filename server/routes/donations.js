const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { ngo, amount, message, isAnonymous, paymentMethod } = req.body;
    if (!ngo || !amount) return res.status(400).json({ message: 'NGO and amount are required' });
    const donation = await Donation.create({ donor: req.user._id, ngo, amount, message, isAnonymous: isAnonymous || false, paymentMethod: paymentMethod || 'upi' });
    await donation.populate('ngo', 'name logo'); await donation.populate('donor', 'name avatar');
    res.status(201).json({ success: true, donation });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/my', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id }).populate('ngo', 'name logo category').sort({ createdAt: -1 });
    res.json({ success: true, count: donations.length, donations });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/ngo/:ngoId', async (req, res) => {
  try {
    const donations = await Donation.find({ ngo: req.params.ngoId, status: 'completed' }).populate('donor', 'name avatar').sort({ createdAt: -1 }).limit(20);
    const filtered = donations.map(d => ({ ...d.toObject(), donor: d.isAnonymous ? { name: 'Anonymous', avatar: '' } : d.donor }));
    res.json({ success: true, donations: filtered });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
