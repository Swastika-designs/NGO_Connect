const NGO = require('../models/NGO');

exports.getNGOs = async (req, res) => {
  try {
    const { featured, category, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true, isApproved: true };
    if (featured === 'true') query.isFeatured = true;
    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await NGO.countDocuments(query);
    const ngos = await NGO.find(query).populate('createdBy', 'name email').sort({ isFeatured: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ success: true, count: ngos.length, total, pages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), ngos });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin: get ALL NGOs regardless of approval status
exports.getAllNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find({}).populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: ngos.length, ngos });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// NGO user: get their own NGO (approved or pending)
exports.getMyNGO = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ createdBy: req.user._id }).populate('createdBy', 'name email');
    res.json({ success: true, ngo: ngo || null });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getNGO = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id).populate('createdBy', 'name email');
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json({ success: true, ngo });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createNGO = async (req, res) => {
  try {
    const ngo = await NGO.create({ ...req.body, createdBy: req.user._id, isApproved: false });
    res.status(201).json({ success: true, ngo });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateNGO = async (req, res) => {
  try {
    let ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    if (ngo.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
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
    const ngos = await NGO.find({ isApproved: false, isActive: true }).populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: ngos.length, ngos });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.approveNGO = async (req, res) => {
  try {
    const ngo = await NGO.findByIdAndUpdate(req.params.id, { isApproved: true, isVerified: true }, { new: true });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json({ success: true, ngo });
  } catch (err) { res.status(500).json({ message: err.message }); }
};


exports.getNGO = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id).populate('createdBy', 'name email');
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json({ success: true, ngo });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createNGO = async (req, res) => {
  try {
    const ngo = await NGO.create({ ...req.body, createdBy: req.user._id, isApproved: false });
    res.status(201).json({ success: true, ngo });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateNGO = async (req, res) => {
  try {
    let ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    if (ngo.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
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
    const ngos = await NGO.find({ isApproved: false, isActive: true }).populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: ngos.length, ngos });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.approveNGO = async (req, res) => {
  try {
    const ngo = await NGO.findByIdAndUpdate(req.params.id, { isApproved: true, isVerified: true }, { new: true });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json({ success: true, ngo });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
