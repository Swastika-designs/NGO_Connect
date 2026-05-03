import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { opportunityAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TIER_INFO = {
  0:{ label:'Unverified', icon:'⚪', color:'var(--gray-500)', bg:'var(--gray-100)', border:'var(--gray-200)' },
  1:{ label:'Bronze',     icon:'🥉', color:'#92400E',         bg:'#FEF2E8',         border:'#FDBA74' },
  2:{ label:'Silver',     icon:'🥈', color:'#475569',         bg:'#F1F5F9',         border:'#CBD5E1' },
  3:{ label:'Gold',       icon:'🏆', color:'#92400E',         bg:'#FEF3C7',         border:'#FCD34D' },
};

export default function OpportunityDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');
  const [showApply, setShowApply] = useState(false);

  const [error, setError] = useState(false);

  useEffect(() => {
    const loadOpp = async () => {
      try {
        const res = await opportunityAPI.getOne(id);
        setOpp(res.data.opportunity);
      } catch {
        setError(true);
      } finally { setLoading(false); }
    };
    loadOpp();
  }, [id]);

  const hasApplied = opp?.applications?.some(a => {
    const vid = a.volunteer?._id || a.volunteer;
    return vid?.toString() === user?._id?.toString();
  });

  const handleApply = async () => {
    if (!user) { navigate('/login'); return; }
    setApplying(true);
    try {
      await opportunityAPI.apply(id, { message: applyMsg });
      toast.success('Application submitted! ✅');
      setShowApply(false);
      // Refresh
      const res = await opportunityAPI.getOne(id);
      setOpp(res.data.opportunity);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally { setApplying(false); }
  };

  const tier = TIER_INFO[opp?.ngo?.verificationTier || 0];

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <Navbar />
      <main style={{ flex:1, paddingTop:64, background:'var(--gray-50)' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:300 }}>
            <span className="spinner" style={{ width:36, height:36 }} />
          </div>
        ) : error ? (
          <div style={{ textAlign:'center', padding:'80px 24px' }}>
            <div style={{ fontSize:'3rem', marginBottom:16 }}>🔍</div>
            <h2 style={{ fontWeight:800, color:'var(--navy)', marginBottom:8 }}>Opportunity Not Found</h2>
            <p style={{ color:'var(--gray-500)', marginBottom:24 }}>This opportunity may have been removed or the link is invalid.</p>
            <Link to="/opportunities" className="btn btn-primary">← Back to Opportunities</Link>
          </div>
        ) : !opp ? null : (
          <div className="container" style={{ padding:'28px 24px', maxWidth:900 }}>
            {/* Breadcrumb */}
            <div style={{ fontSize:'0.8rem', color:'var(--gray-400)', marginBottom:16 }}>
              <Link to="/" style={{ color:'var(--green)' }}>Home</Link> /{' '}
              <Link to="/opportunities" style={{ color:'var(--green)' }}>Opportunities</Link> /{' '}
              {opp.title}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:22, alignItems:'start' }}>
              {/* Left: main content */}
              <div>
                <div style={{ background:'white', borderRadius:14, border:'1px solid var(--gray-200)', overflow:'hidden', marginBottom:18 }}>
                  <div style={{ height:8, background:'var(--green)' }} />
                  <div style={{ padding:'24px 28px' }}>
                    {/* NGO row */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                      <div style={{ width:44, height:44, borderRadius:10, background:'var(--green-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1.1rem', color:'var(--green)', flexShrink:0 }}>
                        {opp.ngo?.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--navy)' }}>{opp.ngo?.name}</div>
                        <div style={{ fontSize:'0.75rem', color:'var(--gray-500)', display:'flex', gap:8, alignItems:'center' }}>
                          {opp.ngo?.category}
                          <span style={{ fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:100, background:tier.bg, color:tier.color, border:`1px solid ${tier.border}` }}>
                            {tier.icon} {tier.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', marginBottom:10 }}>{opp.title}</h1>

                    {/* Tags */}
                    <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:16 }}>
                      <span style={{ fontSize:'0.75rem', fontWeight:700, background:'var(--green-pale)', color:'var(--green)', padding:'4px 12px', borderRadius:100 }}>{opp.category}</span>
                      <span style={{ fontSize:'0.75rem', fontWeight:600, background:'var(--gray-100)', color:'var(--gray-600)', padding:'4px 12px', borderRadius:100 }}>
                        {opp.locationType === 'Remote' ? '💻' : opp.locationType === 'Hybrid' ? '🔀' : '📍'} {opp.locationType}
                      </span>
                      {opp.commitmentType && (
                        <span style={{ fontSize:'0.75rem', fontWeight:600, background:'#EFF6FF', color:'#1D4ED8', padding:'4px 12px', borderRadius:100 }}>
                          {opp.commitmentType === 'one-time' ? '📅' : opp.commitmentType === 'recurring' ? '🔄' : '🕐'} {opp.commitmentType}
                        </span>
                      )}
                      <span style={{ fontSize:'0.75rem', fontWeight:600, background:opp.status==='open'?'#D1FAE5':'#FEE2E2', color:opp.status==='open'?'#065F46':'#991B1B', padding:'4px 12px', borderRadius:100 }}>
                        {opp.status === 'open' ? '🟢 Open' : '🔴 Closed'}
                      </span>
                    </div>

                    <h3 style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem', marginBottom:8 }}>About this Role</h3>
                    <p style={{ color:'var(--gray-600)', fontSize:'0.88rem', lineHeight:1.75, marginBottom:20, whiteSpace:'pre-wrap' }}>{opp.description}</p>

                    {Array.isArray(opp.responsibilities) && opp.responsibilities.length > 0 && (
                      <>
                        <h3 style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem', marginBottom:8 }}>Responsibilities</h3>
                        <ul style={{ paddingLeft:20, marginBottom:20 }}>
                          {opp.responsibilities.map((r, i) => (
                            <li key={i} style={{ fontSize:'0.875rem', color:'var(--gray-600)', marginBottom:5, lineHeight:1.6 }}>{r}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {Array.isArray(opp.requirements) && opp.requirements.length > 0 && (
                      <>
                        <h3 style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem', marginBottom:8 }}>Requirements</h3>
                        <ul style={{ paddingLeft:20, marginBottom:20 }}>
                          {opp.requirements.map((r, i) => (
                            <li key={i} style={{ fontSize:'0.875rem', color:'var(--gray-600)', marginBottom:5, lineHeight:1.6 }}>{r}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {Array.isArray(opp.requiredSkills) && opp.requiredSkills.length > 0 && (
                      <>
                        <h3 style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem', marginBottom:8 }}>Required Skills</h3>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:20 }}>
                          {opp.requiredSkills.map(s => (
                            <span key={s} className="badge badge-green" style={{ fontSize:'0.8rem' }}>{s}</span>
                          ))}
                        </div>
                      </>
                    )}

                    {Array.isArray(opp.benefits) && opp.benefits.length > 0 && (
                      <>
                        <h3 style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem', marginBottom:8 }}>What You Get</h3>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                          {opp.benefits.map(b => (
                            <span key={b} style={{ fontSize:'0.78rem', fontWeight:600, background:'#EEF2FF', color:'#6366F1', padding:'4px 12px', borderRadius:100 }}>✓ {b}</span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: details + apply */}
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {/* Quick details */}
                <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'20px' }}>
                  <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem', marginBottom:14 }}>Opportunity Details</div>
                  {[
                    opp.location     && ['📍 Location',    opp.location],
                    opp.duration     && ['⏱ Duration',     opp.duration],
                    opp.startDate    && ['📅 Start Date',   new Date(opp.startDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })],
                    opp.endDate      && ['📅 End Date',     new Date(opp.endDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })],
                    ['👥 Volunteers Needed', `${opp.volunteersNeeded || 1}`],
                    ['✅ Applied',     `${opp.applications?.length || 0} applicant${opp.applications?.length !== 1 ? 's' : ''}`],
                  ].filter(Boolean).map(([label, val]) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'8px 0', borderBottom:'1px solid var(--gray-100)' }}>
                      <span style={{ fontSize:'0.78rem', color:'var(--gray-500)', fontWeight:600 }}>{label}</span>
                      <span style={{ fontSize:'0.78rem', color:'var(--navy)', fontWeight:700, textAlign:'right', maxWidth:140 }}>{val}</span>
                    </div>
                  ))}

                  <div style={{ marginTop:16 }}>
                    {user?.role === 'volunteer' && (
                      hasApplied ? (
                        <div style={{ background:'#D1FAE5', borderRadius:9, padding:'12px', textAlign:'center', color:'#065F46', fontWeight:700, fontSize:'0.875rem' }}>
                          ✅ You've already applied!
                        </div>
                      ) : opp.status !== 'open' ? (
                        <div style={{ background:'#FEE2E2', borderRadius:9, padding:'12px', textAlign:'center', color:'#991B1B', fontWeight:700, fontSize:'0.875rem' }}>
                          🔴 Applications closed
                        </div>
                      ) : (
                        <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:13 }}
                          onClick={() => setShowApply(true)}>
                          ✋ Apply Now
                        </button>
                      )
                    )}
                    {!user && (
                      <Link to="/login" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:13, display:'flex', textDecoration:'none' }}>
                        Login to Apply
                      </Link>
                    )}
                  </div>
                </div>

                {/* NGO contact */}
                {opp.ngo?.contact?.email && (
                  <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'16px 18px' }}>
                    <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.85rem', marginBottom:10 }}>Contact NGO</div>
                    <a href={`mailto:${opp.ngo.contact.email}`} style={{ fontSize:'0.8rem', color:'var(--green)', textDecoration:'none', fontWeight:600 }}>
                      ✉ {opp.ngo.contact.email}
                    </a>
                  </div>
                )}

                <Link to="/opportunities" style={{ fontSize:'0.8rem', color:'var(--gray-500)', textDecoration:'none', textAlign:'center' }}>
                  ← Back to Opportunities
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />

      {/* Apply Modal */}
      {showApply && (
        <div onClick={() => setShowApply(false)} style={{ position:'fixed', inset:0, background:'rgba(17,24,39,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:16, backdropFilter:'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:16, width:'100%', maxWidth:480, padding:28, boxShadow:'var(--shadow-lg)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <div>
                <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--green)', textTransform:'uppercase', marginBottom:2 }}>Applying to</p>
                <h3 style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--navy)' }}>{opp.title}</h3>
                <p style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>{opp.ngo?.name}</p>
              </div>
              <button onClick={() => setShowApply(false)} style={{ background:'var(--gray-100)', border:'none', borderRadius:'50%', width:30, height:30, cursor:'pointer', fontSize:'1.1rem' }}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Why are you a good fit? <span style={{ color:'var(--gray-400)', fontWeight:400 }}>(optional)</span></label>
              <textarea className="form-input" rows={4} style={{ resize:'vertical' }}
                placeholder="Tell the NGO about your relevant experience, skills, and passion for this cause..."
                value={applyMsg} onChange={e => setApplyMsg(e.target.value)} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-outline" style={{ flex:1, justifyContent:'center' }} onClick={() => setShowApply(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={handleApply} disabled={applying}>
                {applying ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} /> Submitting...</> : '✅ Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
