import { useNavigate } from "react-router-dom";

const NGOs = [
  {
    slug: "green-earth-initiative",
    name: "Green Earth Initiative",
    category: "Environment",
    summary:
      "Reforestation and climate-resilient farming initiatives across rural communities.",
  },
  {
    slug: "education-for-all",
    name: "Education For All",
    category: "Education",
    summary:
      "Digital literacy and scholarship support programs for low-income students.",
  },
  {
    slug: "heal-the-world",
    name: "Heal The World",
    category: "Healthcare",
    summary:
      "Mobile clinics and medicine access for underserved populations.",
  },
];

export default function NGOsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.25rem" }}>
      <h1 style={{ marginBottom: 8 }}>Explore NGOs</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Discover verified organizations and learn how you can contribute.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        {NGOs.map((ngo) => (
          <article
            key={ngo.slug}
            style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}
          >
            <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>
              {ngo.category}
            </div>
            <h3 style={{ margin: "0 0 8px" }}>{ngo.name}</h3>
            <p style={{ color: "#4b5563", marginBottom: 12 }}>{ngo.summary}</p>
            <button
              onClick={() => navigate(`/ngos/${ngo.slug}`)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: "#111827",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Learn More
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
