const mongoose = require("mongoose");

const NGOSchema = new mongoose.Schema(
  {
    // ── Linked user account ──────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Basic profile ────────────────────────────────────────────────────────
    organizationName: { type: String, required: true, trim: true },
    organizationType: {
      type: String,
      enum: ["trust", "society", "section8", "community", "other"],
      required: true,
    },
    description: { type: String, maxlength: 1000 },
    focusAreas: [
      {
        type: String,
        enum: [
          "education",
          "health",
          "environment",
          "women_empowerment",
          "child_welfare",
          "disaster_relief",
          "rural_development",
          "animal_welfare",
          "arts_culture",
          "other",
        ],
      },
    ],
    location: {
      address: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: "India" },
      pincode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    website: String,
    logo: String,
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },

    // ── Verification status ───────────────────────────────────────────────────
    verificationStatus: {
      type: String,
      enum: [
        "unverified",
        "identity_verified",
        "tier1_pending",
        "tier1_approved",
        "tier2_pending",
        "tier2_approved",
        "tier3_pending",
        "tier3_approved",
        "rejected",
      ],
      default: "unverified",
    },
    tier: {
      type: Number,
      validate: {
        validator: (value) => value === null || [1, 2, 3].includes(value),
        message: "Tier must be null, 1, 2, or 3",
      },
      default: null,
    },
    identityVerified: { type: Boolean, default: false },

    // ── Step 1: Identity verification ─────────────────────────────────────────
    identityVerification: {
      idType: {
        type: String,
        enum: ["aadhaar", "pan", "passport", "voter_id", "driving_license"],
      },
      idNumber: { type: String, select: false }, // sensitive
      idProofPath: { type: String, select: false },
      addressProofPath: { type: String, select: false },
      phoneVerified: { type: Boolean, default: false },
      emailVerified: { type: Boolean, default: false },
      locationConfirmed: { type: Boolean, default: false },
      submittedAt: Date,
    },

    // ── Tier 1 documents (Trust/Society/Section 8 + 12A/80G + NGO Darpan) ────
    tier1Documents: {
      registrationCertificate: { type: String, select: false },
      twelveA: { type: String, select: false },    // 12A certificate
      eightyG: { type: String, select: false },    // 80G certificate
      ngoDarpan: { type: String, select: false },  // NGO Darpan ID
      submittedAt: Date,
    },

    // ── Tier 2 documents (Community Initiative – past activities + references) ─
    tier2Documents: {
      activityProofs: [{ type: String, select: false }], // photos, reports, etc.
      references: [{ type: String, select: false }],      // reference letters
      referenceContacts: [
        {
          name: String,
          phone: String,
          email: String,
          organization: String,
        },
      ],
      submittedAt: Date,
    },

    // ── Tier 3 documents (Registration application in progress) ──────────────
    tier3Documents: {
      registrationApplicationPath: { type: String, select: false },
      submittedAt: Date,
    },

    // ── Admin review ─────────────────────────────────────────────────────────
    adminReview: {
      approvedAt: Date,
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rejectedAt: Date,
      rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rejectionReason: String,
      note: String,
    },

    // ── Platform stats ────────────────────────────────────────────────────────
    stats: {
      volunteersHelped: { type: Number, default: 0 },
      donationsReceived: { type: Number, default: 0 },
      campaignsLaunched: { type: Number, default: 0 },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
NGOSchema.index({ verificationStatus: 1 });
NGOSchema.index({ tier: 1 });
NGOSchema.index({ organizationName: "text", description: "text" });
NGOSchema.index({ "location.city": 1, "location.state": 1 });
NGOSchema.index({ focusAreas: 1 });

// ── Virtual: badge info for API consumers ─────────────────────────────────────
NGOSchema.virtual("badge").get(function () {
  const map = {
    tier1_approved: {
      label: "Tier 1 – Fully Verified NGO",
      color: "#059669",
      tier: 1,
    },
    tier2_approved: {
      label: "Tier 2 – Community Initiative",
      color: "#2563EB",
      tier: 2,
    },
    tier3_approved: {
      label: "Tier 3 – Verification in Progress",
      color: "#D97706",
      tier: 3,
    },
    identity_verified: {
      label: "Identity Verified",
      color: "#6B7280",
      tier: null,
    },
    unverified: { label: "Unverified", color: "#9CA3AF", tier: null },
  };
  return map[this.verificationStatus] || map["unverified"];
});

NGOSchema.set("toJSON", { virtuals: true });
NGOSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("NGO", NGOSchema);
