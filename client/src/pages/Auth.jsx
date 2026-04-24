import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ROLES = [
  { value:'volunteer', label:'VOLUNTEER', icon:'👥', desc:'Find events & give time' },
  { value:'ngo', label:'NGO', icon:'🏛️', desc:'Post events & recruit' },
  { value:'donor', label:'DONOR', icon:'♥', desc:'Donate & fund causes' },
];

const ALL_SKILLS = ['Teaching','Design','Medical','Technical','Admin','Physical Labor','Communication'];
const ALL_AVAIL  = ['Weekdays','Weekends','Evenings'];

export default function Auth({ tab: defaultTab }) {
  const [params]      = useSearchParams();
  const [activeTab, setActiveTab]   = useState(defaultTab || 'login');
  const [role, setRole]             = useState(params.get('role') || 'volunteer');
  const [step, setStep]             = useState(1); // 1 = basic, 2 = role profile
  const [form, setForm]             = useState({ name:'', email:'', password:'', phone:'', location:'' });
  const [roleData, setRoleData]     = useState({ skills:[], availability:[], bio:'' });
  const [loading, setLoading]       = useState(false);
  const { login, register, updateUser } = useAuth();
  const toast   = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const r = params.get('role');
    if (r) { setRole(r); setActiveTab('register'); }
  }, [params]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setRD = (k, v) => setRoleData(f => ({ ...f, [k]: v }));

  const toggleSkill = s => setRoleData(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x=>x!==s) : [...f.skills,s] }));
  const toggleAvail = a => setRoleData(f => ({ ...f, availability: f.availability.includes(a) ? f.availability.filter(x=>x!==a) : [...f.availability,a] }));

  const handleStep1 = (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    // For NGO role, go directly — no extra profile step needed at registration
    if (activeTab === 'register' && role !== 'ngo') {
      setStep(2);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        const profileExtra = role === 'volunteer'
          ? { skills: roleData.skills, availability: roleData.availability, bio: roleData.bio, phone: form.phone, location: form.location }
          : role === 'donor'
          ? { bio: roleData.bio, phone: form.phone, location: form.location }
          : {};
        const user = await register(form.name, form.email, form.password, role, profileExtra);
        toast.success('Account created! Welcome 🎉');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || (activeTab === 'login' ? 'Invalid credentials' : 'Registration failed'));
    } finally { setLoading(false); }
  };

  const inputStyle = { width:'100%', padding:'10px 14px 10px 36px', border:'1.5px solid var(--gray-200)', borderRadius:6, background:'var(--gray-50)', color:'var(--navy)', fontSize:'0.9rem', fontFamily:'inherit', outline:'none' };

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Left dark panel */}
      <div style={{ flex:'0 0 44%', position:'relative', overflow:'hidden', background:'linear-gradient(155deg,#0f172a 0%,#1a2f44 50%,#0d1f0f 100%)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'40px 44px' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(16,185,129,0.06) 1px,transparent 1px)', backgroundSize:'26px 26px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-100, right:-60, width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.09) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#10B981,#059669)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <span style={{ fontWeight:800, fontSize:'1.05rem', color:'white' }}>NGO Connect</span>
        </div>
        <div style={{ position:'relative' }}>
          <h2 style={{ fontWeight:800, fontSize:'clamp(1.7rem,3vw,2.5rem)', color:'white', lineHeight:1.12, marginBottom:16 }}>
            Empowering communities, one connection at a time.
          </h2>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.9rem', lineHeight:1.75 }}>
            Join thousands of volunteers, NGOs, and donors working together to create lasting global impact.
          </p>
          {/* Tier info */}
          <div style={{ marginTop:24, display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { icon:'🏆', label:'Gold Tier', desc:'Fully verified NGOs — top trust level' },
              { icon:'🥈', label:'Silver Tier', desc:'Core documents verified by admin' },
              { icon:'🥉', label:'Bronze Tier', desc:'Basic registration confirmed' },
            ].map(({ icon, label, desc }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:10, opacity:0.75 }}>
                <span style={{ fontSize:'1rem' }}>{icon}</span>
                <div>
                  <span style={{ fontSize:'0.78rem', fontWeight:700, color:'rgba(255,255,255,0.85)' }}>{label}</span>
                  <span style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.45)', marginLeft:6 }}>{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position:'relative', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ display:'flex' }}>
            {['#10B981','#3B82F6','#F59E0B'].map((c,i) => (
              <div key={i} style={{ width:30, height:30, borderRadius:'50%', background:c, border:'2px solid rgba(255,255,255,0.15)', marginLeft:i>0?-8:0 }} />
            ))}
          </div>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.78rem', fontWeight:500 }}>TRUSTED BY 10K+ CHANGE-MAKERS</span>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'white', padding:'48px 56px', overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:420 }} className="page-enter">

          {/* Tab toggle */}
          <div style={{ display:'flex', background:'var(--gray-100)', borderRadius:8, padding:3, marginBottom:26 }}>
            {['login','register'].map(t => (
              <button key={t} onClick={() => { setActiveTab(t); setStep(1); }} style={{ flex:1, padding:'9px', borderRadius:6, border:'none', cursor:'pointer', background:activeTab===t?'white':'transparent', color:activeTab===t?'var(--navy)':'var(--gray-500)', fontWeight:activeTab===t?700:500, fontSize:'0.875rem', boxShadow:activeTab===t?'var(--shadow-sm)':'none', transition:'all 0.18s', textTransform:'capitalize' }}>{t === 'login' ? 'Login' : 'Register'}</button>
            ))}
          </div>

          {activeTab === 'login' ? (
            /* ── LOGIN FORM ── */
            <>
              <h1 style={{ fontWeight:800, fontSize:'1.7rem', color:'var(--navy)', marginBottom:5 }}>Welcome back</h1>
              <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:26 }}>Sign in to continue your impact journey.</p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-icon-wrap">
                    <span className="icon">✉️</span>
                    <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-icon-wrap">
                    <span className="icon">🔒</span>
                    <input type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:14, fontSize:'0.95rem' }}>
                  {loading ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} /> Signing in...</> : 'Sign In →'}
                </button>
              </form>
            </>
          ) : step === 1 ? (
            /* ── REGISTER STEP 1: Basic Info + Role ── */
            <>
              <h1 style={{ fontWeight:800, fontSize:'1.7rem', color:'var(--navy)', marginBottom:5 }}>Create account</h1>
              <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:22 }}>Join thousands making a difference.</p>

              {/* Role selector */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:22 }}>
                {ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)} style={{
                    padding:'12px 6px', borderRadius:9, border:'1.5px solid', cursor:'pointer',
                    display:'flex', flexDirection:'column', alignItems:'center', gap:5, transition:'all 0.15s',
                    borderColor: role===r.value ? 'var(--green)' : 'var(--gray-200)',
                    background: role===r.value ? 'var(--green-pale)' : 'var(--gray-50)',
                    color: role===r.value ? 'var(--green)' : 'var(--gray-500)',
                  }}>
                    <span style={{ fontSize:'1.3rem' }}>{r.icon}</span>
                    <span style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.05em' }}>{r.label}</span>
                    <span style={{ fontSize:'0.62rem', opacity:0.75, textAlign:'center', lineHeight:1.3 }}>{r.desc}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleStep1}>
                <div className="form-group">
                  <label className="form-label">Full Name <span style={{ color:'var(--red)' }}>*</span></label>
                  <div className="input-icon-wrap">
                    <span className="icon">👤</span>
                    <input className="form-input" placeholder="Priya Sharma" value={form.name} onChange={e => set('name', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address <span style={{ color:'var(--red)' }}>*</span></label>
                  <div className="input-icon-wrap">
                    <span className="icon">✉️</span>
                    <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" placeholder="+91 9876..." value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" placeholder="Mumbai" value={form.location} onChange={e => set('location', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Password <span style={{ color:'var(--red)' }}>*</span></label>
                  <div className="input-icon-wrap">
                    <span className="icon">🔒</span>
                    <input type="password" className="form-input" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:14, fontSize:'0.95rem' }}>
                  {role === 'ngo' ? 'Create Account →' : 'Next: Set up profile →'}
                </button>
              </form>
            </>
          ) : (
            /* ── REGISTER STEP 2: Role-specific profile ── */
            <>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <button onClick={() => setStep(1)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray-500)', fontSize:'0.85rem' }}>← Back</button>
                <div style={{ flex:1 }}>
                  <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', marginBottom:2 }}>
                    {role === 'volunteer' ? '👥 Volunteer Profile' : '♥ Donor Profile'}
                  </h1>
                  <p style={{ color:'var(--gray-500)', fontSize:'0.82rem' }}>Help us match you with the right opportunities.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Short Bio</label>
                  <textarea className="form-input" rows={2} placeholder={role === 'volunteer' ? "What drives you to volunteer? What are you passionate about?" : "What causes are closest to your heart?"} value={roleData.bio} onChange={e => setRD('bio', e.target.value)} style={{ resize:'vertical' }} />
                </div>

                {role === 'volunteer' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Your Skills</label>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                        {ALL_SKILLS.map(s => (
                          <button key={s} type="button" onClick={() => toggleSkill(s)} style={{
                            padding:'6px 12px', borderRadius:100, border:'1.5px solid', cursor:'pointer', fontWeight:600, fontSize:'0.8rem', transition:'all 0.15s',
                            borderColor: roleData.skills.includes(s) ? 'var(--green)' : 'var(--gray-200)',
                            background: roleData.skills.includes(s) ? 'var(--green-pale)' : 'white',
                            color: roleData.skills.includes(s) ? 'var(--green)' : 'var(--gray-600)',
                          }}>{roleData.skills.includes(s) ? '✓ ' : ''}{s}</button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Availability</label>
                      <div style={{ display:'flex', gap:14 }}>
                        {ALL_AVAIL.map(a => (
                          <label key={a} style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer', fontSize:'0.875rem', fontWeight:500, color:'var(--gray-700)' }}>
                            <input type="checkbox" checked={roleData.availability.includes(a)} onChange={() => toggleAvail(a)} style={{ accentColor:'var(--green)', width:15, height:15 }} />
                            {a}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:14, fontSize:'0.95rem', marginTop:8 }}>
                  {loading ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} /> Creating account...</> : 'Create Account →'}
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign:'center', marginTop:18, fontSize:'0.78rem', color:'var(--gray-400)', lineHeight:1.7 }}>
            By joining, you agree to our <a href="#" style={{ color:'var(--green)', fontWeight:600 }}>Terms</a> and <a href="#" style={{ color:'var(--green)', fontWeight:600 }}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
