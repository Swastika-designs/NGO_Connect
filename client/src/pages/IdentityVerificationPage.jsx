import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ID_TYPES = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "passport", label: "Passport" },
  { value: "voter_id", label: "Voter ID" },
  { value: "driving_license", label: "Driving License" },
];

export default function IdentityVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    idType: "",
    idNumber: "",
    phoneVerified: false,
    emailVerified: false,
    locationConfirmed: false,
  });
  const [idProof, setIdProof] = useState(null);
  const [addressProof, setAddressProof] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.idType || !form.idNumber || !idProof)
      return setError("ID type, ID number, and ID proof document are required");

    setLoading(true);
    setError("");

    const fd = new FormData();
    fd.append("idType", form.idType);
    fd.append("idNumber", form.idNumber);
    fd.append("phoneVerified", form.phoneVerified);
    fd.append("emailVerified", form.emailVerified);
    fd.append("locationConfirmed", form.locationConfirmed);
    fd.append("idProof", idProof);
    if (addressProof) fd.append("addressProof", addressProof);

    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/ngo/verify/identity", fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      setSuccess("Identity verified! Now choose your verification tier.");
      setTimeout(() => navigate("/ngo/verify/tier"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Verification submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <StepIndicator current={1} />

      <h2 style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: 4 }}>
        Basic Identity Verification
      </h2>
      <p style={{ color: "#6b7280", marginBottom: "2rem", lineHeight: 1.6 }}>
        We need to verify your identity to ensure trust and safety on the platform.
        This information is kept confidential.
      </p>

      {location.state?.message && (
        <div style={infoBanner}>{location.state.message}</div>
      )}
      {error && <div style={errorBanner}>{error}</div>}
      {success && <div style={successBanner}>{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* ID Type */}
        <div style={fieldWrap}>
          <label style={labelS}>Government ID Type</label>
          <select
            style={inputS}
            value={form.idType}
            onChange={(e) => setForm((p) => ({ ...p, idType: e.target.value }))}
          >
            <option value="">Select ID type…</option>
            {ID_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* ID Number */}
        <div style={fieldWrap}>
          <label style={labelS}>ID Number</label>
          <input
            style={inputS}
            type="text"
            placeholder="Enter your ID number"
            value={form.idNumber}
            onChange={(e) => setForm((p) => ({ ...p, idNumber: e.target.value }))}
          />
        </div>

        {/* ID Proof Upload */}
        <UploadField
          label="Upload ID Proof (PDF or Image)"
          hint="Max 10MB — PDF, JPG, PNG"
          required
          file={idProof}
          onChange={setIdProof}
        />

        {/* Address Proof */}
        <UploadField
          label="Upload Address Proof (optional)"
          hint="Utility bill, bank statement, etc."
          file={addressProof}
          onChange={setAddressProof}
        />

        {/* Checkboxes */}
        <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "#15803d" }}>
            Confirm the following
          </p>
          {[
            { key: "phoneVerified", label: "My phone number is verified and reachable" },
            { key: "emailVerified", label: "My email address is active and monitored" },
            { key: "locationConfirmed", label: "The location I provided is accurate" },
          ].map(({ key, label }) => (
            <label
              key={key}
              style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
                style={{ width: 16, height: 16 }}
              />
              <span style={{ fontSize: 14, color: "#374151" }}>{label}</span>
            </label>
          ))}
        </div>

        <button type="submit" style={btnS} disabled={loading}>
          {loading ? "Submitting…" : "Submit Identity Verification →"}
        </button>
      </form>
    </div>
  );
}

function UploadField({ label, hint, required, file, onChange }) {
  return (
    <div style={fieldWrap}>
      <label style={labelS}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      <div
        style={{
          border: "2px dashed #d1d5db",
          borderRadius: 10,
          padding: "1.25rem",
          textAlign: "center",
          background: file ? "#f0fdf4" : "#f9fafb",
          cursor: "pointer",
        }}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onChange(e.target.files[0])}
          style={{ display: "none" }}
          id={label}
        />
        <label htmlFor={label} style={{ cursor: "pointer" }}>
          {file ? (
            <span style={{ color: "#15803d", fontWeight: 500 }}>✓ {file.name}</span>
          ) : (
            <>
              <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
              <div style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>
                Click to upload
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{hint}</div>
            </>
          )}
        </label>
      </div>
    </div>
  );
}

function StepIndicator({ current }) {
  const steps = ["Identity", "Choose Tier", "Documents", "Review"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: i < current ? "#22c55e" : i === current - 1 ? "#22c55e" : "#e5e7eb",
                color: i <= current - 1 ? "#fff" : "#9ca3af",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {i < current - 1 ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 11, color: i === current - 1 ? "#22c55e" : "#9ca3af", marginTop: 4 }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < current - 1 ? "#22c55e" : "#e5e7eb", margin: "0 6px", marginBottom: 20 }} />
          )}
        </div>
      ))}
    </div>
  );
}

const fieldWrap = { marginBottom: "1.25rem" };
const labelS = { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 };
const inputS = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, color: "#111827", background: "#f9fafb", boxSizing: "border-box" };
const btnS = { width: "100%", padding: "14px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" };
const infoBanner = { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", color: "#1d4ed8", fontSize: 14, marginBottom: "1rem" };
const errorBanner = { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", color: "#dc2626", fontSize: 14, marginBottom: "1rem" };
const successBanner = { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", color: "#15803d", fontSize: 14, marginBottom: "1rem" };
