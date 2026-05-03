const mongoose = require('mongoose');

const volunteerOpportunitySchema = new mongoose.Schema({
  title:            { type: String, required: true, trim: true },
  description:      { type: String, required: true },
  category: {
    type: String, required: true,
    enum: ['Education','Healthcare','Environment','Animal Welfare','Disaster Relief',
           'Women Empowerment','Child Welfare','Food & Hunger','Community Development',
           'Tech & Digital','Other'],
    default: 'Other',
  },
  // Commitment details
  commitmentType:   { type: String, enum: ['one-time','recurring','flexible'], default: 'one-time' },
  duration:         { type: String, default: '' },        // "4 hours", "3 months"
  hoursPerWeek:     { type: Number, default: 0 },         // for recurring
  startDate:        { type: Date },
  endDate:          { type: Date },
  // Location
  locationType:     { type: String, enum: ['Physical','Remote','Hybrid'], default: 'Physical' },
  location:         { type: String, default: '' },        // city/address or "Remote"
  // Requirements
  volunteersNeeded: { type: Number, default: 1 },
  requiredSkills:   [{ type: String }],
  minAge:           { type: Number, default: 0 },
  requirements:     { type: String, default: '' },        // free-text eligibility
  // Benefits offered
  benefits:         [{ type: String }],                   // "Certificate","Meals","Transport"
  // Status
  status:           { type: String, enum: ['draft','open','closed'], default: 'open' },
  // NGO that posted it
  ngo:              { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
  createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Applications
  applications: [{
    volunteer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message:      { type: String, default: '' },
    status:       { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
    appliedAt:    { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('VolunteerOpportunity', volunteerOpportunitySchema);
