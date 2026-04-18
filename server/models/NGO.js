const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  mission: { type: String, default: '' },
  category: {
    type: String, required: true,
    enum: ['Education','Healthcare','Environment','Animal Welfare','Disaster Relief','Women Empowerment','Child Welfare','Food & Hunger','Poverty Alleviation','Human Rights','Arts & Culture','Other']
  },
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    address: { type: String, default: '' },
  },
  contact: {
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  socialMedia: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  },
  registrationNumber: { type: String, default: '' },
  foundedYear: { type: Number },
  totalDonations: { type: Number, default: 0 },
  donorCount: { type: Number, default: 0 },
  volunteerCount: { type: Number, default: 0 },
  beneficiaryCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  tags: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

ngoSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('NGO', ngoSchema);
