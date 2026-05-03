import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI, donationAPI } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';

const LINKS = [
  { to:'/dashboard', label:'Dashboard', icon:'dashboard' },
  { to:'/ngos', label:'Browse NGOs', icon:'ngos' },
  { to:'/dashboard/profile', label:'Profile', icon:'profile' },
  { divider:true },
  { to:'#', label:'Settings', icon:'settings' },
];

export default function DonorProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });
  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState(null);

  React.useEffect(() => {
    donationAPI.getMy().then(r => setDonations(r.data.donations || [])).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated successfully ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  const total = donations?.reduce((s, d) => s + (d.amount || 0), 0) || 0;
  const ngoCount = donations ? new Set(donations.map(d => d.ngo?._id)).size : 0;
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month:'long', year:'numeric' }) : '—';

  return (
    <SidebarLayout links={LINKS}>
      <div className="page-enter" style={{ maxWidth:700 }}>
        <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', marginBottom:4 }}>Your Profile</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:24 }}>Manage your personal info and view your giving summary.</p>

        {/* Summary cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
          {[
            { label:'Total Donated', value: `₹${total.toLocaleString('en-IN')}`, icon:'💝' },
            { label:'NGOs Supported', value: ngoCount, icon:'🏛️' },
            { label:'Member Since', value: memberSince, icon:'📅' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'1.4rem', marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--navy)' }}>{s.value}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--gray-500)', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 28px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24, paddingBottom:20, borderBottom:'1px solid var(--gray-100)' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background: form.avatar ? undefined : 'var(--green)', backgroundImage: form.avatar ? `url(${form.avatar})` : undefined, backgroundSize:'cover', backgroundPosition:'center', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'1.5rem', flexShrink:0 }}>
              {!form.avatar && user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'1rem' }}>{user?.name}</div>
              <div style={{ fontSize:'0.82rem', color:'var(--gray-500)' }}>{user?.email}</div>
              <span className="badge badge-green" style={{ marginTop:4, fontSize:'0.72rem' }}>Donor</span>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="form-group">
                <label className="form-label">Full Name <span style={{ color:'var(--red)' }}>*</span></label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email (read-only)</label>
                <input className="form-input" value={user?.email} readOnly style={{ background:'var(--gray-100)', color:'var(--gray-500)', cursor:'not-allowed' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">City / State</label>
                <input className="form-input" placeholder="Mumbai, Maharashtra" value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Avatar URL</label>
              <input className="form-input" placeholder="https://..." value={form.avatar} onChange={e => set('avatar', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows={3} placeholder="Tell us a bit about yourself..." value={form.bio} onChange={e => set('bio', e.target.value)} style={{ resize:'vertical' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:4 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white', width:14, height:14 }} /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
}
