const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ngoController');
const { protect, authorize } = require('../middleware/auth');
const VolunteerInterest = require('../models/VolunteerInterest');

router.get('/', ctrl.getNGOs);
router.get('/pending', protect, authorize('admin'), ctrl.getPendingNGOs);
router.get('/all', protect, authorize('admin'), ctrl.getAllNGOs);
router.get('/mine', protect, authorize('ngo', 'admin'), ctrl.getMyNGO);

// Documents
router.post('/documents', protect, authorize('ngo'), ctrl.addDocument);
router.put('/:id/documents/verify', protect, authorize('admin'), ctrl.verifyDocument);

// Attendance
router.post('/:id/attendance/:eventId', protect, authorize('ngo'), ctrl.markAttendance);
router.get('/:id/attendance/:eventId', protect, authorize('ngo', 'admin'), ctrl.getAttendance);
// Volunteer can see their own attendance record for an event
router.get('/:id/my-attendance/:eventId', protect, authorize('volunteer'), async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    const record = ngo.attendance.find(a =>
      a.event?.toString() === req.params.eventId &&
      a.volunteer?.toString() === req.user._id.toString()
    );
    res.json({ success: true, record: record || null });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Volunteer interest
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
    const interests = await VolunteerInterest.find({ ngo: req.params.id })
      .populate('volunteer', 'name email skills availability avatar').sort({ createdAt: -1 });
    res.json({ success: true, interests });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// NGO Needs
const NGO = require('../models/NGO');
router.post('/:id/needs', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    if (ngo.createdBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    ngo.ngoNeeds.push(req.body);
    await ngo.save();
    res.json({ success: true, ngoNeeds: ngo.ngoNeeds });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.delete('/:id/needs/:needId', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    ngo.ngoNeeds = ngo.ngoNeeds.filter(n => n._id?.toString() !== req.params.needId);
    await ngo.save();
    res.json({ success: true, ngoNeeds: ngo.ngoNeeds });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', ctrl.getNGO);
router.post('/', protect, authorize('ngo', 'admin'), ctrl.createNGO);
router.put('/:id/approve', protect, authorize('admin'), ctrl.approveNGO);
router.put('/:id/tier', protect, authorize('admin'), ctrl.setTier);
router.put('/:id/block', protect, authorize('admin'), ctrl.toggleBlock);
router.put('/:id', protect, authorize('ngo', 'admin'), ctrl.updateNGO);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteNGO);

module.exports = router;
