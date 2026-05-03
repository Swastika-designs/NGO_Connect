import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ngoAPI } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';

const LINKS = [
  { to:'/dashboard', label:'Dashboard Overview', icon:'dashboard' },
  { to:'/dashboard/admin/ngos', label:'All NGOs', icon:'ngos' },
  { to:'/dashboard/admin/users', label:'All Users', icon:'users' },
  { divider:true },
  { to:'#', label:'Settings', icon:'settings' },
];

const TIER_INFO = {
  0: { label:'Unverified', icon:'⚪', cls:'badge-gray', color:'var(--gray-500)' },
  1: { label:'Bronze', icon:'🥉', cls:'', color:'#CD7F32', bg:'#FEF2E8', border:'#FDBA74' },
  2: { label:'Silver', icon:'🥈', cls:'', color:'#64748B', bg:'#F1F5F9', border:'#CBD5E1' },
  3: { label:'Gold', icon:'🏆', cls:'', color:'#92400E', bg:'#FEF3C7', border:'#FCD34D' },
};

function TierBadge({ tier = 0 }) {
  const t = TIER_INFO[tier] || TIER_INFO[0];
  return (
    <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'3px 9px', borderRadius:100, background:t.bg || 'var(--gray-100)', color:t.color, border:`1px solid ${t.border || 'var(--gray-200)'}` }}>
      {t.icon} {t.label}
    </span>
  );
}

export default function AdminNGOs() {
  const { user } = useAuth();
  const toast = useToast();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [tierModal, setTierModal] = useState(null); // { ngo }
  const [tierValue, setTierValue] = useState(1);
  const [adminNotes, setAdminNotes] = useState('');
  const [docModal, setDocModal] = useState(null); // { ngo }

  useEffect(() => {
    ngoAPI.getAllAdmin()
      .then(r => setNgos(r.data.ngos || []))
      .catch(() => toast.error('Failed to load NGOs'))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id, tier = 1) => {
    setActionLoading(id + '_a');
    try {
      await ngoAPI.approve(id, { tier, adminNotes });
      setNgos(prev => prev.map(n => n._id === id ? { ...n, isApproved:true, isVerified:tier>0, verificationTier:tier } : n));
      toast.success(`NGO approved with ${TIER_INFO[tier].label} tier ✅`);
      setTierModal(null);
    } catch { toast.error('Failed'); } finally { setActionLoading(null); }
  };

  const handleSetTier = async (id, tier) => {
    setActionLoading(id + '_t');
    try {
      await ngoAPI.setTier(id, { tier, adminNotes });
      setNgos(prev => prev.map(n => n._id === id ? { ...n, verificationTier:tier, isVerified:tier>0 } : n));
      toast.success(`Tier updated to ${TIER_INFO[tier].label} ✅`);
      setTierModal(null);
    } catch { toast.error('Failed'); } finally { setActionLoading(null); }
  };

  const handleBlock = async (id) => {
    setActionLoading(id + '_b');
    try {
      const res = await ngoAPI.toggleBlock(id);
      setNgos(prev => prev.map(n => n._id === id ? { ...n, isBlocked: res.data.ngo.isBlocked } : n));
      toast.success(res.data.message);
    } catch { toast.error('Failed'); } finally { setActionLoading(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this NGO permanently?')) return;
    setActionLoading(id + '_d');
    try {
      await ngoAPI.delete(id);
      setNgos(prev => prev.filter(n => n._id !== id));
      toast.success('NGO deleted');
    } catch { toast.error('Failed'); } finally { setActionLoading(null); }
  };

  const handleVerifyDoc = async (ngoId, docId, verified) => {
    try {
      const res = await ngoAPI.verifyDocument(ngoId, { docId, verified });
      setNgos(prev => prev.map(n => n._id === ngoId ? res.data.ngo : n));
      setDocModal(m => m ? { ...m, ngo: res.data.ngo } : null);
      toast.success(verified ? 'Document verified ✅' : 'Document unverified');
    } catch { toast.error('Failed'); }
  };

  const filtered = ngos.filter(n =>
    filter === 'all' ? true :
    filter === 'approved' ? n.isApproved && !n.isBlocked :
    filter === 'pending' ? !n.isApproved :
    filter === 'blocked' ? n.isBlocked :
    filter === 'gold' ? n.verificationTier === 3 :
    filter === 'silver' ? n.verificationTier === 2 :
    filter === 'bronze' ? n.verificationTier === 1 : true
  );

  const counts = {
    all: ngos.length,
    approved: ngos.filter(n=>n.isApproved&&!n.isBlocked).length,
    pending: ngos.filter(n=>!n.isApproved).length,
    blocked: ngos.filter(n=>n.isBlocked).length,
    gold: ngos.filter(n=>n.verificationTier===3).length,
    silver: ngos.filter(n=>n.verificationTier===2).length,
    bronze: ngos.filter(n=>n.verificationTier===1).length,
  };

  return (
    <SidebarLayout links={LINKS} subLabel="ADMIN PANEL">
      <div className="page-enter">
        <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', marginBottom:6 }}>All NGOs</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:20 }}>Manage verification tiers, approve, block and review documents.</p>

        {/* Tier legend */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
          {[
            { tier:3, desc:'Fully verified, all documents approved' },
            { tier:2, desc:'Partially verified, core docs checked' },
            { tier:1, desc:'Basic verification, registration confirmed' },
            { tier:0, desc:'Not yet reviewed by admin' },
          ].map(({ tier, desc }) => {
            const t = TIER_INFO[tier];
            return (
              <div key={tier} style={{ background:'white', border:`1px solid ${t.border||'var(--gray-200)'}`, borderRadius:10, padding:'12px 14px' }}>
                <div style={{ marginBottom:5 }}><TierBadge tier={tier} /></div>
                <div style={{ fontSize:'0.72rem', color:'var(--gray-500)', lineHeight:1.5 }}>{desc}</div>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:18 }}>
          {[['all','All'],['approved','Approved'],['pending','Pending'],['blocked','Blocked'],['gold','🏆 Gold'],['silver','🥈 Silver'],['bronze','🥉 Bronze']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{
              padding:'6px 14px', borderRadius:7, border:'1.5px solid', cursor:'pointer', fontWeight:600, fontSize:'0.8rem',
              borderColor: filter===v ? 'var(--green)' : 'var(--gray-200)',
              background: filter===v ? 'var(--green-pale)' : 'white',
              color: filter===v ? 'var(--green)' : 'var(--gray-600)',
            }}>{l} <span style={{ fontWeight:400 }}>({counts[v]||0})</span></button>
          ))}
        </div>

        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', overflow:'hidden' }}>
          <table className="table">
            <thead><tr><th>NGO</th><th>Category</th><th>Status</th><th>Tier</th><th>Documents</th><th>Created By</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:32 }}><span className="spinner" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:32, color:'var(--gray-400)' }}>No NGOs found</td></tr>
              ) : filtered.map(ngo => (
                <tr key={ngo._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:32, height:32, borderRadius:7, background:'var(--green-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.8rem', color:'var(--green)', flexShrink:0 }}>{ngo.name?.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{ngo.name}</div>
                        <div style={{ fontSize:'0.7rem', color:'var(--gray-400)' }}>{ngo.location?.city || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-gray" style={{ fontSize:'0.72rem' }}>{ngo.category}</span></td>
                  <td>
                    {ngo.isBlocked ? <span className="badge badge-red" style={{ fontSize:'0.72rem' }}>🚫 Blocked</span> :
                     ngo.isApproved ? <span className="badge badge-green" style={{ fontSize:'0.72rem' }}>✓ Approved</span> :
                     <span className="badge badge-yellow" style={{ fontSize:'0.72rem' }}>⏳ Pending</span>}
                  </td>
                  <td><TierBadge tier={ngo.verificationTier || 0} /></td>
                  <td>
                    <button onClick={() => setDocModal({ ngo })} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--blue)', fontSize:'0.8rem', fontWeight:600, textDecoration:'underline' }}>
                      {(ngo.documents||[]).length} doc{(ngo.documents||[]).length !== 1 ? 's' : ''} →
                    </button>
                  </td>
                  <td style={{ fontSize:'0.82rem', color:'var(--gray-600)' }}>{ngo.createdBy?.name || '—'}</td>
                  <td>
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                      {!ngo.isApproved && (
                        <button className="btn btn-primary btn-sm" style={{ fontSize:'0.68rem', padding:'3px 8px' }} disabled={!!actionLoading}
                          onClick={() => { setTierModal({ ngo, mode:'approve' }); setTierValue(1); setAdminNotes(''); }}>
                          Approve
                        </button>
                      )}
                      <button className="btn btn-outline btn-sm" style={{ fontSize:'0.68rem', padding:'3px 8px' }} disabled={!!actionLoading}
                        onClick={() => { setTierModal({ ngo, mode:'tier' }); setTierValue(ngo.verificationTier||0); setAdminNotes(ngo.adminNotes||''); }}>
                        Set Tier
                      </button>
                      <button className="btn btn-sm" style={{ fontSize:'0.68rem', padding:'3px 8px', background: ngo.isBlocked ? 'var(--green)' : 'var(--yellow)', color:'white', border:'none' }}
                        disabled={!!actionLoading} onClick={() => handleBlock(ngo._id)}>
                        {ngo.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button className="btn btn-danger btn-sm" style={{ fontSize:'0.68rem', padding:'3px 8px' }} disabled={!!actionLoading} onClick={() => handleDelete(ngo._id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tier Modal */}
      {tierModal && (
        <div onClick={() => setTierModal(null)} style={{ position:'fixed', inset:0, background:'rgba(17,24,39,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:16, width:'100%', maxWidth:480, padding:28, boxShadow:'var(--shadow-lg)' }}>
            <h3 style={{ fontWeight:700, color:'var(--navy)', fontSize:'1.05rem', marginBottom:4 }}>
              {tierModal.mode === 'approve' ? 'Approve NGO' : 'Update Verification Tier'}
            </h3>
            <p style={{ color:'var(--gray-500)', fontSize:'0.85rem', marginBottom:20 }}>{tierModal.ngo.name}</p>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontWeight:600, fontSize:'0.875rem', color:'var(--navy)', marginBottom:10 }}>Select Tier</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                {[0,1,2,3].map(t => {
                  const ti = TIER_INFO[t];
                  return (
                    <button key={t} type="button" onClick={() => setTierValue(t)} style={{
                      padding:'12px 8px', borderRadius:9, border:'2px solid', cursor:'pointer', textAlign:'center',
                      borderColor: tierValue===t ? ti.color||'var(--gray-400)' : 'var(--gray-200)',
                      background: tierValue===t ? (ti.bg||'var(--gray-100)') : 'white',
                    }}>
                      <div style={{ fontSize:'1.3rem' }}>{ti.icon}</div>
                      <div style={{ fontSize:'0.72rem', fontWeight:700, color:ti.color||'var(--gray-500)', marginTop:4 }}>{ti.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontWeight:600, fontSize:'0.875rem', color:'var(--navy)', marginBottom:6 }}>Admin Notes (optional)</label>
              <textarea className="form-input" rows={3} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="e.g. Registration number verified, waiting on tax certificate..." style={{ resize:'vertical' }} />
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setTierModal(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={!!actionLoading}
                onClick={() => tierModal.mode === 'approve' ? handleApprove(tierModal.ngo._id, tierValue) : handleSetTier(tierModal.ngo._id, tierValue)}>
                {actionLoading ? '...' : tierModal.mode === 'approve' ? 'Approve & Assign Tier' : 'Update Tier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Review Modal */}
      {docModal && (
        <div onClick={() => setDocModal(null)} style={{ position:'fixed', inset:0, background:'rgba(17,24,39,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:16, width:'100%', maxWidth:560, padding:28, boxShadow:'var(--shadow-lg)', maxHeight:'80vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <div>
                <h3 style={{ fontWeight:700, color:'var(--navy)', fontSize:'1.05rem', marginBottom:2 }}>Documents</h3>
                <p style={{ color:'var(--gray-500)', fontSize:'0.82rem' }}>{docModal.ngo.name}</p>
              </div>
              <button onClick={() => setDocModal(null)} style={{ background:'var(--gray-100)', border:'none', borderRadius:'50%', width:30, height:30, cursor:'pointer', fontSize:'1rem' }}>×</button>
            </div>
            {(docModal.ngo.documents||[]).length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--gray-400)' }}>
                <div style={{ fontSize:'2rem', marginBottom:8 }}>📄</div>
                <p>No documents uploaded yet.</p>
              </div>
            ) : (docModal.ngo.documents||[]).map(doc => (
              <div key={doc._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--gray-100)' }}>
                <div style={{ width:36, height:36, borderRadius:8, background:'var(--gray-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>📄</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--navy)' }}>{doc.name}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--gray-400)', textTransform:'capitalize' }}>{doc.type} • {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</div>
                  <a href={doc.url} target="_blank" rel="noreferrer" style={{ fontSize:'0.75rem', color:'var(--blue)' }}>View Document ↗</a>
                </div>
                <button onClick={() => handleVerifyDoc(docModal.ngo._id, doc._id, !doc.verified)} style={{
                  padding:'5px 12px', borderRadius:6, border:'1.5px solid', cursor:'pointer', fontWeight:600, fontSize:'0.75rem',
                  borderColor: doc.verified ? 'var(--green)' : 'var(--gray-300)',
                  background: doc.verified ? 'var(--green-pale)' : 'white',
                  color: doc.verified ? 'var(--green)' : 'var(--gray-500)',
                }}>
                  {doc.verified ? '✓ Verified' : 'Verify'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
