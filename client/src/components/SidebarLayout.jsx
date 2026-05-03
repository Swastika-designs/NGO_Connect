import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
    <div style={{ width:30, height:30, borderRadius:7, background:'linear-gradient(135deg,#10B981,#059669)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    </div>
    <div>
      <div style={{ fontWeight:800, fontSize:'0.9rem', color:'var(--navy)', lineHeight:1.1 }}>NGO Connect</div>
      <div style={{ fontSize:'0.65rem', color:'var(--gray-500)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em' }}>Empowering Change</div>
    </div>
  </div>
);

const Icon = ({ name }) => {
  const icons = {
    dashboard: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
    ngos: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    history: <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
    impact: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    profile: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    events: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    applications: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    approve: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    stats: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    help: <><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    feedback: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
  };
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

export default function SidebarLayout({ links, subLabel, bottomLinks, children, topRight }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Logo />
          {subLabel && <div style={{ fontSize:'0.68rem', color:'var(--gray-400)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginTop:4 }}>{subLabel}</div>}
        </div>

        <nav className="sidebar-nav">
          {links.map((link, i) => {
            if (link.divider) return <div key={i} className="divider" style={{ margin:'10px 0' }} />;
            const isActive = currentPath === link.to || (link.to !== '/dashboard' && currentPath.startsWith(link.to));
            return (
              <Link key={link.to} to={link.to}
                className={`sidebar-link ${isActive ? 'active' : ''} ${link.danger ? 'danger' : ''}`}>
                <Icon name={link.icon} />
                <span>{link.label}</span>
                {link.badge && (
                  <span style={{ marginLeft:'auto', background:'var(--green)', color:'white', borderRadius:100, fontSize:'0.65rem', fontWeight:700, padding:'1px 6px', minWidth:18, textAlign:'center' }}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User at bottom */}
        <div style={{ padding:'12px 16px', borderTop:'1px solid var(--gray-200)', marginTop:'auto' }}>
          {bottomLinks?.map(link => (
            <Link key={link.to} to={link.to} className={`sidebar-link ${link.danger?'danger':''}`} style={{ marginBottom:2 }}>
              <Icon name={link.icon} />
              <span>{link.label}</span>
            </Link>
          ))}
          <div style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 4px', marginTop:4 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--gray-200)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem', color:'var(--gray-600)', overflow:'hidden' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--navy)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize:'0.7rem', color:'var(--gray-500)', textTransform:'capitalize' }}>{user?.role}</div>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} style={{ background:'none', border:'none', color:'var(--gray-400)', cursor:'pointer', padding:4, borderRadius:4 }} title="Sign out">
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {topRight && (
          <div style={{ position:'sticky', top:0, zIndex:50, background:'white', borderBottom:'1px solid var(--gray-200)', padding:'0 28px', height:56, display:'flex', alignItems:'center', justifyContent:'flex-end', gap:12 }}>
            {topRight}
          </div>
        )}
        <div style={{ padding:'28px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
