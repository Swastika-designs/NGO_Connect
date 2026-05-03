import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { eventAPI, ngoAPI } from '../services/api';

const CATEGORIES = ['Environment','Education','Healthcare','Disaster Relief','Women Empowerment','Food & Hunger','Animal Welfare','Other'];
const SKILLS     = ['Teaching','Design','Admin','Physical Labor','Social Care','Medical','Technical','Communication','Fundraising'];
const DURATIONS  = ['1-2 hours','Half day (4 hrs)','Full day (8 hrs)','Weekend','Multi-day','Ongoing/Weekly'];

const TIER_INFO = {
  0:{ label:'Unverified', icon:'⚪', color:'var(--gray-500)', bg:'var(--gray-100)' },
  1:{ label:'Bronze',     icon:'🥉', color:'#92400E',         bg:'#FEF2E8' },
  2:{ label:'Silver',     icon:'🥈', color:'#475569',         bg:'#F1F5F9' },
  3:{ label:'Gold',       icon:'🏆', color:'#92400E',         bg:'#FEF3C7' },
};

export default function PostEvent() {
  const navigate = useNavigate();
  const toast    = useToast();
  const { user } = useAuth();
  const [myNgo, setMyNgo] = useState(null);
  const [ngoLoading, setNgoLoading] = useState(true);
  const [form, setForm] = useState({
    title:'', category:'Environment', audience:'', description:'',
    date:'', time:'', duration:'', locationType:'Physical', address:'',
    volunteersNeeded:'', skills:[],
  });
  const [errors, setErrors]     = useState({});
  const [publishing, setPublishing] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Load NGO so we can show tier badge
  useEffect(() => {
    ngoAPI.getMine()
      .then(r => setMyNgo(r.data.ngo || null))
      .catch(() => {})
      .finally(() => setNgoLoading(false));
  }, []);

  const set  = (k, v) => { setForm(f => ({ ...f, [k]:v })); setErrors(e => ({ ...e, [k]:'' })); };
  const toggleSkill = s => setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x=>x!==s) : [...f.skills,s] }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Event title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category)           e.category    = 'Category is required';
    if (!form.date)               e.date        = 'Date is required';
    if (!form.address.trim())     e.address     = 'Location / address is required';
    if (!form.volunteersNeeded || parseInt(form.volunteersNeeded) < 1)
                                  e.volunteersNeeded = 'At least 1 volunteer is required';
    return e;
  };

  const submit = async (status) => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      toast.error('Please fill in all required fields');
      return;
    }

    status === 'published' ? setPublishing(true) : setSavingDraft(true);
    try {
      await eventAPI.create({
        title:            form.title.trim(),
        description:      form.description.trim(),
        category:         form.category,
        targetAudience:   form.audience,
        date:             form.date,
        time:             form.time,
        duration:         form.duration,
        locationType:     form.locationType,
        address:          form.address.trim(),
        volunteersNeeded: parseInt(form.volunteersNeeded),
        requiredSkills:   form.skills,
        status,
      });
      toast.success(status === 'published' ? '🎉 Event published successfully!' : '📄 Saved as draft.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save. Make sure your NGO is registered.');
    } finally {
      setPublishing(false);
      setSavingDraft(false);
    }
  };

  const tier = TIER_INFO[myNgo?.verificationTier || 0];

  const Field = ({ label, error, required, children }) => (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span style={{ color:'var(--red)' }}> *</span>}
      </label>
      {children}
      {error && <p style={{ fontSize:'0.75rem', color:'var(--red)', marginTop:4 }}>⚠ {error}</p>}
    </div>
  );

  return (
    <div style={{ background:'var(--gray-50)', minHeight:'100vh' }}>
      {/* Top bar */}
      <div style={{ background:'white', borderBottom:'1px solid var(--gray-200)', padding:'0 32px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:28, height:28, borderRadius:6, background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <span style={{ fontWeight:800, fontSize:'0.95rem', color:'var(--navy)' }}>NGO Dashboard</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Show NGO tier in header */}
          {myNgo && (
            <span style={{ fontSize:'0.72rem', fontWeight:700, padding:'3px 10px', borderRadius:100, background:tier.bg, color:tier.color }}>
              {tier.icon} {myNgo.name} · {tier.label} Tier
            </span>
          )}
          <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.82rem' }}>{user?.name?.charAt(0)}</div>
        </div>
      </div>

      <div style={{ maxWidth:700, margin:'32px auto', padding:'0 24px' }}>
        <div style={{ fontSize:'0.8rem', color:'var(--gray-400)', marginBottom:14 }}>
          <Link to="/dashboard" style={{ color:'var(--green)' }}>Dashboard</Link>
          <span style={{ margin:'0 6px' }}>›</span>
          <span style={{ color:'var(--navy)' }}>Post an Event</span>
        </div>

        <h1 style={{ fontWeight:800, fontSize:'1.6rem', color:'var(--navy)', marginBottom:4 }}>Post a Volunteer Opportunity</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:28 }}>Fill in the details below. Required fields are marked with *</p>

        {/* NGO not registered */}
        {!ngoLoading && !myNgo && (
          <div style={{ background:'#FEF3C7', border:'1px solid #FCD34D', borderRadius:12, padding:'18px 22px', marginBottom:20 }}>
            <div style={{ fontWeight:700, color:'#92400E', marginBottom:4 }}>⚠ No NGO registered</div>
            <p style={{ fontSize:'0.85rem', color:'#78350F', marginBottom:12 }}>You must register your NGO before you can post events.</p>
            <Link to="/dashboard/create-ngo" className="btn btn-primary btn-sm">Register NGO →</Link>
          </div>
        )}

        {/* NGO pending approval */}
        {!ngoLoading && myNgo && !myNgo.isApproved && (
          <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:12, padding:'14px 18px', marginBottom:20 }}>
            <div style={{ fontWeight:600, color:'#1E40AF', fontSize:'0.875rem' }}>ℹ Your NGO is still pending admin approval. You can draft events now and publish once approved.</div>
          </div>
        )}

        {/* Basic Information */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 28px', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:20 }}>
            <span style={{ fontSize:'1.1rem' }}>ℹ️</span>
            <h2 style={{ fontWeight:700, fontSize:'1rem', color:'var(--navy)' }}>Basic Information</h2>
          </div>

          <Field label="Event Title" error={errors.title} required>
            <input className="form-input" placeholder="e.g. Annual Beach Cleanup 2025"
              value={form.title} onChange={e => set('title', e.target.value)}
              style={{ borderColor: errors.title ? 'var(--red)' : '' }} />
          </Field>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <Field label="Category" error={errors.category} required>
              <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Target Audience">
              <input className="form-input" placeholder="e.g. Students, Families"
                value={form.audience} onChange={e => set('audience', e.target.value)} />
            </Field>
          </div>

          <Field label="Description" error={errors.description} required>
            <textarea className="form-input" rows={5} style={{ resize:'vertical', borderColor: errors.description ? 'var(--red)' : '' }}
              placeholder="Describe the event goals, activities, and why volunteers should join..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>
        </div>

        {/* Logistics */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 28px', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:20 }}>
            <span style={{ fontSize:'1.1rem' }}>⏱️</span>
            <h2 style={{ fontWeight:700, fontSize:'1rem', color:'var(--navy)' }}>Logistics</h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
            <Field label="Date" error={errors.date} required>
              <input type="date" className="form-input"
                value={form.date} onChange={e => set('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ borderColor: errors.date ? 'var(--red)' : '' }} />
            </Field>
            <Field label="Start Time">
              <input type="time" className="form-input"
                value={form.time} onChange={e => set('time', e.target.value)} />
            </Field>
            <Field label="Duration">
              <select className="form-input" value={form.duration} onChange={e => set('duration', e.target.value)}>
                <option value="">Select duration</option>
                {DURATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Location Type">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {['Physical','Virtual'].map(type => (
                <button key={type} type="button" onClick={() => set('locationType', type)} style={{
                  padding:'11px 16px', borderRadius:7, border:'1.5px solid', cursor:'pointer',
                  fontWeight:600, fontSize:'0.875rem', display:'flex', alignItems:'center',
                  justifyContent:'center', gap:7, transition:'all 0.15s',
                  borderColor: form.locationType === type ? 'var(--navy)' : 'var(--gray-200)',
                  background:  form.locationType === type ? 'var(--gray-50)' : 'white',
                  color:       form.locationType === type ? 'var(--navy)' : 'var(--gray-500)',
                }}>
                  <span>{type === 'Physical' ? '📍' : '💻'}</span> {type}
                </button>
              ))}
            </div>
          </Field>

          <Field label={form.locationType === 'Virtual' ? 'Meeting Link' : 'Full Address'} error={errors.address} required>
            <input className="form-input"
              placeholder={form.locationType === 'Virtual' ? 'https://meet.google.com/...' : 'Street address, City, State'}
              value={form.address} onChange={e => set('address', e.target.value)}
              style={{ borderColor: errors.address ? 'var(--red)' : '' }} />
          </Field>
        </div>

        {/* Volunteer Requirements */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 28px', marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:20 }}>
            <span style={{ fontSize:'1.1rem' }}>👥</span>
            <h2 style={{ fontWeight:700, fontSize:'1rem', color:'var(--navy)' }}>Volunteer Requirements</h2>
          </div>

          <Field label="Number of Volunteers Needed" error={errors.volunteersNeeded} required>
            <input type="number" className="form-input" placeholder="e.g. 10" min={1}
              value={form.volunteersNeeded} onChange={e => set('volunteersNeeded', e.target.value)}
              style={{ borderColor: errors.volunteersNeeded ? 'var(--red)' : '' }} />
          </Field>

          <div className="form-group">
            <label className="form-label">Required Skills <span style={{ fontSize:'0.75rem', color:'var(--gray-400)', fontWeight:400 }}>(click to select)</span></label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {SKILLS.map(s => (
                <button key={s} type="button" onClick={() => toggleSkill(s)} style={{
                  padding:'7px 14px', borderRadius:100, border:'1.5px solid', cursor:'pointer',
                  fontWeight:600, fontSize:'0.8rem', transition:'all 0.15s',
                  borderColor: form.skills.includes(s) ? 'var(--green)' : 'var(--gray-200)',
                  background:  form.skills.includes(s) ? 'var(--green-pale)' : 'white',
                  color:       form.skills.includes(s) ? 'var(--green)' : 'var(--gray-600)',
                }}>
                  {form.skills.includes(s) ? '✓ ' : ''}{s}
                </button>
              ))}
            </div>
            {form.skills.length > 0 && (
              <p style={{ fontSize:'0.73rem', color:'var(--green)', marginTop:6, fontWeight:600 }}>
                {form.skills.length} skill{form.skills.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>

        {/* Validation summary */}
        {Object.keys(errors).length > 0 && (
          <div style={{ background:'var(--red-light)', border:'1px solid var(--red)', borderRadius:10, padding:'12px 16px', marginBottom:20 }}>
            <div style={{ fontWeight:700, color:'var(--red)', fontSize:'0.875rem', marginBottom:4 }}>Please fix these errors:</div>
            {Object.values(errors).map((e,i) => <p key={i} style={{ fontSize:'0.82rem', color:'var(--red)' }}>• {e}</p>)}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:12, paddingBottom:40 }}>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')} style={{ padding:'11px 24px' }}>
            Cancel
          </button>
          <button className="btn btn-outline" onClick={() => submit('draft')} disabled={savingDraft || publishing} style={{ padding:'11px 24px' }}>
            {savingDraft ? <><span className="spinner" style={{ borderTopColor:'var(--navy)' }} /> Saving...</> : '📄 Save as Draft'}
          </button>
          <button className="btn btn-primary" onClick={() => submit('published')} disabled={publishing || savingDraft || (!myNgo)} style={{ padding:'11px 28px' }}>
            {publishing ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} /> Publishing...</> : '⚡ Publish Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
