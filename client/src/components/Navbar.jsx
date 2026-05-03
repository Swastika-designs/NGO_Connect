import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
    <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg, #10B981, #059669)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    </div>
    <span style={{ fontWeight:800, fontSize:'1.05rem', color:'var(--navy)', letterSpacing:'-0.01em' }}>NGO Connect</span>
  </div>
);

const NAV_LINKS_BY_ROLE = {
  donor: [
    { to:'/ngos', label:'Browse NGOs' },
    { to:'/dashboard', label:'My Donations' },
  ],
  volunteer: [
    { to:'/ngos', label:'Browse NGOs' },
    { to:'/opportunities', label:'Find Opportunities' },
    { to:'/dashboard', label:'My Applications' },
  ],
  ngo: [
    { to:'/dashboard', label:'My NGO' },
    { to:'/dashboard/post-event', label:'Post Event' },
  ],
  admin: [
    { to:'/dashboard', label:'Admin Panel' },
    { to:'/dashboard/admin/ngos', label:'All NGOs' },
    { to:'/dashboard/admin/users', label:'All Users' },
  ],
};

const PUBLIC_LINKS = [
  { to:'/#how-it-works', label:'How it Works' },
  { to:'/ngos', label:'Explore NGOs' },
  { to:'/#impact', label:'Impact' },
  { to:'/#volunteer', label:'Volunteer' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => setMenuOpen(false), [location]);

  const isHome = location.pathname === '/';
  const forceDark = !isHome || scrolled;
  const navLinks = user ? (NAV_LINKS_BY_ROLE[user.role] || PUBLIC_LINKS) : PUBLIC_LINKS;

  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:1000,
      background: forceDark ? 'rgba(255,255,255,0.97)' : 'transparent',
      backdropFilter: forceDark ? 'blur(12px)' : 'none',
      borderBottom: forceDark ? '1px solid var(--gray-200)' : 'none',
      transition:'all 0.3s ease',
    }}>
      <div className="container" style={{ display:'flex', alignItems:'center', height:64, gap:8 }}>
        <Link to="/"><Logo /></Link>

        <div style={{ display:'flex', alignItems:'center', gap:4, marginLeft:32, flex:1 }} className="nav-links">
          {navLinks.map(({ to, label }) => (
            <Link key={label} to={to}
              style={{
                padding:'8px 14px', borderRadius:6, fontSize:'0.875rem', fontWeight:500,
                color: (!forceDark) ? 'rgba(255,255,255,0.9)' : 'var(--gray-600)',
                transition:'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#10B981'}
              onMouseLeave={e => e.currentTarget.style.color = (!forceDark) ? 'rgba(255,255,255,0.9)' : 'var(--gray-600)'}
            >{label}</Link>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }} className="nav-actions">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ color: forceDark ? undefined : 'rgba(255,255,255,0.9)' }}>Dashboard</Link>
              <div style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'5px 12px', borderRadius:20,
                background: forceDark ? 'var(--gray-100)' : 'rgba(255,255,255,0.15)',
                border:'1px solid', borderColor: forceDark ? 'var(--gray-200)' : 'rgba(255,255,255,0.2)',
              }}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700, color:'white' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize:'0.85rem', fontWeight:600, color: forceDark ? 'var(--navy)' : 'white' }}>
                  {user.name?.split(' ')[0]}
                </span>
              </div>
              <button onClick={() => { logout(); navigate('/'); }} className="btn btn-ghost btn-sm" style={{ color: forceDark ? 'var(--gray-500)' : 'rgba(255,255,255,0.7)' }}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" style={{ color: forceDark ? undefined : 'rgba(255,255,255,0.9)' }}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>

        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}
          style={{ display:'none', flexDirection:'column', gap:5, padding:8, background:'none', marginLeft:8 }}>
          {[0,1,2].map(i => <span key={i} style={{ display:'block', width:20, height:2, background: forceDark ? 'var(--navy)' : 'white', borderRadius:2 }} />)}
        </button>
      </div>

      {menuOpen && (
        <div style={{ background:'white', borderTop:'1px solid var(--gray-200)', padding:'12px 24px 20px' }}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{ display:'block', padding:'10px 0', fontSize:'0.9rem', fontWeight:500, color:'var(--gray-700)', borderBottom:'1px solid var(--gray-100)' }}>{label}</Link>
          ))}
          {user ? (
            <button onClick={() => { logout(); navigate('/'); }} style={{ marginTop:12, color:'var(--red)', background:'none', border:'none', fontSize:'0.9rem', fontWeight:500 }}>Sign out</button>
          ) : (
            <Link to="/login" style={{ display:'block', marginTop:12, color:'var(--green)', fontWeight:600 }}>Login / Register</Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-actions .btn-ghost { display: none; }
        }
      `}</style>
    </nav>
  );
}
