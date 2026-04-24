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
  { to:'/dashboard/messages', label:'Messages', icon:'feedback' },
  { divider:true },
  { to:'#', label:'Settings', icon:'settings' },
];

const CATEGORIES = ['Education','Healthcare','Environment','Animal Welfare','Disaster Relief','Women Empowerment','Child Welfare','Food & Hunger','Poverty Alleviation','Human Rights','Arts & Culture','Other'];
const DOC_TYPES = ['registration','id','certificate','tax','other'];

const TIER_INFO = {
  0: { label:'Unverified', icon:'⚪', color:'var(--gray-500)', bg:'var(--gray-100)', border:'var(--gray-200)' },
  1: { label:'Bronze', icon:'🥉', color:'#92400E', bg:'#FEF2E8', border:'#FDBA74' },
  2: { label:'Silver', icon:'🥈', color:'#475569', bg:'#F1F5F9', border:'#CBD5E1' },
  3: { label:'Gold', icon:'🏆', color:'#92400E', bg:'#FEF3C7', border:'#FCD34D' },
};

export default function NGOProfile() {
  const { user } = useAuth();
  const toast = useToast();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [form, setForm] = useState({
    name:'', description:'', mission:'', category:'', logo:'', coverImage:'',
    city:'', state:'', country:'India', address:'',
    email:'', phone:'', website:'',
    facebook:'', twitter:'', instagram:'', linkedin:'',
    tags:'', foundedYear:'', registrationNumber:'',
  });
  // Document upload
  const [docForm, setDocForm] = useState({ name:'', url:'', type:'registration' });
  const [addingDoc, setAddingDoc] = useState(false);
  // NGO Needs
  const [needForm, setNeedForm] = useState({ category:'clothes', description:'', urgency:'medium' });
  const [addingNeed, setAddingNeed] = useState(false);

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
            address: n.location?.address || '',
            email: n.contact?.email || '',
            phone: n.contact?.phone || '',
            website: n.contact?.website || '',
            facebook: n.socialMedia?.facebook || '',
            twitter: n.socialMedia?.twitter || '',
            instagram: n.socialMedia?.instagram || '',
            linkedin: n.socialMedia?.linkedin || '',
            tags: (n.tags || []).join(', '),
            foundedYear: n.foundedYear || '',
            registrationNumber: n.registrationNumber || '',
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
        foundedYear: form.foundedYear ? parseInt(form.foundedYear) : undefined,
        registrationNumber: form.registrationNumber,
        location: { city: form.city, state: form.state, country: form.country, address: form.address },
        contact: { email: form.email, phone: form.phone, website: form.website },
        socialMedia: { facebook: form.facebook, twitter: form.twitter, instagram: form.instagram, linkedin: form.linkedin },
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      setNgo(res.data.ngo);
      toast.success('NGO profile updated ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const BLOCKED_EXTENSIONS = ['.exe','.bat','.cmd','.sh','.msi','.vbs','.ps1','.jar','.dmg','.app','.com','.scr','.pif','.reg','.dll','.sys'];
  const handleAddDoc = async (e) => {
    e.preventDefault();
    if (!docForm.name || !docForm.url) return toast.error('Name and URL required');
    const urlLower = docForm.url.toLowerCase();
    const blockedExt = BLOCKED_EXTENSIONS.find(ext => urlLower.includes(ext));
    if (blockedExt) return toast.error(`File type "${blockedExt}" is not allowed. Please upload PDFs, images, or documents only.`);
    setAddingDoc(true);
    try {
      const res = await ngoAPI.addDocument(docForm);
      setNgo(prev => ({ ...prev, documents: res.data.documents }));
      setDocForm({ name:'', url:'', type:'registration' });
      toast.success('Document added ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add document');
    } finally { setAddingDoc(false); }
  };

  const handleAddNeed = async (e) => {
    e.preventDefault();
    if (!needForm.description.trim()) return toast.error('Please describe what you need');
    if (!ngo) return;
    setAddingNeed(true);
    try {
      const res = await ngoAPI.addNeed(ngo._id, needForm);
      setNgo(prev => ({ ...prev, ngoNeeds: res.data.ngoNeeds }));
      setNeedForm({ category:'clothes', description:'', urgency:'medium' });
      toast.success('Need added ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add need');
    } finally { setAddingNeed(false); }
  };

  const handleDeleteNeed = async (needId) => {
    if (!ngo) return;
    try {
      const res = await ngoAPI.deleteNeed(ngo._id, needId);
      setNgo(prev => ({ ...prev, ngoNeeds: res.data.ngoNeeds }));
      toast.success('Need removed');
    } catch (err) {
      toast.error('Failed to remove need');
    }
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
          <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'1rem', marginBottom:6 }}>No NGO registered yet</div>
          <p style={{ color:'var(--gray-600)', fontSize:'0.875rem', marginBottom:20 }}>Create your NGO to connect with donors and volunteers.</p>
          <Link to="/dashboard/create-ngo" className="btn btn-primary">Register Your NGO →</Link>
        </div>
      </div>
    </SidebarLayout>
  );

  const tier = TIER_INFO[ngo.verificationTier || 0];
  const TabBtn = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding:'8px 18px', borderRadius:7, border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.85rem',
      background: activeTab === id ? 'var(--navy)' : 'transparent',
      color: activeTab === id ? 'white' : 'var(--gray-500)',
    }}>{label}</button>
  );

  return (
    <SidebarLayout links={LINKS}>
      <div className="page-enter" style={{ maxWidth:800 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', marginBottom:4 }}>NGO Profile</h1>
            <p style={{ color:'var(--gray-500)', fontSize:'0.875rem' }}>Manage your NGO's public profile and verification documents.</p>
          </div>
          {/* Tier badge */}
          <div style={{ textAlign:'center', background:tier.bg, border:`1px solid ${tier.border}`, borderRadius:10, padding:'10px 16px' }}>
            <div style={{ fontSize:'1.5rem' }}>{tier.icon}</div>
            <div style={{ fontSize:'0.72rem', fontWeight:700, color:tier.color, marginTop:4 }}>{tier.label} Tier</div>
          </div>
        </div>

        {!ngo.isApproved && (
          <div style={{ background:'#FEF3C7', border:'1px solid #FCD34D', borderRadius:10, padding:'12px 16px', marginBottom:18, fontSize:'0.85rem', color:'#92400E' }}>
            ⏳ <strong>Under review</strong> — Your NGO will be listed publicly after admin approval. Upload verification documents below to speed up the process.
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, background:'var(--gray-100)', borderRadius:9, padding:4, marginBottom:20, width:'fit-content' }}>
          <TabBtn id="info" label="Basic Info" />
          <TabBtn id="contact" label="Contact & Social" />
          <TabBtn id="documents" label={`Documents (${(ngo.documents||[]).length})`} />
          <TabBtn id="needs" label={`Our Needs (${(ngo.ngoNeeds||[]).filter(n=>n.isActive).length})`} />
        </div>

        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 28px' }}>
          {/* Tab: Basic Info */}
          {activeTab === 'info' && (
            <form onSubmit={handleSave}>
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
                  <label className="form-label">Founded Year</label>
                  <input className="form-input" type="number" placeholder="2015" min="1900" max={new Date().getFullYear()} value={form.foundedYear} onChange={e => set('foundedYear', e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Registration Number</label>
                  <input className="form-input" placeholder="e.g. KA/NGO/2012/001" value={form.registrationNumber} onChange={e => set('registrationNumber', e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Description <span style={{ color:'var(--red)' }}>*</span></label>
                  <textarea className="form-input" rows={4} value={form.description} onChange={e => set('description', e.target.value)} required style={{ resize:'vertical' }} />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Mission Statement</label>
                  <textarea className="form-input" rows={2} value={form.mission} onChange={e => set('mission', e.target.value)} style={{ resize:'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Logo URL</label>
                  <input className="form-input" placeholder="https://..." value={form.logo} onChange={e => set('logo', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Image URL</label>
                  <input className="form-input" placeholder="https://..." value={form.coverImage} onChange={e => set('coverImage', e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Tags (comma-separated)</label>
                  <input className="form-input" placeholder="education, rural, children" value={form.tags} onChange={e => set('tags', e.target.value)} />
                </div>
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
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} />
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:12, paddingTop:16, borderTop:'1px solid var(--gray-100)' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white', width:14, height:14 }} /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Tab: Contact & Social */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSave}>
              <h3 style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.95rem', marginBottom:14 }}>Contact Information</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
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
              <h3 style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.95rem', marginBottom:14, paddingTop:16, borderTop:'1px solid var(--gray-100)' }}>Social Media</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {[['facebook','📘 Facebook','facebook.com/...'],['twitter','🐦 Twitter','twitter.com/...'],['instagram','📸 Instagram','instagram.com/...'],['linkedin','💼 LinkedIn','linkedin.com/company/...']].map(([k, label, ph]) => (
                  <div className="form-group" key={k}>
                    <label className="form-label">{label}</label>
                    <input className="form-input" placeholder={ph} value={form[k]} onChange={e => set(k, e.target.value)} />
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:12, paddingTop:16, borderTop:'1px solid var(--gray-100)' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white', width:14, height:14 }} /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Tab: Documents */}
          {activeTab === 'documents' && (
            <div>
              <div style={{ background:'var(--green-pale)', border:'1px solid var(--green-light)', borderRadius:9, padding:'12px 16px', marginBottom:20, fontSize:'0.83rem', color:'var(--gray-700)', lineHeight:1.6 }}>
                📋 <strong>Upload verification documents</strong> to help the admin verify your NGO and assign a higher tier. Accepted: Registration Certificate, Tax Exemption, ID proof, etc. Paste publicly accessible URLs (Google Drive, Dropbox, etc.).
              </div>

              {/* Add document form */}
              <form onSubmit={handleAddDoc} style={{ background:'var(--gray-50)', borderRadius:9, padding:'16px 18px', marginBottom:20, border:'1px solid var(--gray-200)' }}>
                <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.875rem', marginBottom:12 }}>+ Add Document</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Document Name <span style={{ color:'var(--red)' }}>*</span></label>
                    <input className="form-input" placeholder="e.g. Registration Certificate" value={docForm.name} onChange={e => setDocForm(f => ({ ...f, name:e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Document Type</label>
                    <select className="form-input" value={docForm.type} onChange={e => setDocForm(f => ({ ...f, type:e.target.value }))}>
                      {DOC_TYPES.map(t => <option key={t} value={t} style={{ textTransform:'capitalize' }}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom:12 }}>
                  <label className="form-label">Document URL <span style={{ color:'var(--red)' }}>*</span></label>
                  <input className="form-input" placeholder="https://drive.google.com/..." value={docForm.url} onChange={e => setDocForm(f => ({ ...f, url:e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary btn-sm" disabled={addingDoc}>
                  {addingDoc ? '...' : '+ Add Document'}
                </button>
              </form>

              {/* Document list */}
              {(ngo.documents||[]).length === 0 ? (
                <div style={{ textAlign:'center', padding:'32px 0', color:'var(--gray-400)' }}>
                  <div style={{ fontSize:'2rem', marginBottom:8 }}>📄</div>
                  <p>No documents uploaded yet. Add your first document above.</p>
                </div>
              ) : (ngo.documents||[]).map(doc => (
                <div key={doc._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 0', borderBottom:'1px solid var(--gray-100)' }}>
                  <div style={{ width:38, height:38, borderRadius:8, background:'var(--gray-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>📄</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--navy)' }}>{doc.name}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--gray-400)', textTransform:'capitalize' }}>{doc.type} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</div>
                    <a href={doc.url} target="_blank" rel="noreferrer" style={{ fontSize:'0.75rem', color:'var(--blue)' }}>View Document ↗</a>
                  </div>
                  <span style={{
                    fontSize:'0.72rem', fontWeight:700, padding:'4px 10px', borderRadius:100,
                    background: doc.verified ? 'var(--green-pale)' : 'var(--gray-100)',
                    color: doc.verified ? 'var(--green)' : 'var(--gray-400)',
                    border: `1px solid ${doc.verified ? 'var(--green-light)' : 'var(--gray-200)'}`,
                  }}>
                    {doc.verified ? '✓ Verified' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Needs */}
          {activeTab === 'needs' && (
            <div>
              <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:9, padding:'12px 16px', marginBottom:20, fontSize:'0.83rem', color:'#1E40AF', lineHeight:1.6 }}>
                📋 <strong>List what your NGO needs</strong> — donors can see these needs and donate accordingly. Mark urgency so donors know what's most critical.
              </div>

              {/* Add need form */}
              <form onSubmit={handleAddNeed} style={{ background:'var(--gray-50)', borderRadius:9, padding:'16px 18px', marginBottom:20, border:'1px solid var(--gray-200)' }}>
                <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.875rem', marginBottom:12 }}>+ Add a Need</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Category</label>
                    <select className="form-input" value={needForm.category} onChange={e => setNeedForm(f => ({ ...f, category:e.target.value }))}>
                      {['clothes','food','electronics','books','furniture','toys','medical','money','volunteers','other'].map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Urgency</label>
                    <select className="form-input" value={needForm.urgency} onChange={e => setNeedForm(f => ({ ...f, urgency:e.target.value }))}>
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🔴 High / Urgent</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Description <span style={{ color:'var(--red)' }}>*</span></label>
                    <input className="form-input" placeholder="e.g. Winter jackets for children" value={needForm.description} onChange={e => setNeedForm(f => ({ ...f, description:e.target.value }))} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-sm" disabled={addingNeed}>
                  {addingNeed ? '...' : '+ Add Need'}
                </button>
              </form>

              {/* Needs list */}
              {(ngo.ngoNeeds||[]).length === 0 ? (
                <div style={{ textAlign:'center', padding:'32px 0', color:'var(--gray-400)' }}>
                  <div style={{ fontSize:'2rem', marginBottom:8 }}>📦</div>
                  <p>No needs listed yet. Add what your NGO needs so donors can help!</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {(ngo.ngoNeeds||[]).map((need, i) => (
                    <div key={need._id||i} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', border:'1px solid var(--gray-200)', borderRadius:9, background:'white' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                          <span style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--navy)', textTransform:'capitalize' }}>{need.category}</span>
                          <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'2px 8px', borderRadius:100,
                            background: need.urgency==='high'?'#FEE2E2':need.urgency==='medium'?'#FEF3C7':'#D1FAE5',
                            color: need.urgency==='high'?'#991B1B':need.urgency==='medium'?'#92400E':'#065F46',
                          }}>
                            {need.urgency==='high'?'🔴 Urgent':need.urgency==='medium'?'🟡 Medium':'🟢 Low'}
                          </span>
                          {!need.isActive && <span className="badge badge-gray" style={{ fontSize:'0.68rem' }}>Inactive</span>}
                        </div>
                        <div style={{ fontSize:'0.82rem', color:'var(--gray-600)' }}>{need.description}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteNeed(need._id)}
                        style={{ background:'none', border:'1px solid var(--gray-200)', borderRadius:6, padding:'5px 10px', cursor:'pointer', fontSize:'0.78rem', color:'var(--red)', fontWeight:600 }}
                      >Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
