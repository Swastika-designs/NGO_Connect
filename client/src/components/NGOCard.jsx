import React from 'react';
import { Link } from 'react-router-dom';

const CAT_COLORS = {
  Education:'#3B82F6', Healthcare:'#EF4444', Environment:'#10B981',
  'Animal Welfare':'#F59E0B','Disaster Relief':'#EF4444',
  'Women Empowerment':'#8B5CF6','Child Welfare':'#F97316',
  'Food & Hunger':'#10B981','Poverty Alleviation':'#6366F1',
  'Human Rights':'#3B82F6','Arts & Culture':'#EC4899','Other':'#6B7280',
};

const TIER_LABELS = {
  gold: { label:'GOLD TIER', icon:'🏆', color:'#92400E', bg:'#FEF3C7', border:'#FCD34D' },
  silver: { label:'SILVER TIER', icon:'🥈', color:'#475569', bg:'#F1F5F9', border:'#CBD5E1' },
  bronze: { label:'BRONZE TIER', icon:'🥉', color:'#92400E', bg:'#FEF2E8', border:'#FDBA74' },
};

export default function NGOCard({ ngo, showActions = false, onDonate, onVolunteer }) {
  const catColor = CAT_COLORS[ngo.category] || '#6B7280';
  const tier = ngo.isVerified ? (ngo.isFeatured ? TIER_LABELS.gold : TIER_LABELS.silver) : null;

  return (
    <div className="card card-hover" style={{ overflow:'hidden', display:'flex', flexDirection:'column' }}>
      {/* Cover */}
      <div style={{
        height:160, position:'relative', overflow:'hidden',
        background: ngo.coverImage ? `url(${ngo.coverImage}) center/cover` : `linear-gradient(135deg, ${catColor}22 0%, ${catColor}44 100%)`,
        display:'flex', alignItems:'flex-start', justifyContent:'flex-end', padding:12,
      }}>
        {/* Category badge */}
        <span style={{
          position:'absolute', top:12, left:12,
          background: catColor, color:'white',
          padding:'3px 10px', borderRadius:100,
          fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase',
        }}>{ngo.category}</span>

        {/* Tier badge */}
        {tier && (
          <span style={{
            background:tier.bg, color:tier.color, border:`1px solid ${tier.border}`,
            padding:'3px 8px', borderRadius:100,
            fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.04em',
          }}>{tier.icon} {tier.label}</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding:'16px 18px', flex:1, display:'flex', flexDirection:'column' }}>
        {/* Logo + Name row */}
        <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:10 }}>
          <div style={{
            width:36, height:36, borderRadius:8, flexShrink:0,
            background: ngo.logo ? `url(${ngo.logo}) center/cover` : catColor,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'white', fontWeight:700, fontSize:'0.9rem', border:'2px solid white',
            boxShadow:'var(--shadow-sm)',
          }}>{!ngo.logo && ngo.name?.charAt(0)}</div>
          <div>
            <h3 style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--navy)', lineHeight:1.3 }}>{ngo.name}</h3>
            {ngo.isVerified && <span style={{ fontSize:'0.72rem', color:'var(--green)', fontWeight:600 }}>✓ Verified Organization</span>}
          </div>
        </div>

        <p style={{
          fontSize:'0.83rem', color:'var(--gray-600)', lineHeight:1.65,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
          marginBottom:12, flex:1,
        }}>{ngo.description}</p>

        {/* Location + supporters */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, fontSize:'0.78rem', color:'var(--gray-500)' }}>
          {ngo.location?.city && <span>📍 {ngo.location.city}{ngo.location.state ? `, ${ngo.location.state}` : ''}</span>}
          {ngo.donorCount > 0 && <span>👥 {ngo.donorCount.toLocaleString()} Supporters</span>}
        </div>

        {/* Actions */}
        {showActions ? (
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-primary btn-sm" style={{ flex:1, justifyContent:'center' }} onClick={onDonate}>Donate</button>
            <button className="btn btn-outline btn-sm" style={{ flex:1, justifyContent:'center' }} onClick={onVolunteer}>View Profile</button>
          </div>
        ) : (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:'1px solid var(--gray-100)' }}>
            <span style={{ fontSize:'0.78rem', color:'var(--gray-500)' }}>ACTIVE PROJECTS: {String(ngo.volunteerCount || 0).padStart(2,'0')}</span>
            <Link to={`/ngos/${ngo._id}`} style={{ color:'var(--green)', fontSize:'0.82rem', fontWeight:600, transition:'gap 0.15s' }}>Learn More →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
