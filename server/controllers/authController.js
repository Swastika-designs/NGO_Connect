const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Please provide name, email, and password' });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists with this email' });
    const user = await User.create({ name, email, password, role: role || 'donor' });
    res.status(201).json({ success: true, token: generateToken(user._id), user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ success: true, token: generateToken(user._id), user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMe = async (req, res) => {
  try { const user = await User.findById(req.user._id); res.json({ success: true, user }); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio, avatar, skills, availability } = req.body;
    const update = { name, phone, location, bio, avatar };
    if (Array.isArray(skills)) update.skills = skills;
    if (Array.isArray(availability)) update.availability = availability;
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
