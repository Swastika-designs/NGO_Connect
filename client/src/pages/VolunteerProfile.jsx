import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';

const LINKS = [
  { to:'/dashboard', label:'Dashboard', icon:'dashboard' },
  { to:'/ngos', label:'Browse NGOs', icon:'ngos' },
  { to:'/dashboard/profile', label:'Profile', icon:'profile' },
  { divider:true },
  { to:'#', label:'Settings', icon:'settings' },
];

const ALL_SKILLS = ['Teaching', 'Design', 'Medical', 'Technical', 'Admin', 'Physical Labor', 'Communication'];
const ALL_AVAILABILITY = ['Weekdays', 'Weekends', 'Evenings'];

export default function VolunteerProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    skills: user?.skills || [],
    availability: user?.availability || [],
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleSkill = (s) => setForm(f => ({
    ...f,
    skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s]
  }));

  const toggleAvailability = (a) => setForm(f => ({
    ...f,
    availability: f.availability.includes(a) ? f.availability.filter(x => x !== a) : [...f.availability, a]
  }));

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

  return (
    <SidebarLayout links={LINKS}>
      <div className="page-enter" style={{ maxWidth:700 }}>
        <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', marginBottom:4 }}>Your Volunteer Profile</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:24 }}>Keep your skills and availability up to date to find the best opportunities.</p>

        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 28px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24, paddingBottom:20, borderBottom:'1px solid var(--gray-100)' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background: form.avatar ? undefined : 'var(--green)', backgroundImage: form.avatar ? `url(${form.avatar})` : undefined, backgroundSize:'cover', backgroundPosition:'center', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'1.5rem', flexShrink:0 }}>
              {!form.avatar && user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'1rem' }}>{user?.name}</div>
              <div style={{ fontSize:'0.82rem', color:'var(--gray-500)' }}>{user?.email}</div>
              <span className="badge badge-yellow" style={{ marginTop:4, fontSize:'0.72rem' }}>Volunteer</span>
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
                <label className="form-label">City</label>
                <input className="form-input" placeholder="Bengaluru" value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Avatar URL</label>
              <input className="form-input" placeholder="https://..." value={form.avatar} onChange={e => set('avatar', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows={3} placeholder="Tell NGOs about your passion for volunteering..." value={form.bio} onChange={e => set('bio', e.target.value)} style={{ resize:'vertical' }} />
            </div>

            {/* Skills multi-select chips */}
            <div className="form-group">
              <label className="form-label">Skills</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {ALL_SKILLS.map(s => (
                  <button key={s} type="button" onClick={() => toggleSkill(s)} style={{
                    padding:'7px 14px', borderRadius:100, border:'1.5px solid', cursor:'pointer', fontWeight:600, fontSize:'0.82rem', transition:'all 0.15s',
                    borderColor: form.skills.includes(s) ? 'var(--green)' : 'var(--gray-200)',
                    background: form.skills.includes(s) ? 'var(--green-pale)' : 'white',
                    color: form.skills.includes(s) ? 'var(--green)' : 'var(--gray-600)',
                  }}>
                    {form.skills.includes(s) ? '✓ ' : ''}{s}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability checkboxes */}
            <div className="form-group">
              <label className="form-label">Availability</label>
              <div style={{ display:'flex', gap:14 }}>
                {ALL_AVAILABILITY.map(a => (
                  <label key={a} style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer', fontSize:'0.875rem', fontWeight:500, color:'var(--gray-700)' }}>
                    <input type="checkbox" checked={form.availability.includes(a)} onChange={() => toggleAvailability(a)} style={{ accentColor:'var(--green)', width:15, height:15 }} />
                    {a}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
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
