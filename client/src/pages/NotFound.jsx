import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-enter" style={{ minHeight:'100vh', paddingTop:80, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--gray-50)', textAlign:'center', padding:'120px 24px' }}>
      <div>
        <div style={{ fontWeight:900, fontSize:'7rem', color:'var(--gray-200)', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>404</div>
        <h1 style={{ fontWeight:800, fontSize:'1.8rem', color:'var(--navy)', marginBottom:10, marginTop:8 }}>Page not found</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.95rem', marginBottom:32 }}>The page you're looking for doesn't exist or has been moved.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <Link to="/" className="btn btn-primary">Go Home</Link>
          <Link to="/ngos" className="btn btn-outline">Browse NGOs</Link>
        </div>
      </div>
    </div>
  );
}
