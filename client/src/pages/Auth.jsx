import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ROLES = [
  { value:'volunteer', label:'VOLUNTEER', icon:'👥' },
  { value:'ngo', label:'NGO', icon:'🏛️' },
  { value:'donor', label:'DONOR', icon:'♥' },
];

export default function Auth({ tab: defaultTab }) {
  const [params] = useSearchParams();
  const [activeTab, setActiveTab] = useState(defaultTab || 'login');
  const [role, setRole] = useState(params.get('role') || 'volunteer');
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => { const r = params.get('role'); if (r) { setRole(r); setActiveTab('register'); } }, [params]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); setLoading(false); return; }
        await register(form.name, form.email, form.password, role);
        toast.success('Account created! Welcome 🎉');
      }
      navigate('/dashboard');  // DashboardRouter handles role redirect
    } catch (err) {
      toast.error(err.response?.data?.message || (activeTab === 'login' ? 'Invalid credentials' : 'Registration failed'));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Left dark panel */}
      <div style={{ flex:'0 0 44%', position:'relative', overflow:'hidden', background:'linear-gradient(155deg,#0f172a 0%,#1a2f44 50%,#0d1f0f 100%)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'40px 44px' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(16,185,129,0.06) 1px,transparent 1px)', backgroundSize:'26px 26px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-100, right:-60, width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.09) 0%,transparent 65%)', pointerEvents:'none' }} />
        {/* Logo */}
        <div style={{ position:'relative', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#10B981,#059669)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <span style={{ fontWeight:800, fontSize:'1.05rem', color:'white' }}>NGO Connect</span>
        </div>
        {/* Headline */}
        <div style={{ position:'relative' }}>
          <h2 style={{ fontWeight:800, fontSize:'clamp(1.7rem,3vw,2.5rem)', color:'white', lineHeight:1.12, marginBottom:16 }}>
            Empowering communities, one connection at a time.
          </h2>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.9rem', lineHeight:1.75 }}>
            Join thousands of volunteers, NGOs, and donors working together to create lasting global impact.
          </p>
        </div>
        {/* Social proof */}
        <div style={{ position:'relative', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ display:'flex' }}>
            {['#10B981','#3B82F6','#F59E0B'].map((c, i) => (
              <div key={i} style={{ width:30, height:30, borderRadius:'50%', background:c, border:'2px solid rgba(255,255,255,0.15)', marginLeft:i>0?-8:0 }} />
            ))}
          </div>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.78rem', fontWeight:500 }}>TRUSTED BY 10K+ CHANGE-MAKERS</span>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'white', padding:'48px 56px' }}>
        <div style={{ width:'100%', maxWidth:400 }} className="page-enter">
          <h1 style={{ fontWeight:800, fontSize:'1.7rem', color:'var(--navy)', marginBottom:5 }}>Create your account</h1>
          <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:26 }}>Start your journey as a community hero today.</p>

          {/* Tab toggle */}
          <div style={{ display:'flex', background:'var(--gray-100)', borderRadius:8, padding:3, marginBottom:26 }}>
            {['login','register'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex:1, padding:'9px', borderRadius:6, border:'none', cursor:'pointer', background:activeTab===t?'white':'transparent', color:activeTab===t?'var(--navy)':'var(--gray-500)', fontWeight:activeTab===t?700:500, fontSize:'0.875rem', boxShadow:activeTab===t?'var(--shadow-sm)':'none', transition:'all 0.18s', textTransform:'capitalize' }}>{t === 'login' ? 'Login' : 'Register'}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {activeTab === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-icon-wrap">
                  <span className="icon" style={{ fontSize:'0.85rem' }}>👤</span>
                  <input className="form-input" placeholder="Parakh Singh" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon-wrap">
                <span className="icon" style={{ fontSize:'0.85rem' }}>✉️</span>
                <input type="email" className="form-input" placeholder="parakhsingh@gmail.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
            </div>

            {activeTab === 'register' && (
              <div className="form-group">
                <label className="form-label">I am joining as a...</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                  {ROLES.map(r => (
                    <button key={r.value} type="button" onClick={() => setRole(r.value)} style={{ padding:'12px 6px', borderRadius:9, border:'1.5px solid', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:6, transition:'all 0.15s', borderColor:role===r.value?'var(--green)':'var(--gray-200)', background:role===r.value?'var(--green-pale)':'var(--gray-50)', color:role===r.value?'var(--green)':'var(--gray-500)' }}>
                      <span style={{ fontSize:'1.2rem' }}>{r.icon}</span>
                      <span style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.06em' }}>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <span className="icon" style={{ fontSize:'0.85rem' }}>🔒</span>
                <input type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:14, fontSize:'0.95rem', marginTop:4 }}>
              {loading ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} /> Processing...</> : activeTab === 'register' ? 'Register Account →' : 'Sign In →'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
            <div style={{ flex:1, height:1, background:'var(--gray-200)' }} />
            <span style={{ fontSize:'0.75rem', color:'var(--gray-400)', fontWeight:500 }}>Or continue with</span>
            <div style={{ flex:1, height:1, background:'var(--gray-200)' }} />
          </div>

          <div style={{ display:'flex', gap:10 }}>
            {['🔵 Google','📘 Facebook'].map(s => (
              <button key={s} className="btn btn-outline" style={{ flex:1, justifyContent:'center', fontSize:'0.83rem' }}>{s}</button>
            ))}
          </div>

          <p style={{ textAlign:'center', marginTop:18, fontSize:'0.78rem', color:'var(--gray-400)', lineHeight:1.7 }}>
            By joining, you agree to our <a href="#" style={{ color:'var(--green)', fontWeight:600 }}>Terms of Service</a> and <a href="#" style={{ color:'var(--green)', fontWeight:600 }}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
