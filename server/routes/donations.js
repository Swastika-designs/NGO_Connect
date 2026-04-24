const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { ngo, amount, message, isAnonymous, paymentMethod,
            donationType, goodsCategory, goodsDescription, goodsQuantity,
            pickupMethod, pickupAddress, pickupDate } = req.body;
    if (!ngo) return res.status(400).json({ message: 'NGO is required' });
    if (donationType === 'money' && (!amount || amount < 1))
      return res.status(400).json({ message: 'Amount is required for money donation' });
    if (donationType === 'goods' && !goodsDescription)
      return res.status(400).json({ message: 'Goods description is required' });

    const donation = await Donation.create({
      donor: req.user._id, ngo,
      donationType: donationType || 'money',
      amount: donationType === 'money' ? amount : 0,
      currency: 'INR',
      paymentMethod: donationType === 'money' ? (paymentMethod || 'upi') : undefined,
      goodsCategory, goodsDescription, goodsQuantity,
      pickupMethod: donationType === 'goods' ? (pickupMethod || 'donor_dropoff') : undefined,
      pickupAddress: donationType === 'goods' ? pickupAddress : undefined,
      pickupDate: donationType === 'goods' && pickupDate ? new Date(pickupDate) : undefined,
      message, isAnonymous: isAnonymous || false,
    });
    await donation.populate('ngo', 'name logo');
    await donation.populate('donor', 'name avatar');
    res.status(201).json({ success: true, donation });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/my', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('ngo', 'name logo category').sort({ createdAt: -1 });
    res.json({ success: true, count: donations.length, donations });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/ngo/:ngoId', async (req, res) => {
  try {
    const donations = await Donation.find({ ngo: req.params.ngoId, status: 'completed' })
      .populate('donor', 'name avatar').sort({ createdAt: -1 }).limit(20);
    const filtered = donations.map(d => ({
      ...d.toObject(),
      donor: d.isAnonymous ? { name: 'Anonymous', avatar: '' } : d.donor
    }));
    res.json({ success: true, donations: filtered });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
