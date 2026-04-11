import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

const NGO_DETAILS = {
  "green-earth-initiative": {
    name: "Green Earth Initiative",
    mission: "Restore degraded ecosystems and increase long-term climate resilience.",
    focus: "Environment",
  },
  "education-for-all": {
    name: "Education For All",
    mission: "Bridge learning inequality through inclusive education access.",
    focus: "Education",
  },
  "heal-the-world": {
    name: "Heal The World",
    mission: "Improve healthcare access for vulnerable and remote communities.",
    focus: "Healthcare",
  },
};

export default function NGODetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const ngo = useMemo(() => NGO_DETAILS[slug], [slug]);

  if (!ngo) {
    return (
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.25rem" }}>
        <h1>NGO not found</h1>
        <p style={{ color: "#6b7280", marginBottom: 16 }}>
          The profile you are trying to open does not exist.
        </p>
        <button onClick={() => navigate("/ngos")}>Back to NGOs</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.25rem" }}>
      <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>
        {ngo.focus}
      </div>
      <h1 style={{ marginBottom: 8 }}>{ngo.name}</h1>
      <p style={{ color: "#4b5563", marginBottom: 20 }}>{ngo.mission}</p>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => navigate("/ngo/register")}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "#111827",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Join This Cause
        </button>
        <button
          onClick={() => navigate("/ngos")}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Back to Explore
        </button>
      </div>
    </div>
  );
}
