const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const ngoController = require("../controllers/ngoController");
const { verifyToken } = require("../middleware/authMiddleware");

// Multer config for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/ngo-documents/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Only PDF and image files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ─── Public ──────────────────────────────────────────────────────────────────
// POST /api/ngo/register
router.post("/register", ngoController.registerNGO);

// GET /api/ngo/:id — public profile + badge
router.get("/:id", ngoController.getNGOProfile);

// GET /api/ngo — list all approved NGOs
router.get("/", ngoController.listNGOs);

// ─── Protected (NGO rep must be logged in) ────────────────────────────────────
// POST /api/ngo/verify/identity
router.post(
  "/verify/identity",
  verifyToken,
  upload.fields([
    { name: "idProof", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
  ]),
  ngoController.submitIdentityVerification
);

// POST /api/ngo/verify/tier1
router.post(
  "/verify/tier1",
  verifyToken,
  upload.fields([
    { name: "registrationCertificate", maxCount: 1 },
    { name: "twelveA", maxCount: 1 },
    { name: "eightyG", maxCount: 1 },
    { name: "ngoDarpan", maxCount: 1 },
  ]),
  ngoController.submitTier1Documents
);

// POST /api/ngo/verify/tier2
router.post(
  "/verify/tier2",
  verifyToken,
  upload.fields([
    { name: "activityProof", maxCount: 3 },
    { name: "references", maxCount: 2 },
  ]),
  ngoController.submitTier2Documents
);

// POST /api/ngo/verify/tier3
router.post(
  "/verify/tier3",
  verifyToken,
  upload.fields([{ name: "registrationApplication", maxCount: 1 }]),
  ngoController.submitTier3Documents
);

// GET /api/ngo/my/profile — NGO rep's own dashboard
router.get("/my/profile", verifyToken, ngoController.getMyNGOProfile);

// ─── Admin only ───────────────────────────────────────────────────────────────
const { verifyAdmin } = require("../middleware/authMiddleware");

// GET /api/ngo/admin/pending
router.get("/admin/pending", verifyAdmin, ngoController.getPendingVerifications);

// PATCH /api/ngo/admin/:id/approve
router.patch("/admin/:id/approve", verifyAdmin, ngoController.approveVerification);

// PATCH /api/ngo/admin/:id/reject
router.patch("/admin/:id/reject", verifyAdmin, ngoController.rejectVerification);

module.exports = router;
