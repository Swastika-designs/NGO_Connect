/**
 * VerificationBadge
 * Displays the correct tier badge on NGO profiles, cards, and listings.
 *
 * Props:
 *   tier            — 1 | 2 | 3 | null
 *   verificationStatus — string from backend
 *   size            — "sm" | "md" | "lg"  (default: "md")
 *   showDescription — boolean (default: false)
 */

const BADGE_CONFIG = {
  tier1_approved: {
    label: "Tier 1 – Fully Verified NGO",
    shortLabel: "Tier 1",
    description: "Legally registered NGO with full documentation",
    color: "#059669",
    bg: "#dcfce7",
    border: "#a7f3d0",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
  tier2_approved: {
    label: "Tier 2 – Community Initiative",
    shortLabel: "Tier 2",
    description: "Verified community initiative with proof of activity",
    color: "#1d4ed8",
    bg: "#dbeafe",
    border: "#93c5fd",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  tier3_approved: {
    label: "Tier 3 – Verification in Progress",
    shortLabel: "Tier 3",
    description: "Registration application submitted, awaiting completion",
    color: "#b45309",
    bg: "#fef3c7",
    border: "#fcd34d",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  identity_verified: {
    label: "Identity Verified",
    shortLabel: "Identity Verified",
    description: "Basic identity verification complete",
    color: "#6b7280",
    bg: "#f3f4f6",
    border: "#d1d5db",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
  },
  unverified: {
    label: "Unverified",
    shortLabel: "Unverified",
    description: "Verification not yet completed",
    color: "#9ca3af",
    bg: "#f9fafb",
    border: "#e5e7eb",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
};

// Map pending statuses to their closest display config
const STATUS_ALIAS = {
  tier1_pending: "tier3_approved", // show "in progress" look for pending
  tier2_pending: "tier3_approved",
  tier3_pending: "tier3_approved",
  rejected: "unverified",
};

const SIZE_CONFIG = {
  sm: { fontSize: 11, padding: "3px 8px", iconSize: 12, gap: 4 },
  md: { fontSize: 13, padding: "5px 12px", iconSize: 14, gap: 6 },
  lg: { fontSize: 15, padding: "8px 16px", iconSize: 16, gap: 8 },
};

export default function VerificationBadge({
  tier,
  verificationStatus,
  size = "md",
  showDescription = false,
}) {
  // Resolve the config key
  const statusKey =
    BADGE_CONFIG[verificationStatus]
      ? verificationStatus
      : STATUS_ALIAS[verificationStatus] || "unverified";

  const config = BADGE_CONFIG[statusKey];
  const sizeConfig = SIZE_CONFIG[size];

  // For pending states, show a slightly different label
  const isPending = ["tier1_pending", "tier2_pending", "tier3_pending"].includes(verificationStatus);
  const label = isPending
    ? `Tier ${verificationStatus[4]} – Under Review`
    : size === "sm"
    ? config.shortLabel
    : config.label;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: sizeConfig.gap,
          padding: sizeConfig.padding,
          borderRadius: 20,
          background: config.bg,
          border: `1px solid ${config.border}`,
          color: config.color,
          fontSize: sizeConfig.fontSize,
          fontWeight: 600,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: config.color, display: "flex", alignItems: "center" }}>
          {config.icon}
        </span>
        {label}
      </span>

      {showDescription && (
        <span style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
          {config.description}
        </span>
      )}
    </div>
  );
}

// ── Usage in NGO card ─────────────────────────────────────────────────────────
export function NGOCard({ ngo }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        transition: "box-shadow 0.2s",
      }}
    >
      {/* Cover */}
      <div
        style={{
          height: 100,
          background: `linear-gradient(135deg, #0f2c5e, #22c55e)`,
          position: "relative",
        }}
      >
        {ngo.logo ? (
          <img
            src={ngo.logo}
            alt={ngo.organizationName}
            style={{
              position: "absolute",
              bottom: -24,
              left: 16,
              width: 48,
              height: 48,
              borderRadius: 8,
              border: "3px solid #fff",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              bottom: -24,
              left: 16,
              width: 48,
              height: 48,
              borderRadius: 8,
              border: "3px solid #fff",
              background: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: "#fff",
              fontSize: 20,
            }}
          >
            {ngo.organizationName?.[0]}
          </div>
        )}
      </div>

      <div style={{ padding: "2rem 1rem 1rem" }}>
        <div style={{ marginBottom: 6 }}>
          <VerificationBadge
            tier={ngo.tier}
            verificationStatus={ngo.verificationStatus}
            size="sm"
          />
        </div>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "8px 0 4px" }}>
          {ngo.organizationName}
        </h3>
        <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, marginBottom: 10 }}>
          {ngo.description?.slice(0, 120)}
          {ngo.description?.length > 120 ? "…" : ""}
        </p>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>
          📍 {ngo.location?.city}, {ngo.location?.state}
        </div>
        {ngo.focusAreas?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
            {ngo.focusAreas.slice(0, 3).map((f) => (
              <span
                key={f}
                style={{
                  fontSize: 11,
                  padding: "3px 8px",
                  background: "#f0fdf4",
                  color: "#15803d",
                  borderRadius: 12,
                }}
              >
                {f.replace("_", " ")}
              </span>
            ))}
          </div>
        )}
        <a
          href={`/ngo/${ngo._id}`}
          style={{
            display: "block",
            marginTop: 14,
            textAlign: "center",
            padding: "9px",
            background: "#f0fdf4",
            color: "#15803d",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          View Profile →
        </a>
      </div>
    </div>
  );
}
