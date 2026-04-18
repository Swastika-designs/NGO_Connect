const express = require('express');
const router = express.Router();
const { getNGOs, getAllNGOs, getMyNGO, getNGO, createNGO, updateNGO, deleteNGO, getPendingNGOs, approveNGO } = require('../controllers/ngoController');
const { protect, authorize } = require('../middleware/auth');
const VolunteerInterest = require('../models/VolunteerInterest');

router.get('/', getNGOs);
router.get('/pending', protect, authorize('admin'), getPendingNGOs);
router.get('/all', protect, authorize('admin'), getAllNGOs);
router.get('/mine', protect, authorize('ngo', 'admin'), getMyNGO);

// Volunteer interest routes
router.post('/:id/volunteer-interest', protect, authorize('volunteer'), async (req, res) => {
  try {
    const { message, skills, availability } = req.body;
    const existing = await VolunteerInterest.findOne({ volunteer: req.user._id, ngo: req.params.id });
    if (existing) return res.status(400).json({ message: 'You have already expressed interest in this NGO' });
    const interest = await VolunteerInterest.create({ volunteer: req.user._id, ngo: req.params.id, message, skills, availability });
    res.status(201).json({ success: true, interest });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id/volunteer-interests', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const interests = await VolunteerInterest.find({ ngo: req.params.id }).populate('volunteer', 'name email skills availability').sort({ createdAt: -1 });
    res.json({ success: true, interests });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', getNGO);
router.post('/', protect, authorize('ngo', 'admin'), createNGO);
router.put('/:id/approve', protect, authorize('admin'), approveNGO);
router.put('/:id', protect, authorize('ngo', 'admin'), updateNGO);
router.delete('/:id', protect, authorize('admin'), deleteNGO);

module.exports = router;
