const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  message: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  isPublic: { type: Boolean, default: true },
  role: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
