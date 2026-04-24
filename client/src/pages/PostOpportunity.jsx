import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { opportunityAPI, ngoAPI } from '../services/api';

const CATEGORIES  = ['Education','Healthcare','Environment','Animal Welfare','Disaster Relief','Women Empowerment','Child Welfare','Food & Hunger','Community Development','Tech & Digital','Other'];
const SKILLS      = ['Teaching','Design','Admin','Physical Labor','Medical','Technical','Communication','Fundraising','Social Work','Legal','Photography','Cooking','Driving'];
const BENEFITS    = ['Certificate','Meals Provided','Transport Reimbursement','Networking','Training','Stipend','Letter of Recommendation'];
const DURATIONS   = ['1-2 hours','Half day','Full day','1 week','2-4 weeks','1-3 months','3-6 months','Ongoing'];
const COMMIT_TYPE = [
  { v:'one-time',   l:'One-time',   icon:'📅', d:'A single event or session' },
  { v:'recurring',  l:'Recurring',  icon:'🔄', d:'Regular weekly commitment' },
  { v:'flexible',   l:'Flexible',   icon:'🕐', d:'Choose your own schedule' },
];

const TIER_INFO = {
  0:{ label:'Unverified', icon:'⚪', color:'var(--gray-500)', bg:'var(--gray-100)' },
  1:{ label:'Bronze',     icon:'🥉', color:'#92400E',         bg:'#FEF2E8' },
  2:{ label:'Silver',     icon:'🥈', color:'#475569',         bg:'#F1F5F9' },
  3:{ label:'Gold',       icon:'🏆', color:'#92400E',         bg:'#FEF3C7' },
};

export default function PostOpportunity() {
  const navigate = useNavigate();
  const toast    = useToast();
  const { user } = useAuth();
  const [myNgo, setMyNgo] = useState(null);
  const [ngoLoading, setNgoLoading] = useState(true);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [status, setStatus]   = useState('open');
  const [form, setForm] = useState({
    title: '', description: '', category: 'Education',
    commitmentType: 'one-time', duration: '', hoursPerWeek: '',
    startDate: '', endDate: '',
    locationType: 'Physical', location: '',
    volunteersNeeded: '', requiredSkills: [],
    minAge: '', requirements: '', benefits: [],
  });

  useEffect(() => {
    ngoAPI.getMine()
      .then(r => setMyNgo(r.data.ngo || null))
      .catch(() => {})
      .finally(() => setNgoLoading(false));
  }, []);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };
  const toggle = (key, v) => setForm(f => ({
    ...f, [key]: f[key].includes(v) ? f[key].filter(x => x !== v) : [...f[key], v],
  }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())           e.title           = 'Title is required';
    if (!form.description.trim())     e.description     = 'Description is required';
    if (!form.location.trim())        e.location        = 'Location is required';
    if (!form.volunteersNeeded || parseInt(form.volunteersNeeded) < 1)
                                      e.volunteersNeeded= 'At least 1 volunteer required';
    return e;
  };

  const handleSubmit = async (s) => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); toast.error('Please fix the errors below'); return; }
    setSaving(true);
    try {
      await opportunityAPI.create({
        title:            form.title.trim(),
        description:      form.description.trim(),
        category:         form.category,
        commitmentType:   form.commitmentType,
        duration:         form.duration,
        hoursPerWeek:     form.hoursPerWeek ? parseInt(form.hoursPerWeek) : 0,
        startDate:        form.startDate || undefined,
        endDate:          form.endDate   || undefined,
        locationType:     form.locationType,
        location:         form.location.trim(),
        volunteersNeeded: parseInt(form.volunteersNeeded),
        requiredSkills:   form.requiredSkills,
        minAge:           form.minAge ? parseInt(form.minAge) : 0,
        requirements:     form.requirements.trim(),
        benefits:         form.benefits,
        status:           s,
      });
      toast.success(s === 'open' ? '🎉 Opportunity published!' : '📄 Saved as draft');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post. Make sure your NGO is registered.');
    } finally { setSaving(false); }
  };

  const tier = TIER_INFO[myNgo?.verificationTier || 0];

  const Err = ({ field }) => errors[field]
    ? <p style={{ fontSize:'0.75rem', color:'var(--red)', marginTop:4 }}>⚠ {errors[field]}</p>
    : null;

  return (
    <div style={{ background:'var(--gray-50)', minHeight:'100vh' }}>
      {/* Top bar */}
      <div style={{ background:'white', borderBottom:'1px solid var(--gray-200)', padding:'0 32px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:28, height:28, borderRadius:6, background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <span style={{ fontWeight:800, fontSize:'0.95rem', color:'var(--navy)' }}>NGO Dashboard</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {myNgo && (
            <span style={{ fontSize:'0.72rem', fontWeight:700, padding:'3px 10px', borderRadius:100, background:tier.bg, color:tier.color }}>
              {tier.icon} {myNgo.name} · {tier.label}
            </span>
          )}
          <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.82rem' }}>{user?.name?.charAt(0)}</div>
        </div>
      </div>

      <div style={{ maxWidth:740, margin:'32px auto', padding:'0 24px' }}>
        <div style={{ fontSize:'0.8rem', color:'var(--gray-400)', marginBottom:14 }}>
          <Link to="/dashboard" style={{ color:'var(--green)' }}>Dashboard</Link> › Post Volunteer Opportunity
        </div>
        <h1 style={{ fontWeight:800, fontSize:'1.6rem', color:'var(--navy)', marginBottom:4 }}>Post a Volunteer Opportunity</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:28 }}>Create a detailed listing to attract the right volunteers for your cause.</p>

        {!ngoLoading && !myNgo && (
          <div style={{ background:'#FEF3C7', border:'1px solid #FCD34D', borderRadius:12, padding:'18px 22px', marginBottom:20 }}>
            <div style={{ fontWeight:700, color:'#92400E', marginBottom:4 }}>⚠ No NGO registered</div>
            <p style={{ fontSize:'0.85rem', color:'#78350F', marginBottom:12 }}>Register your NGO before posting opportunities.</p>
            <Link to="/dashboard/create-ngo" className="btn btn-primary btn-sm">Register NGO →</Link>
          </div>
        )}

        {/* Section 1: Overview */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 28px', marginBottom:20 }}>
          <h2 style={{ fontWeight:700, fontSize:'1rem', color:'var(--navy)', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:24, height:24, borderRadius:'50%', background:'var(--green)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:800 }}>1</span>
            Overview
          </h2>

          <div className="form-group">
            <label className="form-label">Opportunity Title <span style={{ color:'var(--red)' }}>*</span></label>
            <input className="form-input" placeholder="e.g. English Tutors for Underprivileged Kids"
              value={form.title} onChange={e => set('title', e.target.value)}
              style={{ borderColor: errors.title ? 'var(--red)' : '' }} />
            <Err field="title" />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Category <span style={{ color:'var(--red)' }}>*</span></label>
              <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Volunteers Needed <span style={{ color:'var(--red)' }}>*</span></label>
              <input type="number" className="form-input" placeholder="e.g. 5" min={1}
                value={form.volunteersNeeded} onChange={e => set('volunteersNeeded', e.target.value)}
                style={{ borderColor: errors.volunteersNeeded ? 'var(--red)' : '' }} />
              <Err field="volunteersNeeded" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description <span style={{ color:'var(--red)' }}>*</span></label>
            <textarea className="form-input" rows={5} style={{ resize:'vertical', borderColor: errors.description ? 'var(--red)' : '' }}
              placeholder="Describe the opportunity in detail: what volunteers will do, why it matters, what impact they will have..."
              value={form.description} onChange={e => set('description', e.target.value)} />
            <Err field="description" />
          </div>

          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Eligibility / Requirements</label>
            <textarea className="form-input" rows={2} style={{ resize:'vertical' }}
              placeholder="e.g. Must be 18+, basic English fluency required, no prior experience needed..."
              value={form.requirements} onChange={e => set('requirements', e.target.value)} />
          </div>
        </div>

        {/* Section 2: Commitment */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 28px', marginBottom:20 }}>
          <h2 style={{ fontWeight:700, fontSize:'1rem', color:'var(--navy)', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:24, height:24, borderRadius:'50%', background:'var(--green)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:800 }}>2</span>
            Time Commitment
          </h2>

          <div className="form-group">
            <label className="form-label">Commitment Type</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {COMMIT_TYPE.map(ct => (
                <button key={ct.v} type="button" onClick={() => set('commitmentType', ct.v)} style={{
                  padding:'12px 10px', borderRadius:9, border:'1.5px solid', cursor:'pointer', textAlign:'left', transition:'all 0.15s',
                  borderColor: form.commitmentType === ct.v ? 'var(--green)' : 'var(--gray-200)',
                  background:  form.commitmentType === ct.v ? 'var(--green-pale)' : 'white',
                }}>
                  <div style={{ fontSize:'1.2rem', marginBottom:4 }}>{ct.icon}</div>
                  <div style={{ fontWeight:700, fontSize:'0.82rem', color: form.commitmentType === ct.v ? 'var(--green)' : 'var(--navy)' }}>{ct.l}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--gray-500)', marginTop:2 }}>{ct.d}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <select className="form-input" value={form.duration} onChange={e => set('duration', e.target.value)}>
                <option value="">Select duration</option>
                {DURATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            {form.commitmentType === 'recurring' && (
              <div className="form-group">
                <label className="form-label">Hours per Week</label>
                <input type="number" className="form-input" placeholder="e.g. 4" min={1}
                  value={form.hoursPerWeek} onChange={e => set('hoursPerWeek', e.target.value)} />
              </div>
            )}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-input"
                value={form.startDate} onChange={e => set('startDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" className="form-input"
                value={form.endDate} onChange={e => set('endDate', e.target.value)}
                min={form.startDate || new Date().toISOString().split('T')[0]} />
            </div>
          </div>
        </div>

        {/* Section 3: Location */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 28px', marginBottom:20 }}>
          <h2 style={{ fontWeight:700, fontSize:'1rem', color:'var(--navy)', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:24, height:24, borderRadius:'50%', background:'var(--green)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:800 }}>3</span>
            Location
          </h2>

          <div className="form-group">
            <label className="form-label">Location Type</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {[['Physical','📍','In-person at a venue'],['Remote','💻','Work from anywhere'],['Hybrid','🔀','Mix of both']].map(([v,icon,d]) => (
                <button key={v} type="button" onClick={() => set('locationType', v)} style={{
                  padding:'10px 8px', borderRadius:8, border:'1.5px solid', cursor:'pointer', textAlign:'center', transition:'all 0.15s',
                  borderColor: form.locationType === v ? 'var(--green)' : 'var(--gray-200)',
                  background:  form.locationType === v ? 'var(--green-pale)' : 'white',
                }}>
                  <div style={{ fontSize:'1.1rem' }}>{icon}</div>
                  <div style={{ fontWeight:700, fontSize:'0.8rem', color: form.locationType === v ? 'var(--green)' : 'var(--navy)', marginTop:3 }}>{v}</div>
                  <div style={{ fontSize:'0.68rem', color:'var(--gray-500)' }}>{d}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">
              {form.locationType === 'Remote' ? 'Work Location Description' : 'Address / City'} <span style={{ color:'var(--red)' }}>*</span>
            </label>
            <input className="form-input"
              placeholder={form.locationType === 'Remote' ? 'e.g. Work from home, India-based preferred' : 'e.g. 123 Main Street, Bengaluru, Karnataka'}
              value={form.location} onChange={e => set('location', e.target.value)}
              style={{ borderColor: errors.location ? 'var(--red)' : '' }} />
            <Err field="location" />
          </div>
        </div>

        {/* Section 4: Skills & Benefits */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 28px', marginBottom:20 }}>
          <h2 style={{ fontWeight:700, fontSize:'1rem', color:'var(--navy)', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:24, height:24, borderRadius:'50%', background:'var(--green)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:800 }}>4</span>
            Skills & Benefits
          </h2>

          <div className="form-group">
            <label className="form-label">Skills Required <span style={{ fontSize:'0.75rem', color:'var(--gray-400)', fontWeight:400 }}>(click to select)</span></label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {SKILLS.map(s => (
                <button key={s} type="button" onClick={() => toggle('requiredSkills', s)} style={{
                  padding:'6px 14px', borderRadius:100, border:'1.5px solid', cursor:'pointer', fontWeight:600, fontSize:'0.8rem', transition:'all 0.15s',
                  borderColor: form.requiredSkills.includes(s) ? 'var(--green)' : 'var(--gray-200)',
                  background:  form.requiredSkills.includes(s) ? 'var(--green-pale)' : 'white',
                  color:       form.requiredSkills.includes(s) ? 'var(--green)' : 'var(--gray-600)',
                }}>
                  {form.requiredSkills.includes(s) ? '✓ ' : ''}{s}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Benefits for Volunteers <span style={{ fontSize:'0.75rem', color:'var(--gray-400)', fontWeight:400 }}>(what will volunteers get?)</span></label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {BENEFITS.map(b => (
                <button key={b} type="button" onClick={() => toggle('benefits', b)} style={{
                  padding:'6px 14px', borderRadius:100, border:'1.5px solid', cursor:'pointer', fontWeight:600, fontSize:'0.8rem', transition:'all 0.15s',
                  borderColor: form.benefits.includes(b) ? 'var(--blue)' : 'var(--gray-200)',
                  background:  form.benefits.includes(b) ? 'var(--blue-light)' : 'white',
                  color:       form.benefits.includes(b) ? 'var(--blue)' : 'var(--gray-600)',
                }}>
                  {form.benefits.includes(b) ? '✓ ' : ''}{b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error summary */}
        {Object.keys(errors).length > 0 && (
          <div style={{ background:'var(--red-light)', border:'1px solid var(--red)', borderRadius:10, padding:'12px 16px', marginBottom:20 }}>
            <div style={{ fontWeight:700, color:'var(--red)', marginBottom:4, fontSize:'0.875rem' }}>Please fix:</div>
            {Object.values(errors).map((e,i) => <p key={i} style={{ fontSize:'0.82rem', color:'var(--red)' }}>• {e}</p>)}
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:12, paddingBottom:48 }}>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>Cancel</button>
          <button className="btn btn-outline" onClick={() => handleSubmit('draft')} disabled={saving}>
            {saving ? '...' : '📄 Save Draft'}
          </button>
          <button className="btn btn-primary" onClick={() => handleSubmit('open')} disabled={saving || !myNgo}>
            {saving ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} /> Publishing...</> : '🚀 Publish Opportunity'}
          </button>
        </div>
      </div>
    </div>
  );
}
