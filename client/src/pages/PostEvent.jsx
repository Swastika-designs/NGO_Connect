import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { eventAPI } from '../services/api';

const CATEGORIES = ['Environment','Education','Healthcare','Disaster Relief','Women Empowerment','Food & Hunger','Other'];
const SKILLS = ['Teaching','Design','Admin','Physical Labor','Social Care','Medical','Technical','Communication','Fundraising'];

export default function PostEvent() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title:'', category:'Environment', audience:'', description:'',
    date:'', time:'', locationType:'Physical', address:'',
    volunteersNeeded:'', skills:[],
  });
  const [publishing, setPublishing] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleSkill = (s) => setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s] }));

  const submit = async (status) => {
    if (!form.title || !form.description) {
      toast.error('Please fill in the title and description');
      return;
    }
    status === 'published' ? setPublishing(true) : setSavingDraft(true);
    try {
      await eventAPI.create({
        title: form.title,
        description: form.description,
        category: form.category,
        targetAudience: form.audience,
        date: form.date || undefined,
        time: form.time,
        locationType: form.locationType,
        address: form.address,
        volunteersNeeded: form.volunteersNeeded ? parseInt(form.volunteersNeeded) : 0,
        requiredSkills: form.skills,
        status,
      });
      toast.success(status === 'published' ? '🎉 Event published successfully!' : '📄 Event saved as draft.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event. Make sure your NGO is registered and approved.');
    } finally {
      setPublishing(false);
      setSavingDraft(false);
    }
  };

  return (
    <div style={{ background:'var(--gray-50)', minHeight:'100vh', paddingTop:0 }}>
      {/* Top nav */}
      <div style={{ background:'white', borderBottom:'1px solid var(--gray-200)', padding:'0 32px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:28, height:28, borderRadius:6, background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <span style={{ fontWeight:800, fontSize:'0.95rem', color:'var(--navy)' }}>NGO Dashboard</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.82rem' }}>{user?.name?.charAt(0)}</div>
          <span style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--navy)' }}>{user?.name?.split(' ')[0]}</span>
        </div>
      </div>

      <div style={{ maxWidth:680, margin:'32px auto', padding:'0 24px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize:'0.8rem', color:'var(--gray-400)', marginBottom:14 }}>
          <Link to="/dashboard" style={{ color:'var(--green)' }}>Dashboard</Link>
          <span style={{ margin:'0 6px' }}>›</span>
          <span style={{ color:'var(--navy)' }}>Post an Event</span>
        </div>
        <h1 style={{ fontWeight:800, fontSize:'1.6rem', color:'var(--navy)', marginBottom:4 }}>Post a New Event</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:28 }}>Fill in the details below to recruit volunteers for your cause.</p>

        {/* Basic Information */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 28px', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:20 }}>
            <span style={{ color:'var(--green)', fontSize:'1rem' }}>ℹ</span>
            <h2 style={{ fontWeight:700, fontSize:'1rem', color:'var(--navy)' }}>Basic Information</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Event Title <span style={{ color:'var(--red)' }}>*</span></label>
            <input className="form-input" placeholder="e.g. Annual Beach Cleanup 2024" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <input className="form-input" placeholder="e.g. Students, Families" value={form.audience} onChange={e => set('audience', e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Description <span style={{ color:'var(--red)' }}>*</span></label>
            <textarea className="form-input" rows={5} style={{ resize:'vertical' }}
              placeholder="Describe the event goals, activities, and why volunteers should join..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
        </div>

        {/* Logistics */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 28px', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:20 }}>
            <span style={{ color:'var(--green)', fontSize:'1rem' }}>⏱</span>
            <h2 style={{ fontWeight:700, fontSize:'1rem', color:'var(--navy)' }}>Logistics</h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', fontSize:'0.85rem' }}>📅</span>
                <input type="date" className="form-input" style={{ paddingLeft:34 }} value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', fontSize:'0.85rem' }}>🕐</span>
                <input type="time" className="form-input" style={{ paddingLeft:34 }} value={form.time} onChange={e => set('time', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location Type</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {['Physical','Virtual'].map(type => (
                <button key={type} type="button" onClick={() => set('locationType', type)}
                  style={{
                    padding:'11px 16px', borderRadius:7, border:'1.5px solid', cursor:'pointer', fontWeight:600, fontSize:'0.875rem',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'all 0.15s',
                    borderColor: form.locationType === type ? 'var(--navy)' : 'var(--gray-200)',
                    background: form.locationType === type ? 'var(--gray-50)' : 'white',
                    color: form.locationType === type ? 'var(--navy)' : 'var(--gray-500)',
                  }}>
                  <span>{type === 'Physical' ? '📍' : '💻'}</span> {type}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Address or Meeting Link</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', fontSize:'0.85rem' }}>🔗</span>
              <input className="form-input" style={{ paddingLeft:34 }}
                placeholder="Street address or URL"
                value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Volunteer Requirements */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 28px', marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:20 }}>
            <span style={{ color:'var(--green)', fontSize:'1rem' }}>👥</span>
            <h2 style={{ fontWeight:700, fontSize:'1rem', color:'var(--navy)' }}>Volunteer Requirements</h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Number of Volunteers Needed</label>
              <input type="number" className="form-input" placeholder="e.g. 10" value={form.volunteersNeeded} onChange={e => set('volunteersNeeded', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Required Skills (Multi-select)</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, padding:'8px 10px', border:'1.5px solid var(--gray-200)', borderRadius:6, background:'var(--gray-50)', minHeight:42 }}>
                {SKILLS.map(s => (
                  <span key={s} onClick={() => toggleSkill(s)} style={{
                    padding:'3px 10px', borderRadius:100, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                    background: form.skills.includes(s) ? 'var(--green)' : 'var(--gray-200)',
                    color: form.skills.includes(s) ? 'white' : 'var(--gray-600)',
                  }}>{s}</span>
                ))}
              </div>
              <p style={{ fontSize:'0.72rem', color:'var(--gray-400)', marginTop:4 }}>Click to select multiple skills</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display:'flex', justifyContent:'center', gap:12 }}>
          <button className="btn btn-outline" onClick={() => submit('draft')} disabled={savingDraft || publishing} style={{ padding:'11px 28px' }}>
            {savingDraft ? <><span className="spinner" style={{ borderTopColor:'var(--navy)' }} /> Saving...</> : '📄 Save as Draft'}
          </button>
          <button className="btn btn-primary" onClick={() => submit('published')} disabled={publishing || savingDraft} style={{ padding:'11px 28px' }}>
            {publishing ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} /> Publishing...</> : '⚡ Publish Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
