import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ngoAPI, statsAPI, feedbackAPI } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';

const LINKS = [
  { to:'/dashboard', label:'Dashboard Overview', icon:'dashboard' },
  { to:'/dashboard/admin/ngos', label:'All NGOs', icon:'ngos' },
  { to:'/dashboard/admin/users', label:'All Users', icon:'users' },
  { to:'/dashboard/messages', label:'Messages', icon:'feedback' },
  { divider:true },
  { to:'#', label:'Settings', icon:'settings' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [pendingNgos, setPendingNgos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    Promise.all([ngoAPI.getPending(), statsAPI.get(), feedbackAPI.getAll().catch(() => ({ data:{ feedback:[] } }))])
      .then(([n, s, f]) => {
        setPendingNgos(n.data.ngos || []);
        setStats(s.data.stats);
        setFeedback(f.data.feedback || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    try {
      await ngoAPI.approve(id);
      setPendingNgos(prev => prev.filter(n => n._id !== id));
      toast.success('NGO approved and published! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    setActionLoading(id + '_reject');
    try {
      await ngoAPI.delete(id);
      setPendingNgos(prev => prev.filter(n => n._id !== id));
      toast.success('NGO rejected and removed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally { setActionLoading(null); }
  };

  const topRight = (
    <>
      <div style={{ position:'relative' }}>
        <input placeholder="Search for NGOs..." className="form-input" style={{ width:250, padding:'7px 12px 7px 30px', fontSize:'0.82rem' }} />
        <span style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', fontSize:'0.8rem' }}>🔍</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontWeight:700, fontSize:'0.85rem', color:'var(--navy)' }}>{user?.name}</div>
          <div style={{ fontSize:'0.7rem', color:'var(--gray-500)' }}>Super Administrator</div>
        </div>
        <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--gray-200)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem', color:'var(--gray-600)' }}>{user?.name?.charAt(0)}</div>
      </div>
    </>
  );

  return (
    <SidebarLayout links={LINKS} subLabel="ADMIN PANEL" topRight={topRight}>
      <div className="page-enter">
        {/* Admin hint box */}
        <div style={{ background:'var(--navy)', borderRadius:9, padding:'10px 16px', marginBottom:18, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:'0.85rem' }}>🔑</span>
          <span style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.7)' }}>Admin login: <strong style={{ color:'var(--green)' }}>admin@ngoconnect.in</strong> / <strong style={{ color:'var(--green)' }}>admin123</strong></span>
        </div>

        <div style={{ fontSize:'0.78rem', color:'var(--gray-400)', marginBottom:10 }}>Home › <span style={{ color:'var(--navy)', fontWeight:500 }}>Dashboard Overview</span></div>
        <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', marginBottom:22 }}>System Health</h1>

        {/* Stats cards — real data */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
          {[
            { label:'TOTAL USERS', value: loading ? '—' : (stats?.totalUsers ?? 0), sub:'Live count', icon:'👥' },
            { label:'APPROVED NGOs', value: loading ? '—' : (stats?.totalNGOs ?? 0), sub:`${pendingNgos.length} Pending Approval`, sc:'var(--yellow)', icon:'🏛️' },
            { label:'TOTAL DONATIONS', value: loading ? '—' : (stats?.totalAmount ? `₹${(stats.totalAmount/1000).toFixed(0)}k` : '₹0'), sub: stats?.totalDonations ? `${stats.totalDonations} transactions` : 'No donations yet', icon:'💰' },
          ].map(s => (
            <div key={s.label} style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 22px', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:46, height:46, borderRadius:11, background:'var(--gray-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:'0.67rem', fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>{s.label}</div>
                <div style={{ fontWeight:800, fontSize:'1.35rem', color:'var(--navy)', lineHeight:1, marginBottom:2 }}>{s.value}</div>
                <div style={{ fontSize:'0.72rem', fontWeight:600, color:s.sc||'var(--green)' }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick links to sub-pages */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
          <Link to="/dashboard/admin/ngos" style={{ background:'white', border:'1px solid var(--gray-200)', borderRadius:12, padding:'16px 20px', textDecoration:'none', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:9, background:'var(--green-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>🏛️</div>
            <div>
              <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem' }}>All NGOs</div>
              <div style={{ fontSize:'0.75rem', color:'var(--gray-500)' }}>View and manage all NGOs</div>
            </div>
            <span style={{ marginLeft:'auto', color:'var(--gray-400)' }}>→</span>
          </Link>
          <Link to="/dashboard/admin/users" style={{ background:'white', border:'1px solid var(--gray-200)', borderRadius:12, padding:'16px 20px', textDecoration:'none', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:9, background:'var(--blue-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>👥</div>
            <div>
              <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem' }}>All Users</div>
              <div style={{ fontSize:'0.75rem', color:'var(--gray-500)' }}>View all registered users</div>
            </div>
            <span style={{ marginLeft:'auto', color:'var(--gray-400)' }}>→</span>
          </Link>
        </div>

        {/* Approvals + Feedback */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:18 }}>
          <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem' }}>
                Pending NGO Approvals
                {pendingNgos.length > 0 && (
                  <span style={{ marginLeft:8, background:'var(--yellow)', color:'white', borderRadius:100, fontSize:'0.65rem', fontWeight:700, padding:'2px 7px' }}>{pendingNgos.length}</span>
                )}
              </div>
            </div>
            <table className="table">
              <thead><tr><th>Organization</th><th>Category</th><th>Applied</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign:'center', padding:24 }}><span className="spinner" /></td></tr>
                ) : pendingNgos.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign:'center', padding:'36px 0', color:'var(--gray-400)' }}>
                      <div style={{ fontSize:'2rem', marginBottom:8 }}>✅</div>
                      <p>All caught up! No pending approvals.</p>
                    </td>
                  </tr>
                ) : pendingNgos.map((ngo, i) => {
                  const cls = ['badge-green','badge-blue','badge-red','badge-yellow'][i % 4];
                  return (
                    <tr key={ngo._id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:30, height:30, borderRadius:7, background:'var(--green-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.78rem', color:'var(--green)' }}>{ngo.name?.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{ngo.name}</div>
                            {ngo.createdBy?.email && <div style={{ fontSize:'0.72rem', color:'var(--gray-400)' }}>{ngo.createdBy.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge ${cls}`}>{ngo.category}</span></td>
                      <td style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>{new Date(ngo.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-primary btn-sm" style={{ fontSize:'0.7rem', padding:'4px 10px' }} disabled={!!actionLoading} onClick={() => handleApprove(ngo._id)}>
                            {actionLoading === ngo._id + '_approve' ? '...' : 'Approve'}
                          </button>
                          <button className="btn btn-danger btn-sm" style={{ fontSize:'0.7rem', padding:'4px 10px' }} disabled={!!actionLoading} onClick={() => handleReject(ngo._id)}>
                            {actionLoading === ngo._id + '_reject' ? '...' : 'Reject'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem' }}>Recent Feedback</div>
              <span style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--gray-400)', letterSpacing:'0.05em' }}>{feedback.length} TOTAL</span>
            </div>
            {loading ? (
              <div style={{ textAlign:'center', padding:24 }}><span className="spinner" /></div>
            ) : feedback.length === 0 ? (
              <div style={{ textAlign:'center', padding:'28px 0', color:'var(--gray-400)' }}>
                <div style={{ fontSize:'2rem', marginBottom:8 }}>💬</div>
                <p style={{ fontSize:'0.85rem' }}>No feedback submitted yet.</p>
              </div>
            ) : feedback.slice(0,6).map((f, i) => {
              const stars = f.rating || 5;
              const timeAgo = (() => {
                const diff = Date.now() - new Date(f.createdAt).getTime();
                const h = Math.floor(diff/3600000);
                if (h < 24) return `${h}H AGO`;
                return `${Math.floor(h/24)}D AGO`;
              })();
              return (
                <div key={f._id||i} style={{ paddingBottom:12, marginBottom:12, borderBottom:i < Math.min(feedback.length,6)-1 ? '1px solid var(--gray-100)' : 'none' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    <div>
                      <span style={{ fontWeight:700, fontSize:'0.85rem', color:'var(--navy)' }}>{f.name}</span>
                      <span style={{ fontSize:'0.7rem', color:'var(--gray-400)', marginLeft:6 }}>• {timeAgo}</span>
                      {f.role && <span style={{ fontSize:'0.66rem', color:'var(--gray-400)', marginLeft:4, textTransform:'uppercase' }}>· {f.role}</span>}
                    </div>
                    <div style={{ display:'flex', gap:1 }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ fontSize:'0.75rem', color:s<=stars?'#F59E0B':'var(--gray-200)' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize:'0.78rem', color:'var(--gray-600)', lineHeight:1.6 }}>{f.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
