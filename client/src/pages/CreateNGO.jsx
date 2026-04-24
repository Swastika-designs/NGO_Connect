import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ngoAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['Education','Healthcare','Environment','Animal Welfare','Disaster Relief','Women Empowerment','Child Welfare','Food & Hunger','Poverty Alleviation','Human Rights','Arts & Culture','Other'];
const STEPS = ['Basic Info','Location & Details','Contact'];

export default function CreateNGO() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:'', description:'', mission:'', category:'',
    foundedYear:'', registrationNumber:'', tags:'',
    city:'', state:'', country:'India',
    email:'', phone:'', website:'',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.category) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    try {
      const res = await ngoAPI.create({
        name: form.name, description: form.description, mission: form.mission, category: form.category,
        foundedYear: form.foundedYear ? parseInt(form.foundedYear) : undefined,
        registrationNumber: form.registrationNumber,
        tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : [],
        location: { city:form.city, state:form.state, country:form.country },
        contact: { email:form.email, phone:form.phone, website:form.website },
      });
      toast.success('Your NGO has been submitted for review. It will appear publicly after admin approval. ✅');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create NGO');
    } finally { setLoading(false); }
  };

  const nextStep = () => {
    if (step === 0 && (!form.name || !form.description || !form.category)) { toast.error('Please fill name, category and description'); return; }
    setStep(s => s + 1);
  };

  const Field = ({ label, k, type='text', placeholder, required, as='input', rows, options }) => (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color:'var(--red)' }}> *</span>}</label>
      {as === 'select' ? (
        <select className="form-input" value={form[k]} onChange={e => set(k, e.target.value)} required={required}>
          <option value="">Select {label}</option>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : as === 'textarea' ? (
        <textarea className="form-input" rows={rows||4} style={{ resize:'vertical' }} placeholder={placeholder} value={form[k]} onChange={e => set(k, e.target.value)} required={required} />
      ) : (
        <input type={type} className="form-input" placeholder={placeholder} value={form[k]} onChange={e => set(k, e.target.value)} required={required} />
      )}
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--gray-50)', paddingTop:80 }}>
      <div style={{ maxWidth:640, margin:'0 auto', padding:'40px 24px' }}>
        <p style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.1em', color:'var(--green)', textTransform:'uppercase', marginBottom:6 }}>Register Organisation</p>
        <h1 style={{ fontWeight:800, fontSize:'1.8rem', color:'var(--navy)', marginBottom:6 }}>Add your NGO</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:32 }}>Share your mission and connect with donors and volunteers.</p>

        {/* Step indicator */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:36 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display:'flex', alignItems:'center', gap:8, cursor: i < step ? 'pointer' : 'default' }} onClick={() => i < step && setStep(i)}>
                <div style={{
                  width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:700, fontSize:'0.8rem', flexShrink:0, transition:'all 0.2s',
                  background: i <= step ? 'var(--green)' : 'var(--gray-200)',
                  color: i <= step ? 'white' : 'var(--gray-500)',
                }}>
                  {i < step ? '✓' : i+1}
                </div>
                <span style={{ fontSize:'0.83rem', fontWeight: i===step ? 700 : 400, color: i===step ? 'var(--navy)' : 'var(--gray-400)' }}>{s}</span>
              </div>
              {i < STEPS.length-1 && <div style={{ flex:1, height:2, background: i < step ? 'var(--green)' : 'var(--gray-200)', margin:'0 12px', transition:'background 0.3s' }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ background:'white', borderRadius:14, border:'1px solid var(--gray-200)', padding:'28px 32px', boxShadow:'var(--shadow-sm)' }}>
          {step === 0 && (
            <>
              <Field label="NGO Name" k="name" placeholder="e.g. Teach For India" required />
              <Field label="Category" k="category" as="select" options={CATEGORIES} required />
              <Field label="Description" k="description" as="textarea" rows={5} placeholder="Describe your NGO's work and impact..." required />
              <Field label="Mission Statement" k="mission" as="textarea" rows={3} placeholder="Your core mission..." />
            </>
          )}
          {step === 1 && (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <Field label="Founded Year" k="foundedYear" type="number" placeholder="e.g. 2010" />
                <Field label="Registration Number" k="registrationNumber" placeholder="e.g. NGO/123/2010" />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                <Field label="City" k="city" placeholder="Mumbai" />
                <Field label="State" k="state" placeholder="Maharashtra" />
                <Field label="Country" k="country" placeholder="India" />
              </div>
              <div className="form-group">
                <label className="form-label">Tags <span style={{ color:'var(--gray-400)', fontWeight:400 }}>(comma-separated)</span></label>
                <input className="form-input" placeholder="education, rural, children" value={form.tags} onChange={e => set('tags', e.target.value)} />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <Field label="Contact Email" k="email" type="email" placeholder="info@yourngo.org" />
              <Field label="Contact Phone" k="phone" placeholder="+91 XXXXX XXXXX" />
              <Field label="Website" k="website" placeholder="https://yourngo.org" />
              <div style={{ background:'var(--green-pale)', border:'1px solid var(--green-light)', borderRadius:8, padding:'14px 16px', marginTop:4 }}>
                <p style={{ fontSize:'0.83rem', color:'var(--green-dark)', lineHeight:1.65 }}>
                  ✅ By submitting, you confirm all information is accurate and you are authorized to register this NGO on NGOConnect.
                </p>
              </div>
            </>
          )}
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', marginTop:20 }}>
          <button className="btn btn-outline" onClick={() => step > 0 ? setStep(s => s-1) : navigate('/dashboard')} style={{ padding:'11px 24px' }}>
            {step === 0 ? '← Cancel' : '← Back'}
          </button>
          {step < STEPS.length-1 ? (
            <button className="btn btn-primary" onClick={nextStep} style={{ padding:'11px 28px' }}>Next →</button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ padding:'11px 28px' }}>
              {loading ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} /> Submitting...</> : '🚀 Register NGO'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
