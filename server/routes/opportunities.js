const express = require('express');
const router  = express.Router();
const Opp     = require('../models/VolunteerOpportunity');
const NGO     = require('../models/NGO');
const { protect, authorize } = require('../middleware/auth');

// IMPORTANT: specific named routes MUST come before /:id to avoid param conflicts

// GET /api/opportunities — public listing
router.get('/', async (req, res) => {
  try {
    const { search, category, locationType, skills, status = 'open', ngoId, page = 1, limit = 12 } = req.query;
    const conditions = [{ status }];
    if (category)   conditions.push({ category });
    if (locationType) conditions.push({ locationType });
    if (ngoId)      conditions.push({ ngo: ngoId });
    if (skills) {
      const arr = skills.split(',').map(s => s.trim()).filter(Boolean);
      if (arr.length) conditions.push({ requiredSkills: { $in: arr } });
    }
    if (search && search.trim()) {
      const re = { $regex: search.trim(), $options: 'i' };
      conditions.push({ $or: [{ title: re }, { description: re }, { location: re }, { category: re }] });
    }
    const query = { $and: conditions };
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Opp.countDocuments(query);
    const opps  = await Opp.find(query)
      .populate('ngo', 'name logo category location verificationTier isVerified')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip).limit(parseInt(limit));
    res.json({ success: true, count: opps.length, total, pages: Math.ceil(total / parseInt(limit)), opportunities: opps });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/opportunities/my-ngo — NGO's own postings
router.get('/my-ngo', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const ngo = await NGO.findOne({ createdBy: req.user._id });
    if (!ngo) return res.json({ success: true, opportunities: [] });
    const opps = await Opp.find({ ngo: ngo._id }).sort({ createdAt: -1 });
    res.json({ success: true, opportunities: opps });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/opportunities/my-applications — volunteer's own applications
// MUST be before /:id
router.get('/my-applications', protect, authorize('volunteer'), async (req, res) => {
  try {
    const opps = await Opp.find({ 'applications.volunteer': req.user._id })
      .populate('ngo', 'name logo category verificationTier location')
      .sort({ updatedAt: -1 });
    const result = opps.map(opp => {
      const app = opp.applications.find(a => a.volunteer?.toString() === req.user._id.toString());
      return {
        _id:         opp._id,
        title:       opp.title,
        category:    opp.category,
        locationType:opp.locationType,
        location:    opp.location,
        commitmentType: opp.commitmentType,
        duration:    opp.duration,
        ngo:         opp.ngo,
        status:      opp.status,
        application: app,
      };
    });
    res.json({ success: true, applications: result });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/opportunities/:id — single opportunity
router.get('/:id', async (req, res) => {
  try {
    const opp = await Opp.findById(req.params.id)
      .populate('ngo', 'name logo category location contact verificationTier isVerified tags')
      .populate('applications.volunteer', 'name email avatar skills availability');
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' });
    res.json({ success: true, opportunity: opp });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/opportunities
router.post('/', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const ngo = await NGO.findOne({ createdBy: req.user._id });
    if (!ngo) return res.status(400).json({ message: 'You must have a registered NGO to post opportunities' });
    const opp = await Opp.create({ ...req.body, ngo: ngo._id, createdBy: req.user._id });
    await opp.populate('ngo', 'name logo category location verificationTier');
    res.status(201).json({ success: true, opportunity: opp });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/opportunities/:id
router.put('/:id', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const opp = await Opp.findById(req.params.id);
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' });
    if (opp.createdBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    const updated = await Opp.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, opportunity: updated });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/opportunities/:id
router.delete('/:id', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const opp = await Opp.findById(req.params.id);
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' });
    if (opp.createdBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    await opp.deleteOne();
    res.json({ success: true, message: 'Opportunity removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/opportunities/:id/apply
router.post('/:id/apply', protect, authorize('volunteer'), async (req, res) => {
  try {
    const { message } = req.body;
    const opp = await Opp.findById(req.params.id);
    if (!opp)               return res.status(404).json({ message: 'Opportunity not found' });
    if (opp.status !== 'open') return res.status(400).json({ message: 'This opportunity is no longer open' });
    const already = opp.applications.some(a => a.volunteer?.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: 'You have already applied' });
    opp.applications.push({ volunteer: req.user._id, message: message || '' });
    await opp.save();
    res.json({ success: true, message: 'Application submitted successfully!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/opportunities/:id/applications/:appId — accept/reject
router.put('/:id/applications/:appId', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const opp = await Opp.findById(req.params.id);
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' });
    const app = opp.applications.id(req.params.appId);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    app.status = status;
    await opp.save();
    await opp.populate('applications.volunteer', 'name email avatar');
    res.json({ success: true, opportunity: opp });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
