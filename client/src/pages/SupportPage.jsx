import { useState } from "react";

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "3rem 1.25rem" }}>
      <h1 style={{ marginBottom: 8 }}>Contact Support</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Tell us what you need help with and we will get back to you.
      </p>

      {submitted ? (
        <div style={{ background: "#ecfdf5", color: "#065f46", padding: 14, borderRadius: 8 }}>
          Support request sent successfully.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <input required placeholder="Your email" type="email" style={inputStyle} />
          <input required placeholder="Subject" style={inputStyle} />
          <textarea required placeholder="Describe your issue" rows={5} style={inputStyle} />
          <button
            type="submit"
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              border: "none",
              background: "#111827",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Submit Request
          </button>
        </form>
      )}
    </div>
  );
}

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  font: "inherit",
};
