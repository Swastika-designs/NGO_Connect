const NGO = require("../models/NGO");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ─── Register a new NGO account ───────────────────────────────────────────────
exports.registerNGO = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      organizationName,
      organizationType,
      location,
      website,
      description,
      focusAreas,
    } = req.body;

    // Check duplicate
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user account
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role: "ngo",
    });

    // Create NGO profile with Tier 0 (unverified) status
    const ngo = await NGO.create({
      user: user._id,
      organizationName,
      organizationType, // trust | society | section8 | community | other
      location,
      website,
      description,
      focusAreas,
      verificationStatus: "unverified",
      tier: null,
      identityVerified: false,
    });

    const token = jwt.sign(
      { id: user._id, role: "ngo", ngoId: ngo._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "NGO registered successfully. Please complete identity verification.",
      token,
      user: { id: user._id, name: fullName, email, role: "ngo" },
      ngo: {
        id: ngo._id,
        organizationName,
        verificationStatus: "unverified",
        tier: null,
      },
    });
  } catch (error) {
    console.error("NGO Registration Error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// ─── Step 1: Basic identity verification ─────────────────────────────────────
exports.submitIdentityVerification = async (req, res) => {
  try {
    const { ngoId } = req.user;
    const { idNumber, idType, phoneVerified, emailVerified, locationConfirmed } =
      req.body;

    const idProofPath = req.files?.idProof?.[0]?.path;
    const addressProofPath = req.files?.addressProof?.[0]?.path;

    if (!idProofPath)
      return res.status(400).json({ message: "ID proof document is required" });

    const ngo = await NGO.findByIdAndUpdate(
      ngoId,
      {
        $set: {
          "identityVerification.idNumber": idNumber,
          "identityVerification.idType": idType,
          "identityVerification.idProofPath": idProofPath,
          "identityVerification.addressProofPath": addressProofPath,
          "identityVerification.phoneVerified": phoneVerified === "true",
          "identityVerification.emailVerified": emailVerified === "true",
          "identityVerification.locationConfirmed": locationConfirmed === "true",
          "identityVerification.submittedAt": new Date(),
          identityVerified: true,
          verificationStatus: "identity_verified",
        },
      },
      { new: true }
    );

    res.json({
      message: "Identity verification submitted. You can now apply for tier verification.",
      ngo: {
        id: ngo._id,
        verificationStatus: ngo.verificationStatus,
        identityVerified: ngo.identityVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Identity verification failed", error: error.message });
  }
};

// ─── Tier 1: Fully Verified NGO ───────────────────────────────────────────────
exports.submitTier1Documents = async (req, res) => {
  try {
    const { ngoId } = req.user;
    const ngo = await NGO.findById(ngoId);

    if (!ngo?.identityVerified)
      return res.status(400).json({ message: "Complete identity verification first" });

    const docs = {
      registrationCertificate: req.files?.registrationCertificate?.[0]?.path,
      twelveA: req.files?.twelveA?.[0]?.path,
      eightyG: req.files?.eightyG?.[0]?.path,
      ngoDarpan: req.files?.ngoDarpan?.[0]?.path,
    };

    if (!docs.registrationCertificate)
      return res.status(400).json({ message: "Registration certificate is required for Tier 1" });

    await NGO.findByIdAndUpdate(ngoId, {
      $set: {
        "tier1Documents": docs,
        "tier1Documents.submittedAt": new Date(),
        verificationStatus: "tier1_pending",
        tier: null, // set to 1 after admin approval
      },
    });

    res.json({
      message:
        "Tier 1 documents submitted. Your application is under review. Expected: 3-5 business days.",
      verificationStatus: "tier1_pending",
    });
  } catch (error) {
    res.status(500).json({ message: "Tier 1 submission failed", error: error.message });
  }
};

// ─── Tier 2: Community Initiative ────────────────────────────────────────────
exports.submitTier2Documents = async (req, res) => {
  try {
    const { ngoId } = req.user;
    const ngo = await NGO.findById(ngoId);

    if (!ngo?.identityVerified)
      return res.status(400).json({ message: "Complete identity verification first" });

    const activityProofs = req.files?.activityProof?.map((f) => f.path) || [];
    const references = req.files?.references?.map((f) => f.path) || [];
    const { referenceContacts } = req.body; // JSON string array

    if (!activityProofs.length)
      return res
        .status(400)
        .json({ message: "At least one proof of activity is required for Tier 2" });

    await NGO.findByIdAndUpdate(ngoId, {
      $set: {
        "tier2Documents.activityProofs": activityProofs,
        "tier2Documents.references": references,
        "tier2Documents.referenceContacts": JSON.parse(referenceContacts || "[]"),
        "tier2Documents.submittedAt": new Date(),
        verificationStatus: "tier2_pending",
        tier: null,
      },
    });

    res.json({
      message: "Tier 2 documents submitted. Review expected within 5-7 business days.",
      verificationStatus: "tier2_pending",
    });
  } catch (error) {
    res.status(500).json({ message: "Tier 2 submission failed", error: error.message });
  }
};

// ─── Tier 3: Verification in Progress ────────────────────────────────────────
exports.submitTier3Documents = async (req, res) => {
  try {
    const { ngoId } = req.user;
    const ngo = await NGO.findById(ngoId);

    if (!ngo?.identityVerified)
      return res.status(400).json({ message: "Complete identity verification first" });

    const applicationPath = req.files?.registrationApplication?.[0]?.path;

    if (!applicationPath)
      return res
        .status(400)
        .json({ message: "Proof of registration application is required for Tier 3" });

    await NGO.findByIdAndUpdate(ngoId, {
      $set: {
        "tier3Documents.registrationApplicationPath": applicationPath,
        "tier3Documents.submittedAt": new Date(),
        verificationStatus: "tier3_pending",
        tier: null,
      },
    });

    res.json({
      message:
        "Tier 3 application submitted. You will be listed as 'Verification in Progress'.",
      verificationStatus: "tier3_pending",
    });
  } catch (error) {
    res.status(500).json({ message: "Tier 3 submission failed", error: error.message });
  }
};

// ─── Get public NGO profile ───────────────────────────────────────────────────
exports.getNGOProfile = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id)
      .select("-tier1Documents -tier2Documents -tier3Documents -identityVerification")
      .populate("user", "fullName email");

    if (!ngo) return res.status(404).json({ message: "NGO not found" });

    res.json({
      ngo: {
        ...ngo.toObject(),
        badge: getBadgeInfo(ngo.tier, ngo.verificationStatus),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch NGO profile", error: error.message });
  }
};

// ─── List all approved NGOs ───────────────────────────────────────────────────
exports.listNGOs = async (req, res) => {
  try {
    const { tier, search, focusArea, page = 1, limit = 12 } = req.query;

    const filter = { verificationStatus: { $in: ["tier1_approved", "tier2_approved", "tier3_approved"] } };
    if (tier) filter.tier = parseInt(tier);
    if (focusArea) filter.focusAreas = focusArea;
    if (search) filter.organizationName = { $regex: search, $options: "i" };

    const total = await NGO.countDocuments(filter);
    const ngos = await NGO.find(filter)
      .select("organizationName description tier verificationStatus location focusAreas logo")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ tier: 1, createdAt: -1 });

    res.json({
      ngos: ngos.map((n) => ({
        ...n.toObject(),
        badge: getBadgeInfo(n.tier, n.verificationStatus),
      })),
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to list NGOs", error: error.message });
  }
};

// ─── NGO rep: own profile ─────────────────────────────────────────────────────
exports.getMyNGOProfile = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.user.ngoId).populate("user", "fullName email phone");
    if (!ngo) return res.status(404).json({ message: "NGO profile not found" });

    res.json({
      ngo: {
        ...ngo.toObject(),
        badge: getBadgeInfo(ngo.tier, ngo.verificationStatus),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

// ─── Admin: list pending verifications ───────────────────────────────────────
exports.getPendingVerifications = async (req, res) => {
  try {
    const pending = await NGO.find({
      verificationStatus: { $in: ["tier1_pending", "tier2_pending", "tier3_pending"] },
    }).populate("user", "fullName email phone");

    res.json({ pending });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending verifications", error: error.message });
  }
};

// ─── Admin: approve ───────────────────────────────────────────────────────────
exports.approveVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { tier, adminNote } = req.body;

    const statusMap = { 1: "tier1_approved", 2: "tier2_approved", 3: "tier3_approved" };
    const newStatus = statusMap[tier];
    if (!newStatus)
      return res.status(400).json({ message: "Invalid tier. Must be 1, 2, or 3." });

    const ngo = await NGO.findByIdAndUpdate(
      id,
      {
        $set: {
          tier: parseInt(tier),
          verificationStatus: newStatus,
          "adminReview.approvedAt": new Date(),
          "adminReview.approvedBy": req.user.id,
          "adminReview.note": adminNote,
        },
      },
      { new: true }
    );

    res.json({
      message: `NGO approved as Tier ${tier}`,
      ngo: { id: ngo._id, tier: ngo.tier, status: ngo.verificationStatus },
    });
  } catch (error) {
    res.status(500).json({ message: "Approval failed", error: error.message });
  }
};

// ─── Admin: reject ────────────────────────────────────────────────────────────
exports.rejectVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const ngo = await NGO.findByIdAndUpdate(
      id,
      {
        $set: {
          verificationStatus: "rejected",
          "adminReview.rejectedAt": new Date(),
          "adminReview.rejectedBy": req.user.id,
          "adminReview.rejectionReason": reason,
        },
      },
      { new: true }
    );

    res.json({ message: "Verification rejected", ngoId: ngo._id });
  } catch (error) {
    res.status(500).json({ message: "Rejection failed", error: error.message });
  }
};

// ─── Badge helper ─────────────────────────────────────────────────────────────
function getBadgeInfo(tier, status) {
  if (status === "tier1_approved")
    return {
      label: "Tier 1 – Fully Verified NGO",
      color: "#059669",
      icon: "verified",
      description: "Legally registered NGO with full documentation",
    };
  if (status === "tier2_approved")
    return {
      label: "Tier 2 – Community Initiative",
      color: "#2563EB",
      icon: "community",
      description: "Verified community initiative with proof of activity",
    };
  if (status === "tier3_approved")
    return {
      label: "Tier 3 – Verification in Progress",
      color: "#D97706",
      icon: "pending",
      description: "Registration application submitted, awaiting completion",
    };
  if (status === "identity_verified")
    return {
      label: "Identity Verified",
      color: "#6B7280",
      icon: "identity",
      description: "Basic identity verification complete",
    };
  return {
    label: "Unverified",
    color: "#9CA3AF",
    icon: "unverified",
    description: "Verification not yet completed",
  };
}
