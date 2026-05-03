const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['registration', 'id', 'certificate', 'tax', 'other'], default: 'other' },
  uploadedAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
});

const attendanceSchema = new mongoose.Schema({
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  status: { type: String, enum: ['present', 'absent', 'no-show'], default: 'present' },
  markedAt: { type: Date, default: Date.now },
  priorCommunication: { type: Boolean, default: false },
  note: { type: String, default: '' },
}, { _id: true });

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
  isBlocked: { type: Boolean, default: false },

  // Tier system: Tier1=Bronze, Tier2=Silver, Tier3=Gold
  verificationTier: { type: Number, enum: [0, 1, 2, 3], default: 0 },
  // 0 = unverified, 1 = Bronze, 2 = Silver, 3 = Gold

  // Documents for verification
  documents: [documentSchema],

  // Attendance records per event
  attendance: [attendanceSchema],

  tags: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // What the NGO needs (goods/resources)
  ngoNeeds: [{
    category: { type: String, enum: ['clothes','food','electronics','books','furniture','toys','medical','money','volunteers','other'] },
    description: { type: String },
    urgency: { type: String, enum: ['low','medium','high'], default: 'medium' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  }],

  // Admin notes / action log
  adminNotes: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
}, { timestamps: true });

ngoSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual: tier label
ngoSchema.virtual('tierLabel').get(function() {
  return ['Unverified', 'Bronze', 'Silver', 'Gold'][this.verificationTier] || 'Unverified';
});

module.exports = mongoose.model('NGO', ngoSchema);
