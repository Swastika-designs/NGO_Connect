const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String, required: true,
    enum: ['Environment', 'Education', 'Healthcare', 'Disaster Relief', 'Women Empowerment', 'Food & Hunger', 'Other'],
    default: 'Other',
  },
  targetAudience: { type: String, default: '' },
  date: { type: Date },
  time: { type: String, default: '' },
  locationType: { type: String, enum: ['Physical', 'Virtual'], default: 'Physical' },
  address: { type: String, default: '' },
  volunteersNeeded: { type: Number, default: 0 },
  requiredSkills: [{ type: String }],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
