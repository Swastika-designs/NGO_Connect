const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
router.get('/', async (req, res) => { try { const v = await User.find({ role: 'volunteer' }).select('-password'); res.json({ success: true, count: v.length, volunteers: v }); } catch (err) { res.status(500).json({ message: err.message }); } });
router.post('/register', protect, async (req, res) => { try { const user = await User.findByIdAndUpdate(req.user._id, { role: 'volunteer' }, { new: true }); res.json({ success: true, user }); } catch (err) { res.status(500).json({ message: err.message }); } });
module.exports = router;
