import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const NGO_FOCUS_AREAS = [
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "environment", label: "Environment" },
  { value: "women_empowerment", label: "Women Empowerment" },
  { value: "child_welfare", label: "Child Welfare" },
  { value: "disaster_relief", label: "Disaster Relief" },
  { value: "rural_development", label: "Rural Development" },
  { value: "animal_welfare", label: "Animal Welfare" },
  { value: "arts_culture", label: "Arts & Culture" },
  { value: "other", label: "Other" },
];

const ORG_TYPES = [
  { value: "trust", label: "Trust" },
  { value: "society", label: "Registered Society" },
  { value: "section8", label: "Section 8 Company" },
  { value: "community", label: "Community Group" },
  { value: "other", label: "Other" },
];

export default function NGORegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = account, 2 = org details
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    // Step 1 – Account
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    // Step 2 – Organization
    organizationName: "",
    organizationType: "",
    description: "",
    focusAreas: [],
    city: "",
    state: "",
    pincode: "",
    website: "",
  });

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleFocus = (val) => {
    setForm((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(val)
        ? prev.focusAreas.filter((f) => f !== val)
        : [...prev.focusAreas, val],
    }));
  };

  const validateStep1 = () => {
    if (!form.fullName || !form.email || !form.phone || !form.password)
      return "All fields are required";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match";
    if (form.password.length < 8)
      return "Password must be at least 8 characters";
    return null;
  };

  const validateStep2 = () => {
    if (!form.organizationName || !form.organizationType || !form.city || !form.state)
      return "Organization name, type, city, and state are required";
    if (form.focusAreas.length === 0)
      return "Select at least one focus area";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post("/api/ngo/register", {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        organizationName: form.organizationName,
        organizationType: form.organizationType,
        description: form.description,
        focusAreas: form.focusAreas,
        location: {
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: "India",
        },
        website: form.website,
      });

      localStorage.setItem("token", data.token);
      navigate("/ngo/verify/identity", {
        state: { ngoId: data.ngo.id, message: data.message },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "inherit" }}>
      {/* ── Left panel (same as Figma design) ── */}
      <div
        style={{
          flex: "0 0 45%",
          background: "linear-gradient(160deg, #0f2c5e 0%, #1a4a8a 50%, #0d3b6e 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "2.5rem",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "#22c55e",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 18,
              color: "#fff",
            }}
          >
            N
          </div>
          <span style={{ fontWeight: 600, fontSize: 18 }}>NGO Connect</span>
        </div>

        <div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 700, lineHeight: 1.25, marginBottom: "1rem" }}>
            Empowering communities, one connection at a time.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", lineHeight: 1.6 }}>
            Join thousands of volunteers, NGOs, and donors working together to
            create lasting global impact.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex" }}>
            {["#22c55e", "#3b82f6", "#f59e0b"].map((c) => (
              <div
                key={c}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: c,
                  border: "2px solid rgba(255,255,255,0.6)",
                  marginRight: -10,
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
            TRUSTED BY 10K+ CHANGE-MAKERS
          </span>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "3rem 4rem",
          background: "#fff",
          overflowY: "auto",
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: "1.75rem", marginBottom: 4 }}>
          Create your account
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          Register your NGO or community initiative today.
        </p>

        {/* Step tabs */}
        <div style={{ display: "flex", marginBottom: "1.5rem", borderRadius: 8, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          {["Account Details", "Organization Info"].map((label, i) => (
            <button
              key={i}
              onClick={() => i === 0 && setStep(1)}
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                cursor: i === 0 ? "pointer" : "default",
                background: step === i + 1 ? "#22c55e" : "#f9fafb",
                color: step === i + 1 ? "#fff" : "#6b7280",
                fontWeight: step === i + 1 ? 600 : 400,
                fontSize: 14,
                transition: "all 0.2s",
              }}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#dc2626",
              fontSize: 14,
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
          {step === 1 && (
            <>
              <FormField label="Full Name" type="text" placeholder="Parakh Singh"
                value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
              <FormField label="Email Address" type="email" placeholder="parakhsingh@gmail.com"
                value={form.email} onChange={(e) => update("email", e.target.value)} />
              <FormField label="Phone Number" type="tel" placeholder="+91 9876543210"
                value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              <FormField label="Password" type="password" placeholder="Min. 8 characters"
                value={form.password} onChange={(e) => update("password", e.target.value)} />
              <FormField label="Confirm Password" type="password" placeholder="Re-enter password"
                value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} />

              <button type="submit" style={btnStyle}>
                Continue →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <FormField label="Organization Name" type="text" placeholder="Green Earth Initiative"
                value={form.organizationName} onChange={(e) => update("organizationName", e.target.value)} />

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Organization Type</label>
                <select
                  value={form.organizationType}
                  onChange={(e) => update("organizationType", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select type…</option>
                  {ORG_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Brief description of your NGO's mission and work…"
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", height: "auto" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Focus Areas (select all that apply)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                  {NGO_FOCUS_AREAS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => toggleFocus(f.value)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 20,
                        border: "1px solid",
                        borderColor: form.focusAreas.includes(f.value) ? "#22c55e" : "#e5e7eb",
                        background: form.focusAreas.includes(f.value) ? "#dcfce7" : "#f9fafb",
                        color: form.focusAreas.includes(f.value) ? "#15803d" : "#6b7280",
                        fontSize: 13,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <FormField label="City" type="text" placeholder="Mumbai"
                  value={form.city} onChange={(e) => update("city", e.target.value)} />
                <FormField label="State" type="text" placeholder="Maharashtra"
                  value={form.state} onChange={(e) => update("state", e.target.value)} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <FormField label="Pincode" type="text" placeholder="400001"
                  value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
                <FormField label="Website (optional)" type="url" placeholder="https://your-ngo.org"
                  value={form.website} onChange={(e) => update("website", e.target.value)} />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ ...btnStyle, background: "#f3f4f6", color: "#374151", flex: "0 0 auto", padding: "14px 24px" }}
                >
                  ← Back
                </button>
                <button type="submit" style={{ ...btnStyle, flex: 1 }} disabled={loading}>
                  {loading ? "Registering…" : "Register Account →"}
                </button>
              </div>
            </>
          )}
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 13, color: "#9ca3af" }}>
          By joining, you agree to our{" "}
          <a href="/terms" style={{ color: "#22c55e" }}>Terms of Service</a> and{" "}
          <a href="/privacy" style={{ color: "#22c55e" }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function FormField({ label, ...props }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={labelStyle}>{label}</label>
      <input style={inputStyle} {...props} />
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: "#374151",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  fontSize: 14,
  color: "#111827",
  background: "#f9fafb",
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.2s",
};

const btnStyle = {
  width: "100%",
  padding: "14px",
  background: "#22c55e",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  transition: "background 0.2s",
};
