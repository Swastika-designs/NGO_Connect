import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { donationAPI, ngoAPI } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';
import DonateModal from '../components/DonateModal';

const LINKS = [
  { to:'/dashboard', label:'Dashboard', icon:'dashboard' },
  { to:'/ngos', label:'Browse NGOs', icon:'ngos' },
  { to:'/dashboard/profile', label:'Profile', icon:'profile' },
  { divider:true },
  { to:'#', label:'Settings', icon:'settings' },
  { to:'#', label:'Help Center', icon:'help' },
];

export default function DonorDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [donations, setDonations] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(null);

  const fetchDonations = () => donationAPI.getMy().then(r => setDonations(r.data.donations || []));

  useEffect(() => {
    Promise.all([donationAPI.getMy(), ngoAPI.getAll({ featured:true, limit:3 })])
      .then(([d, n]) => {
        setDonations(d.data.donations || []);
        setNgos(n.data.ngos || []);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const total = donations.reduce((s, d) => s + (d.amount || 0), 0);
  const ngoCount = new Set(donations.map(d => d.ngo?._id)).size;
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month:'short', year:'numeric' }) : '—';

  const topRight = (
    <>
      <span style={{ fontSize:'0.9rem', cursor:'pointer' }}>🔔</span>
      <div style={{ display:'flex', alignItems:'center', gap:9, padding:'4px 12px', border:'1px solid var(--gray-200)', borderRadius:20 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.8rem' }}>{user?.name?.charAt(0)}</div>
        <div>
          <div style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--navy)', lineHeight:1 }}>{user?.name}</div>
          <div style={{ fontSize:'0.68rem', color:'var(--gray-400)' }}>Donor · Since {memberSince}</div>
        </div>
      </div>
    </>
  );

  return (
    <SidebarLayout links={LINKS} topRight={topRight}>
      <div className="page-enter">
        <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', marginBottom:3 }}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:24 }}>
          {donations.length > 0 ? 'Your contributions have made a real difference.' : 'Start your giving journey today.'}
        </p>

        {/* Stat cards — real data only */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
          {[
            { label:'Total Donated', value: loading ? '—' : `₹${total.toLocaleString('en-IN', { minimumFractionDigits:2 })}`, sub: donations.length > 0 ? `${donations.length} donation${donations.length > 1 ? 's' : ''}` : 'No donations yet', icon:'💳' },
            { label:'NGOs Supported', value: loading ? '—' : ngoCount, sub: ngoCount > 0 ? 'unique organizations' : 'None yet', icon:'🏛️' },
            { label:'Member Since', value: loading ? '—' : memberSince, sub: 'Account created', icon:'📅' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--gray-400)', letterSpacing:'0.06em', textTransform:'uppercase' }}>{s.label}</div>
                <div style={{ width:34, height:34, background:'var(--gray-100)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>{s.icon}</div>
              </div>
              <div className="stat-value">{s.value}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--gray-500)', fontWeight:500 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* First donation CTA if no donations yet */}
        {!loading && donations.length === 0 && (
          <div style={{ background:'linear-gradient(135deg, #10B98112, #10B98122)', border:'1px solid var(--green-light)', borderRadius:12, padding:'28px 32px', marginBottom:22, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'1rem', marginBottom:6 }}>💝 Make your first donation</div>
              <div style={{ fontSize:'0.85rem', color:'var(--gray-600)', maxWidth:420, lineHeight:1.6 }}>Explore verified NGOs and support causes you care about. Every rupee makes a real difference to communities across India.</div>
            </div>
            <Link to="/ngos" className="btn btn-primary" style={{ flexShrink:0 }}>Browse NGOs →</Link>
          </div>
        )}

        {/* Featured NGOs */}
        {ngos.length > 0 && (
          <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 22px', marginBottom:22 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem' }}>Featured NGOs to Support</div>
              <Link to="/ngos" style={{ fontSize:'0.78rem', color:'var(--green)', fontWeight:600, textDecoration:'none' }}>View All →</Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {(loading ? Array(3).fill(null) : ngos).map((ngo, i) => ngo ? (
                <div key={ngo._id} style={{ border:'1px solid var(--gray-200)', borderRadius:9, overflow:'hidden' }}>
                  <div style={{ height:80, background:'linear-gradient(135deg,#10B98122,#10B98144)', padding:8, display:'flex', alignItems:'flex-start' }}>
                    <span style={{ fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase', background:'var(--green)', color:'white', padding:'2px 7px', borderRadius:100 }}>{ngo.category?.toUpperCase()}</span>
                  </div>
                  <div style={{ padding:'11px 13px' }}>
                    <div style={{ fontWeight:700, fontSize:'0.83rem', color:'var(--navy)', marginBottom:4 }}>{ngo.name}</div>
                    <p style={{ fontSize:'0.73rem', color:'var(--gray-500)', lineHeight:1.55, marginBottom:9, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{ngo.description}</p>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:'0.68rem', color:'var(--gray-400)' }}>{ngo.donorCount || 0} donors</span>
                      <button className="btn btn-primary btn-sm" onClick={() => setDonating(ngo)} style={{ fontSize:'0.7rem', padding:'4px 10px' }}>Support</button>
                    </div>
                  </div>
                </div>
              ) : <div key={i} style={{ height:160, background:'var(--gray-100)', borderRadius:9 }} />)}
            </div>
          </div>
        )}

        {/* Donation history */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 22px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem' }}>Donation History</div>
          </div>
          <table className="table">
            <thead><tr><th>NGO Name</th><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign:'center', padding:28 }}><span className="spinner" /></td></tr>
              ) : donations.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign:'center', padding:36, color:'var(--gray-400)' }}>
                  <div style={{ fontSize:'1.8rem', marginBottom:8 }}>💝</div>
                  No donations yet. <Link to="/ngos" style={{ color:'var(--green)' }}>Explore NGOs →</Link>
                </td></tr>
              ) : donations.slice(0, 10).map(d => (
                <tr key={d._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:26, height:26, borderRadius:6, background:'var(--green-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.72rem', color:'var(--green)' }}>{d.ngo?.name?.charAt(0)}</div>
                      <span style={{ fontWeight:600, fontSize:'0.85rem' }}>{d.ngo?.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize:'0.82rem', color:'var(--gray-500)' }}>{new Date(d.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
                  <td style={{ fontWeight:700 }}>₹{d.amount?.toLocaleString('en-IN', { minimumFractionDigits:2 })}</td>
                  <td style={{ fontSize:'0.82rem', color:'var(--gray-500)', textTransform:'uppercase' }}>{d.paymentMethod}</td>
                  <td><span className={`badge ${d.status === 'completed' ? 'badge-green' : 'badge-yellow'}`}>{d.status === 'completed' ? 'PROCESSED' : d.status?.toUpperCase()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {donating && (
        <DonateModal
          ngo={donating}
          onClose={() => setDonating(null)}
          onSuccess={() => fetchDonations().then(r => setDonations(r?.data?.donations || donations))}
        />
      )}
    </SidebarLayout>
  );
}
