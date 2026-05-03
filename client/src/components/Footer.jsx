import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background:'var(--navy)', color:'rgba(255,255,255,0.65)', padding:'56px 0 32px' }}>
      <div className="container">
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1.2fr', gap:40, marginBottom:48 }}>
          {/* Brand */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:14 }}>
              <div style={{ width:30, height:30, borderRadius:7, background:'linear-gradient(135deg,#10B981,#059669)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span style={{ fontWeight:800, fontSize:'1rem', color:'white' }}>NGO Connect</span>
            </div>
            <p style={{ fontSize:'0.875rem', lineHeight:1.7, maxWidth:220 }}>
              The world's leading platform for social impact, connecting passionate individuals with organizations that change lives.
            </p>
            <div style={{ display:'flex', gap:12, marginTop:16 }}>
              {['🌐','📤','✉️'].map((icon, i) => (
                <button key={i} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:7, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', cursor:'pointer', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 style={{ color:'white', fontSize:'0.8rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:16 }}>Platform</h4>
            <nav style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[['/#how-it-works','How it Works'],['/ngos','NGO Search'],['/#volunteer','Volunteer Opportunities'],['/#donate','Donation Portal']].map(([to,label]) => (
                <Link key={label} to={to} style={{ fontSize:'0.875rem', transition:'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color='var(--green)'}
                  onMouseLeave={e => e.target.style.color=''}>{label}</Link>
              ))}
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 style={{ color:'white', fontSize:'0.8rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:16 }}>Resources</h4>
            <nav style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[['#','Help Center'],['#','Impact Reports'],['#','Trust & Safety'],['#','Partnerships']].map(([to,label]) => (
                <a key={label} href={to} style={{ fontSize:'0.875rem', transition:'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color='var(--green)'}
                  onMouseLeave={e => e.target.style.color=''}>{label}</a>
              ))}
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ color:'white', fontSize:'0.8rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:16 }}>Newsletter</h4>
            <p style={{ fontSize:'0.875rem', lineHeight:1.6, marginBottom:14 }}>Stay updated with the latest stories and opportunities.</p>
            <div style={{ display:'flex', gap:0 }}>
              <input placeholder="Email address" style={{
                flex:1, padding:'9px 14px', borderRadius:'6px 0 0 6px',
                border:'none', background:'rgba(255,255,255,0.1)', color:'white',
                fontSize:'0.85rem', outline:'none',
              }} />
              <button className="btn btn-primary btn-sm" style={{ borderRadius:'0 6px 6px 0', padding:'9px 14px' }}>→</button>
            </div>
          </div>
        </div>

        <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:24, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12, fontSize:'0.8rem' }}>
          <span>© {new Date().getFullYear()} NGO Connect. All rights reserved.</span>
          <div style={{ display:'flex', gap:24 }}>
            {['Privacy Policy','Terms of Service','Cookie Policy'].map(t => (
              <a key={t} href="#" style={{ transition:'color 0.15s' }}
                onMouseEnter={e => e.target.style.color='white'}
                onMouseLeave={e => e.target.style.color=''}>{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
