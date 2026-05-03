const NGO = require('../models/NGO');

exports.getNGOs = async (req, res) => {
  try {
    const { featured, category, search, tier, page = 1, limit = 12 } = req.query;

    // Base conditions - use $ne instead of false so docs without the field still match
    const conditions = [
      { isActive: true },
      { isApproved: true },
      { $or: [{ isBlocked: false }, { isBlocked: { $exists: false } }] },
    ];

    if (featured === 'true') conditions.push({ isFeatured: true });
    if (category && category.trim()) conditions.push({ category });
    if (tier !== undefined && tier !== '') conditions.push({ verificationTier: parseInt(tier) });

    if (search && search.trim()) {
      const re = { $regex: search.trim(), $options: 'i' };
      conditions.push({
        $or: [
          { name: re },
          { description: re },
          { tags: re },
          { 'location.city': re },
          { category: re },
        ],
      });
    }

    const query = { $and: conditions };
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await NGO.countDocuments(query);
    const ngos  = await NGO.find(query)
      .populate('createdBy', 'name email _id')
      .sort({ verificationTier: -1, isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true, count: ngos.length, total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page), ngos,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find({}).populate('createdBy', 'name email _id').sort({ createdAt: -1 });
    res.json({ success: true, count: ngos.length, ngos });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyNGO = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ createdBy: req.user._id }).populate('createdBy', 'name email _id');
    res.json({ success: true, ngo: ngo || null });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getNGO = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id).populate('createdBy', 'name email _id');
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json({ success: true, ngo });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createNGO = async (req, res) => {
  try {
    const existing = await NGO.findOne({ createdBy: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already registered an NGO' });
    const ngo = await NGO.create({ ...req.body, createdBy: req.user._id, isApproved: false, verificationTier: 0 });
    res.status(201).json({ success: true, ngo });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateNGO = async (req, res) => {
  try {
    let ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    if (ngo.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    if (req.user.role !== 'admin') {
      delete req.body.verificationTier;
      delete req.body.isApproved;
      delete req.body.isBlocked;
    }
    ngo = await NGO.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, ngo });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteNGO = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    await ngo.deleteOne();
    res.json({ success: true, message: 'NGO removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPendingNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find({ isApproved: false, isActive: true })
      .populate('createdBy', 'name email _id').sort({ createdAt: -1 });
    res.json({ success: true, count: ngos.length, ngos });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.approveNGO = async (req, res) => {
  try {
    const { tier = 1, adminNotes = '' } = req.body;
    const ngo = await NGO.findByIdAndUpdate(req.params.id, {
      isApproved: true, isVerified: parseInt(tier) > 0,
      verificationTier: parseInt(tier), adminNotes,
    }, { new: true });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json({ success: true, ngo });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.setTier = async (req, res) => {
  try {
    const { tier, adminNotes } = req.body;
    const update = { verificationTier: parseInt(tier), isVerified: parseInt(tier) > 0 };
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    const ngo = await NGO.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json({ success: true, ngo });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.toggleBlock = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    ngo.isBlocked = !ngo.isBlocked;
    await ngo.save();
    res.json({ success: true, ngo, message: ngo.isBlocked ? 'NGO blocked' : 'NGO unblocked' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addDocument = async (req, res) => {
  try {
    const { name, url, type } = req.body;
    if (!name || !url) return res.status(400).json({ message: 'Name and URL required' });
    const ngo = await NGO.findOne({ createdBy: req.user._id });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    ngo.documents.push({ name, url, type: type || 'other' });
    await ngo.save();
    res.json({ success: true, documents: ngo.documents });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.verifyDocument = async (req, res) => {
  try {
    const { docId, verified } = req.body;
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    const doc = ngo.documents.id(docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    doc.verified = verified;
    await ngo.save();
    res.json({ success: true, ngo });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.markAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    const eventId = req.params.eventId;
    const ngo = await NGO.findOne({ createdBy: req.user._id });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    ngo.attendance = ngo.attendance.filter(a => a.event?.toString() !== eventId);
    for (const r of (records || [])) {
      ngo.attendance.push({
        volunteer: r.volunteer, event: eventId,
        status: r.status || 'present',
        priorCommunication: r.priorCommunication || false,
        note: r.note || '',
      });
    }
    await ngo.save();
    res.json({ success: true, attendance: ngo.attendance.filter(a => a.event?.toString() === eventId) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAttendance = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const ngo = req.user.role === 'admin'
      ? await NGO.findById(req.params.id).populate('attendance.volunteer', 'name email avatar')
      : await NGO.findOne({ createdBy: req.user._id }).populate('attendance.volunteer', 'name email avatar');
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    const records = ngo.attendance.filter(a => a.event?.toString() === eventId);
    res.json({ success: true, records });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
