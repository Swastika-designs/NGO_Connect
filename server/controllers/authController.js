const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn:'30d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, location, bio, skills, availability, interests } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message:'Please provide name, email, and password' });
    if (await User.findOne({ email })) return res.status(400).json({ message:'User already exists with this email' });

    const userData = { name, email, password, role: role || 'donor', phone: phone||'', location: location||'', bio: bio||'' };
    if (Array.isArray(skills))       userData.skills = skills;
    if (Array.isArray(availability)) userData.availability = availability;
    if (Array.isArray(interests))    userData.interests = interests;

    const user = await User.create(userData);
    const token = generateToken(user._id);
    res.status(201).json({
      success:true, token,
      user:{ _id:user._id, name:user.name, email:user.email, role:user.role, avatar:user.avatar,
             phone:user.phone, location:user.location, bio:user.bio,
             skills:user.skills, availability:user.availability, createdAt:user.createdAt },
    });
  } catch (err) { res.status(500).json({ message:err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message:'Please provide email and password' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message:'Invalid credentials' });
    if (user.isBlocked) return res.status(403).json({ message:'Your account has been suspended. Please contact support.' });
    const token = generateToken(user._id);
    res.json({
      success:true, token,
      user:{ _id:user._id, name:user.name, email:user.email, role:user.role, avatar:user.avatar,
             phone:user.phone, location:user.location, bio:user.bio,
             skills:user.skills, availability:user.availability, createdAt:user.createdAt },
    });
  } catch (err) { res.status(500).json({ message:err.message }); }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success:true, user });
  } catch (err) { res.status(500).json({ message:err.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio, avatar, skills, availability, interests } = req.body;
    const update = { name, phone, location, bio, avatar };
    if (Array.isArray(skills))       update.skills = skills;
    if (Array.isArray(availability)) update.availability = availability;
    if (Array.isArray(interests))    update.interests = interests;
    const user = await User.findByIdAndUpdate(req.user._id, update, { new:true, runValidators:true });
    res.json({ success:true, user });
  } catch (err) { res.status(500).json({ message:err.message }); }
};
