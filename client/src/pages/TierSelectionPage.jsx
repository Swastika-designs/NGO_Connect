import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TIERS = [
  {
    tier: 1,
    label: "Tier 1 – Fully Verified NGO",
    badge: "TIER 1",
    badgeColor: "#059669",
    badgeBg: "#dcfce7",
    icon: "🏛️",
    description:
      "For legally registered NGOs with full documentation. Highest trust level — unlocks all platform features, donor visibility, and premium listing.",
    requirements: [
      "Trust / Society / Section 8 registration certificate",
      "12A certificate (income tax exemption)",
      "80G certificate (tax deduction for donors)",
      "NGO Darpan registration ID",
    ],
    suitable: "Established, legally registered organizations",
    time: "3–5 business days",
  },
  {
    tier: 2,
    label: "Tier 2 – Community Initiative",
    badge: "TIER 2",
    badgeColor: "#1d4ed8",
    badgeBg: "#dbeafe",
    icon: "🤝",
    description:
      "For active community groups that lack full registration but can demonstrate past impact. Good visibility with a community badge.",
    requirements: [
      "Proof of past activities (photos, reports, media)",
      "2+ reference letters from community leaders",
      "Contact details of at least 2 references",
    ],
    suitable: "Active community groups, early-stage initiatives",
    time: "5–7 business days",
  },
  {
    tier: 3,
    label: "Tier 3 – Verification in Progress",
    badge: "TIER 3",
    badgeColor: "#b45309",
    badgeBg: "#fef3c7",
    icon: "⏳",
    description:
      "For NGOs that have applied for registration but are awaiting approval. Get listed with a transparent 'in progress' badge while you wait.",
    requirements: [
      "Proof of submitted registration application",
    ],
    suitable: "Organizations awaiting registration approval",
    time: "1–2 business days",
  },
];

export default function TierSelectionPage() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const handleProceed = () => {
    if (!selected) return;
    navigate(`/ngo/verify/tier${selected}/documents`);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h2 style={{ fontWeight: 700, fontSize: "1.6rem", marginBottom: 4 }}>
        Choose Your Verification Level
      </h2>
      <p style={{ color: "#6b7280", marginBottom: "2rem", lineHeight: 1.65 }}>
        Select the tier that best fits your organization. You can always upgrade later as your
        documentation becomes available.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        {TIERS.map((t) => (
          <div
            key={t.tier}
            onClick={() => setSelected(t.tier)}
            style={{
              border: `2px solid ${selected === t.tier ? t.badgeColor : "#e5e7eb"}`,
              borderRadius: 12,
              padding: "1.5rem",
              cursor: "pointer",
              background: selected === t.tier ? t.badgeBg + "55" : "#fff",
              transition: "all 0.2s",
              display: "flex",
              gap: "1.25rem",
              alignItems: "flex-start",
            }}
          >
            {/* Radio */}
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: `2px solid ${selected === t.tier ? t.badgeColor : "#d1d5db"}`,
                background: selected === t.tier ? t.badgeColor : "#fff",
                flexShrink: 0,
                marginTop: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selected === t.tier && (
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{t.icon}</span>
                <span style={{ fontWeight: 700, fontSize: "1rem" }}>{t.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: t.badgeBg,
                    color: t.badgeColor,
                    letterSpacing: 0.5,
                  }}
                >
                  {t.badge}
                </span>
              </div>

              <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6, marginBottom: 12 }}>
                {t.description}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                    Required Documents
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                    {t.requirements.map((r, i) => (
                      <li key={i} style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <InfoChip label="Suitable for" value={t.suitable} />
                  <InfoChip label="Review time" value={t.time} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleProceed}
        disabled={!selected}
        style={{
          width: "100%",
          padding: "14px",
          background: selected ? "#22c55e" : "#e5e7eb",
          color: selected ? "#fff" : "#9ca3af",
          border: "none",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 15,
          cursor: selected ? "pointer" : "not-allowed",
          transition: "all 0.2s",
        }}
      >
        {selected
          ? `Proceed with Tier ${selected} Verification →`
          : "Select a tier to continue"}
      </button>

      <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: "1rem" }}>
        Not sure which to pick?{" "}
        <a href="/help/tiers" style={{ color: "#22c55e" }}>
          Compare tiers in detail
        </a>
      </p>
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{value}</div>
    </div>
  );
}
