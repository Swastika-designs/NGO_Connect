import { useState } from "react";

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --teal: #1a9e8f;
    --teal-light: #22c6b1;
    --dark: #0f1a1c;
    --white: #ffffff;
    --off-white: #f4f7f6;
    --gray: #6b7f82;
    --light-border: #dce8e6;
  }

  body { font-family: 'DM Sans', sans-serif; color: var(--dark); background: var(--white); }

  /* NAV */
  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 48px; background: var(--white);
    border-bottom: 1px solid var(--light-border);
    position: sticky; top: 0; z-index: 100;
  }
  .nav-logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 1rem; color: var(--dark); text-decoration: none; }
  .nav-links { display: flex; gap: 28px; list-style: none; }
  .nav-links a { text-decoration: none; color: var(--dark); font-size: 0.9rem; font-weight: 500; transition: color .2s; }
  .nav-links a:hover { color: var(--teal); }
  .nav-actions { display: flex; gap: 12px; align-items: center; }
  .btn-ghost { background: none; border: none; cursor: pointer; font-size: 0.9rem; font-weight: 600; color: var(--dark); font-family: inherit; }
  .btn-register { background: var(--dark); color: var(--white); border: none; border-radius: 6px; padding: 8px 20px; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .2s; }
  .btn-register:hover { background: var(--teal); }

  /* HERO */
  .hero { background: var(--dark); color: var(--white); padding: 48px 48px 0; border-radius: 20px; margin: 24px 24px 0; min-height: 340px; display: flex; align-items: flex-end; justify-content: space-between; overflow: hidden; position: relative; }
  .hero-badge { display: inline-block; font-size: 0.65rem; font-weight: 700; letter-spacing: .12em; color: var(--teal-light); text-transform: uppercase; margin-bottom: 16px; }
  .hero-title { font-family: 'DM Serif Display', serif; font-size: 3rem; line-height: 1.1; max-width: 520px; }
  .hero-title .accent { color: var(--teal-light); font-style: italic; }
  .hero-sub { margin-top: 16px; color: #a8bfc2; font-size: 0.92rem; line-height: 1.6; max-width: 440px; }
  .hero-btns { margin-top: 28px; display: flex; gap: 10px; flex-wrap: wrap; padding-bottom: 40px; }
  .btn-hero { background: var(--white); color: var(--dark); border: 2px solid var(--white); border-radius: 6px; padding: 10px 20px; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .2s; }
  .btn-hero:hover { background: var(--teal); border-color: var(--teal); color: var(--white); }
  .hero-support { display: flex; align-items: center; gap: 6px; color: #a8bfc2; font-size: 0.82rem; margin-top: 12px; cursor: pointer; }
  .hero-support:hover { color: var(--teal-light); }
  .hero-art { width: 300px; flex-shrink: 0; display: flex; align-items: flex-end; }

  /* STATS */
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 32px 24px; }
  .stat-card { background: var(--white); border: 1px solid var(--light-border); border-radius: 14px; padding: 20px 24px; text-align: center; }
  .stat-icon { font-size: 1.6rem; margin-bottom: 8px; }
  .stat-label { font-size: 0.65rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--gray); }
  .stat-value { font-family: 'DM Serif Display', serif; font-size: 2rem; margin: 6px 0; color: var(--dark); }
  .stat-change { font-size: 0.72rem; color: var(--teal); font-weight: 600; }

  /* SECTION */
  .section { padding: 48px 24px; }
  .section-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; }
  .section-title { font-family: 'DM Serif Display', serif; font-size: 2rem; }
  .section-sub { color: var(--gray); font-size: 0.88rem; line-height: 1.6; margin-top: 6px; max-width: 360px; }
  .link-explore { color: var(--teal); font-size: 0.85rem; font-weight: 600; text-decoration: none; white-space: nowrap; margin-top: 8px; display: inline-block; }

  /* NGO CARDS */
  .ngo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .ngo-card { border: 1px solid var(--light-border); border-radius: 16px; overflow: hidden; transition: transform .2s, box-shadow .2s; }
  .ngo-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.1); }
  .ngo-img { height: 160px; position: relative; display: flex; align-items: center; justify-content: center; font-size: 3rem; }
  .ngo-badge { position: absolute; top: 12px; right: 12px; font-size: 0.65rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: .08em; }
  .badge-env { background: #dcf5e7; color: #2e7d32; }
  .badge-edu { background: #dbeafe; color: #1e40af; }
  .badge-health { background: #fee2e2; color: #b91c1c; }
  .ngo-body { padding: 16px; }
  .ngo-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .ngo-icon { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
  .ngo-name { font-weight: 700; font-size: 0.95rem; }
  .ngo-desc { color: var(--gray); font-size: 0.8rem; line-height: 1.5; margin-bottom: 14px; }
  .ngo-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--light-border); }
  .ngo-projects { font-size: 0.7rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--gray); }
  .btn-learn { color: var(--teal); font-size: 0.8rem; font-weight: 700; background: none; border: none; cursor: pointer; font-family: inherit; }

  /* CTA */
  .cta-section { background: var(--off-white); text-align: center; padding: 72px 24px; }
  .cta-title { font-family: 'DM Serif Display', serif; font-size: 2.5rem; margin-bottom: 12px; }
  .cta-sub { color: var(--gray); max-width: 440px; margin: 0 auto 32px; font-size: 0.9rem; line-height: 1.6; }
  .cta-btns { display: flex; gap: 12px; justify-content: center; }
  .btn-primary { background: var(--dark); color: var(--white); border: 2px solid var(--dark); border-radius: 8px; padding: 13px 28px; font-size: 0.9rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .2s; }
  .btn-primary:hover { background: var(--teal); border-color: var(--teal); }
  .btn-outline { background: transparent; color: var(--dark); border: 2px solid var(--dark); border-radius: 8px; padding: 13px 28px; font-size: 0.9rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .2s; }
  .btn-outline:hover { border-color: var(--teal); color: var(--teal); }

  /* FOOTER */
  footer { background: var(--white); border-top: 1px solid var(--light-border); padding: 48px 48px 24px; }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 40px; margin-bottom: 40px; }
  .footer-brand-desc { color: var(--gray); font-size: 0.85rem; line-height: 1.6; margin-top: 10px; max-width: 240px; }
  .footer-social { display: flex; gap: 12px; margin-top: 16px; font-size: 1.2rem; }
  .footer-col h4 { font-size: 0.85rem; font-weight: 700; margin-bottom: 14px; }
  .footer-col ul { list-style: none; }
  .footer-col li { margin-bottom: 8px; }
  .footer-col a { color: var(--gray); font-size: 0.83rem; text-decoration: none; }
  .footer-col a:hover { color: var(--teal); }
  .newsletter-desc { color: var(--gray); font-size: 0.82rem; margin-bottom: 12px; line-height: 1.5; }
  .newsletter-input { display: flex; border: 1px solid var(--light-border); border-radius: 8px; overflow: hidden; }
  .newsletter-input input { flex: 1; padding: 10px 14px; border: none; outline: none; font-size: 0.83rem; font-family: inherit; }
  .newsletter-input button { background: var(--teal); color: white; border: none; padding: 10px 16px; cursor: pointer; font-family: inherit; font-weight: 600; font-size: 0.85rem; }
  .footer-bottom { border-top: 1px solid var(--light-border); padding-top: 20px; display: flex; justify-content: center; gap: 24px; }
  .footer-bottom a { color: var(--gray); font-size: 0.78rem; text-decoration: none; }
  .footer-bottom a:hover { color: var(--teal); }

  @media (max-width: 900px) {
    .nav { padding: 14px 20px; }
    .nav-links { display: none; }
    .hero { margin: 12px; padding: 32px 24px 0; }
    .hero-title { font-size: 2rem; }
    .hero-art { display: none; }
    .stats-row { grid-template-columns: repeat(2, 1fr); padding: 20px 12px; }
    .ngo-grid { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .section { padding: 36px 16px; }
  }
`;

const HeroArt = () => (
  <svg viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%" }}>
    <text x="20" y="100" fill="rgba(255,255,255,0.05)" fontSize="48" fontWeight="900" fontFamily="sans-serif">VOLUNTEER</text>
    {/* Person 1 */}
    <circle cx="75" cy="140" r="22" fill="#f5c5a3" />
    <rect x="55" y="158" width="40" height="80" rx="10" fill="#22c6b1" />
    <rect x="36" y="162" width="18" height="52" rx="7" fill="#1a9e8f" />
    <rect x="96" y="162" width="18" height="52" rx="7" fill="#1a9e8f" />
    <ellipse cx="75" cy="248" rx="34" ry="7" fill="rgba(0,0,0,0.25)" />
    {/* Person 2 */}
    <circle cx="162" cy="135" r="24" fill="#d4956a" />
    <rect x="140" y="155" width="44" height="85" rx="10" fill="#2d8c6f" />
    <rect x="120" y="160" width="19" height="56" rx="7" fill="#256b54" />
    <rect x="185" y="160" width="19" height="56" rx="7" fill="#256b54" />
    <ellipse cx="162" cy="248" rx="38" ry="7" fill="rgba(0,0,0,0.25)" />
    {/* Person 3 */}
    <circle cx="248" cy="142" r="21" fill="#f5c5a3" />
    <rect x="229" y="159" width="38" height="80" rx="10" fill="#e8963a" />
    <rect x="211" y="164" width="17" height="50" rx="7" fill="#c97d28" />
    <rect x="268" y="164" width="17" height="50" rx="7" fill="#c97d28" />
    <ellipse cx="248" cy="248" rx="32" ry="7" fill="rgba(0,0,0,0.25)" />
  </svg>
);

const stats = [
  { icon: "👥", label: "Volunteers Joined", value: "50k+", change: "+12% this month" },
  { icon: "🛡️", label: "NGOs Verified", value: "1.2k+", change: "+5% this month" },
  { icon: "💰", label: "Funds Raised", value: "₹20M+", change: "+18% this month" },
  { icon: "🌍", label: "Lives Impacted", value: "20M+", change: "+10% this month" },
];

const ngos = [
  { name: "Green Earth Initiative", desc: "Leading reforestation efforts across Sub-Saharan Africa and promoting sustainable environmental practices.", badge: "Environment", badgeClass: "badge-env", icon: "🌿", iconBg: "#dcf5e7", bg: "#3a6b4e", emoji: "🌳", projects: 14 },
  { name: "Education For All", desc: "Providing digital literacy and educational resources to underprivileged urban communities worldwide.", badge: "Education", badgeClass: "badge-edu", icon: "📚", iconBg: "#dbeafe", bg: "#3b5ea0", emoji: "📖", projects: 32 },
  { name: "Heal The World", desc: "Delivering vital medical supplies and mobile clinics to disaster-affected regions globally.", badge: "Healthcare", badgeClass: "badge-health", icon: "🏥", iconBg: "#fee2e2", bg: "#5c8a5e", emoji: "🩺", projects: 8 },
];

export default function NGOConnect() {
  const [email, setEmail] = useState("");

  return (
    <>
      <style>{styles}</style>

      {/* NAV */}
      <nav className="nav">
        <a href="#" className="nav-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a9e8f" strokeWidth="2.2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          NGO Connect
        </a>
        <ul className="nav-links">
          {["How It Works", "Explore NGOs", "Impact", "Volunteer"].map(l => (
            <li key={l}><a href="#">{l}</a></li>
          ))}
        </ul>
        <div className="nav-actions">
          <button className="btn-ghost">Login</button>
          <button className="btn-register">Register</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div style={{ paddingBottom: 40 }}>
          <span className="hero-badge">Global Community</span>
          <h1 className="hero-title">
            Connecting <span className="accent">Passion</span><br />with Purpose
          </h1>
          <p className="hero-sub">
            Empowering communities by bringing together dedicated volunteers and impactful organizations to solve the world's most pressing challenges.
          </p>
          <div className="hero-btns">
            {["Join as Volunteer", "Join as NGO", "Join as Donor"].map(t => (
              <button key={t} className="btn-hero">{t}</button>
            ))}
          </div>
          <div className="hero-support">♡ Support a Cause</div>
        </div>
        <div className="hero-art"><HeroArt /></div>
      </section>

      {/* STATS */}
      <div className="stats-row">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-change">↑ {s.change}</div>
          </div>
        ))}
      </div>

      {/* FEATURED NGOs */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured NGOs</h2>
            <p className="section-sub">Spotlighting organizations that are making real, measurable impact across the globe. Join their mission today.</p>
          </div>
          <a href="#" className="link-explore">Explore All NGOs →</a>
        </div>
        <div className="ngo-grid">
          {ngos.map(n => (
            <div key={n.name} className="ngo-card">
              <div className="ngo-img" style={{ background: n.bg }}>
                <span style={{ fontSize: "3.5rem" }}>{n.emoji}</span>
                <span className={`ngo-badge ${n.badgeClass}`}>{n.badge}</span>
              </div>
              <div className="ngo-body">
                <div className="ngo-name-row">
                  <div className="ngo-icon" style={{ background: n.iconBg }}>{n.icon}</div>
                  <span className="ngo-name">{n.name}</span>
                </div>
                <p className="ngo-desc">{n.desc}</p>
                <div className="ngo-footer">
                  <span className="ngo-projects">Active Projects: {String(n.projects).padStart(2, "0")}</span>
                  <button className="btn-learn">Learn More</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to make a difference?</h2>
        <p className="cta-sub">Whether you have an hour to give or a lifelong mission to lead, NGO Connect provides the tools and network to amplify your impact.</p>
        <div className="cta-btns">
          <button className="btn-primary">Get Started Today</button>
          <button className="btn-outline">Contact Support</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div>
            <a href="#" className="nav-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a9e8f" strokeWidth="2.2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              NGO Connect
            </a>
            <p className="footer-brand-desc">The world's leading platform for social impact, connecting passionate individuals with organizations that change lives.</p>
            <div className="footer-social">🌐 🔗 ✉️</div>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>{["How It Works", "NGO Search", "Volunteer Opportunities", "Donation Portal"].map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>{["Help Center", "Impact Reports", "Trust & Safety", "Partnerships"].map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
          </div>
          <div className="footer-col">
            <h4>Newsletter</h4>
            <p className="newsletter-desc">Stay updated with the latest stories and opportunities.</p>
            <div className="newsletter-input">
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
              <button>→</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => <a href="#" key={l}>{l}</a>)}
        </div>
      </footer>
    </>
  );
}
