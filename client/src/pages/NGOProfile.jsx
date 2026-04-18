import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ngoAPI } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';

const LINKS = [
  { to:'/dashboard', label:'Dashboard', icon:'dashboard' },
  { to:'/dashboard/profile', label:'My NGO Profile', icon:'profile' },
  { to:'/dashboard/post-event', label:'Post Event', icon:'events' },
  { divider:true },
  { to:'#', label:'Settings', icon:'settings' },
];

const CATEGORIES = ['Education','Healthcare','Environment','Animal Welfare','Disaster Relief','Women Empowerment','Child Welfare','Food & Hunger','Poverty Alleviation','Human Rights','Arts & Culture','Other'];

export default function NGOProfile() {
  const { user } = useAuth();
  const toast = useToast();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name:'', description:'', mission:'', category:'', logo:'', coverImage:'',
    city:'', state:'', country:'India',
    email:'', phone:'', website:'', tags:'',
  });

  useEffect(() => {
    ngoAPI.getMine()
      .then(r => {
        const n = r.data.ngo;
        setNgo(n);
        if (n) {
          setForm({
            name: n.name || '',
            description: n.description || '',
            mission: n.mission || '',
            category: n.category || '',
            logo: n.logo || '',
            coverImage: n.coverImage || '',
            city: n.location?.city || '',
            state: n.location?.state || '',
            country: n.location?.country || 'India',
            email: n.contact?.email || '',
            phone: n.contact?.phone || '',
            website: n.contact?.website || '',
            tags: (n.tags || []).join(', '),
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!ngo) return;
    setSaving(true);
    try {
      const res = await ngoAPI.update(ngo._id, {
        name: form.name, description: form.description, mission: form.mission,
        category: form.category, logo: form.logo, coverImage: form.coverImage,
        location: { city: form.city, state: form.state, country: form.country },
        contact: { email: form.email, phone: form.phone, website: form.website },
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      setNgo(res.data.ngo);
      toast.success('NGO profile updated ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <SidebarLayout links={LINKS}>
      <div style={{ display:'flex', justifyContent:'center', padding:60 }}><span className="spinner" /></div>
    </SidebarLayout>
  );

  if (!ngo) return (
    <SidebarLayout links={LINKS}>
      <div className="page-enter" style={{ maxWidth:600 }}>
        <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', marginBottom:8 }}>NGO Profile</h1>
        <div style={{ background:'var(--green-pale)', border:'1px solid var(--green-light)', borderRadius:12, padding:'28px 32px', textAlign:'center' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:12 }}>🏛️</div>
          <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'1rem', marginBottom:6 }}>You haven't registered an NGO yet</div>
          <p style={{ color:'var(--gray-600)', fontSize:'0.875rem', marginBottom:20 }}>Create your NGO to start connecting with donors and volunteers.</p>
          <Link to="/dashboard/create-ngo" className="btn btn-primary">Register Your NGO →</Link>
        </div>
      </div>
    </SidebarLayout>
  );

  return (
    <SidebarLayout links={LINKS}>
      <div className="page-enter" style={{ maxWidth:760 }}>
        <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', marginBottom:4 }}>NGO Profile</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:20 }}>Edit your NGO's public-facing information.</p>

        {!ngo.isApproved && (
          <div style={{ background:'#FEF3C7', border:'1px solid #FCD34D', borderRadius:10, padding:'12px 16px', marginBottom:18, fontSize:'0.85rem', color:'#92400E' }}>
            ⏳ <strong>Under review</strong> — Your NGO will appear publicly after admin approval.
          </div>
        )}

        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 28px' }}>
          <form onSubmit={handleSave}>
            <h3 style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.95rem', marginBottom:14 }}>Basic Info</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label className="form-label">NGO Name <span style={{ color:'var(--red)' }}>*</span></label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category <span style={{ color:'var(--red)' }}>*</span></label>
                <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-input" placeholder="education, rural, children" value={form.tags} onChange={e => set('tags', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label className="form-label">Description <span style={{ color:'var(--red)' }}>*</span></label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} style={{ resize:'vertical' }} required />
              </div>
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label className="form-label">Mission Statement</label>
                <textarea className="form-input" rows={2} value={form.mission} onChange={e => set('mission', e.target.value)} style={{ resize:'vertical' }} />
              </div>
            </div>

            <h3 style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.95rem', margin:'20px 0 14px', paddingTop:16, borderTop:'1px solid var(--gray-100)' }}>Media</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="form-group">
                <label className="form-label">Logo URL</label>
                <input className="form-input" placeholder="https://..." value={form.logo} onChange={e => set('logo', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Cover Image URL</label>
                <input className="form-input" placeholder="https://..." value={form.coverImage} onChange={e => set('coverImage', e.target.value)} />
              </div>
            </div>

            <h3 style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.95rem', margin:'20px 0 14px', paddingTop:16, borderTop:'1px solid var(--gray-100)' }}>Location</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-input" value={form.state} onChange={e => set('state', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input className="form-input" value={form.country} onChange={e => set('country', e.target.value)} />
              </div>
            </div>

            <h3 style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.95rem', margin:'20px 0 14px', paddingTop:16, borderTop:'1px solid var(--gray-100)' }}>Contact</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label className="form-label">Website</label>
                <input className="form-input" placeholder="https://..." value={form.website} onChange={e => set('website', e.target.value)} />
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:12, paddingTop:16, borderTop:'1px solid var(--gray-100)' }}>
              <Link to="/dashboard" className="btn btn-outline">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white', width:14, height:14 }} /> Saving...</> : 'Save NGO Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
}
