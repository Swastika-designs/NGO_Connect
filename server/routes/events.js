const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const NGO = require('../models/NGO');
const { protect, authorize } = require('../middleware/auth');

// GET /api/events - list events (optionally filter by createdBy ngo id, or "me" for the NGO of the logged-in user)
router.get('/', async (req, res) => {
  try {
    const { createdBy, status, limit = 20, page = 1 } = req.query;
    const query = {};
    if (status) query.status = status;
    else query.status = 'published';
    if (createdBy) query.createdBy = createdBy;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('createdBy', 'name logo category location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json({ success: true, count: events.length, total, events });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/events/my-ngo — events created by the logged-in user's NGO
router.get('/my-ngo', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const ngo = await NGO.findOne({ createdBy: req.user._id });
    if (!ngo) return res.json({ success: true, events: [] });
    const events = await Event.find({ createdBy: ngo._id }).sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name logo category location contact')
      .populate('applicants', 'name email avatar');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ success: true, event });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/events — create event (ngo only)
router.post('/', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    // Find the NGO created by this user
    const ngo = await NGO.findOne({ createdBy: req.user._id });
    if (!ngo) return res.status(400).json({ message: 'You must have a registered NGO to post events' });
    const event = await Event.create({ ...req.body, createdBy: ngo._id });
    res.status(201).json({ success: true, event });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/events/:id/apply — volunteer applies
router.post('/:id/apply', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.applicants.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already applied for this event' });
    }
    event.applicants.push(req.user._id);
    await event.save();
    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/events/:id — update event
router.put('/:id', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ success: true, event });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
