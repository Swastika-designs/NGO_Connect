const mongoose = require('mongoose');

const volunteerInterestSchema = new mongoose.Schema({
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
  message: { type: String, default: '' },
  skills: [{ type: String }],
  availability: [{ type: String }],
  status: { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('VolunteerInterest', volunteerInterestSchema);
