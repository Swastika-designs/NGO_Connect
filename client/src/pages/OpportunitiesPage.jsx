import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { opportunityAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CATEGORIES = ['All','Education','Healthcare','Environment','Animal Welfare','Disaster Relief','Women Empowerment','Child Welfare','Food & Hunger','Community Development','Tech & Digital','Other'];
const LOC_TYPES  = ['All','Physical','Remote','Hybrid'];
const ALL_SKILLS = ['Teaching','Design','Admin','Physical Labor','Medical','Technical','Communication','Fundraising'];

const TIER_INFO = {
  0:{ label:'Unverified', icon:'⚪', color:'var(--gray-500)', bg:'var(--gray-100)', border:'var(--gray-200)' },
  1:{ label:'Bronze',     icon:'🥉', color:'#92400E',         bg:'#FEF2E8',         border:'#FDBA74' },
  2:{ label:'Silver',     icon:'🥈', color:'#475569',         bg:'#F1F5F9',         border:'#CBD5E1' },
  3:{ label:'Gold',       icon:'🏆', color:'#92400E',         bg:'#FEF3C7',         border:'#FCD34D' },
};

const COMMIT_ICONS = { 'one-time':'📅', 'recurring':'🔄', 'flexible':'🕐' };
const LOC_ICONS    = { Physical:'📍', Remote:'💻', Hybrid:'🔀' };

function TierBadge({ tier = 0 }) {
  const t = TIER_INFO[tier] || TIER_INFO[0];
  return (
    <span style={{ fontSize:'0.65rem', fontWeight:700, padding:'2px 8px', borderRadius:100, background:t.bg, color:t.color, border:`1px solid ${t.border}` }}>
      {t.icon} {t.label}
    </span>
  );
}

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();
  const [opps,       setOpps]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [pages,      setPages]      = useState(1);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [searchInput,setSearchInput]= useState('');
  const [category,   setCategory]   = useState('All');
  const [locType,    setLocType]    = useState('All');
  const [applying,   setApplying]   = useState(null);
  const [applyModal, setApplyModal] = useState(null);
  const [applyMsg,   setApplyMsg]   = useState('');

  const fetchOpps = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (search)               params.search     = search;
      if (category !== 'All')   params.category   = category;
      if (locType  !== 'All')   params.locationType = locType;
      const res = await opportunityAPI.getAll(params);
      setOpps(res.data.opportunities  || []);
      setPages(res.data.pages || 1);
    } catch { setOpps([]); }
    finally { setLoading(false); }
  }, [page, search, category, locType]);

  useEffect(() => { fetchOpps(); }, [fetchOpps]);

  const handleSearch = () => { setSearch(searchInput); setPage(1); };

  const handleApply = async () => {
    if (!applyModal) return;
    if (!user) { navigate('/login'); return; }
    setApplying(applyModal._id);
    try {
      await opportunityAPI.apply(applyModal._id, { message: applyMsg });
      toast.success('Application submitted! ✅');
      setApplyModal(null);
      setApplyMsg('');
      fetchOpps();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally { setApplying(null); }
  };

  const hasApplied = (opp) =>
    opp.applications?.some(a => {
      const vid = a.volunteer?._id || a.volunteer;
      return vid?.toString() === user?._id?.toString();
    });

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <Navbar />
      <main style={{ flex:1, paddingTop:64, background:'var(--gray-50)' }}>
        {/* Header */}
        <div style={{ background:'white', borderBottom:'1px solid var(--gray-200)', padding:'28px 0 20px' }}>
          <div className="container">
            <div style={{ fontSize:'0.8rem', color:'var(--gray-400)', marginBottom:8 }}>
              <Link to="/" style={{ color:'var(--green)' }}>Home</Link> / Volunteer Opportunities
            </div>
            <h1 style={{ fontWeight:800, fontSize:'1.8rem', color:'var(--navy)', marginBottom:4 }}>Volunteer Opportunities</h1>
            <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:18 }}>Find meaningful volunteer roles that match your skills and schedule.</p>
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ flex:1, position:'relative', maxWidth:520 }}>
                <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }}>🔍</span>
                <input className="form-input" style={{ paddingLeft:36, height:44 }}
                  placeholder="Search by title, skill, or location..."
                  value={searchInput} onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()} />
              </div>
              <button className="btn btn-primary" style={{ height:44, padding:'0 22px' }} onClick={handleSearch}>Search</button>
              {user?.role === 'ngo' && (
                <Link to="/dashboard/post-opportunity" className="btn btn-outline" style={{ height:44, padding:'0 18px', display:'flex', alignItems:'center' }}>+ Post Opportunity</Link>
              )}
            </div>
          </div>
        </div>

        <div className="container" style={{ padding:'24px 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:22, alignItems:'start' }}>
            {/* Filters */}
            <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'20px 18px', position:'sticky', top:80 }}>
              <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--navy)', marginBottom:14 }}>⚙ Filters</div>

              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Category</div>
                {CATEGORIES.map(c => (
                  <div key={c} onClick={() => { setCategory(c); setPage(1); }} style={{
                    padding:'7px 10px', borderRadius:6, cursor:'pointer', fontSize:'0.84rem', marginBottom:3,
                    fontWeight: category === c ? 700 : 400,
                    background: category === c ? 'var(--green-pale)' : 'transparent',
                    color:      category === c ? 'var(--green)' : 'var(--gray-600)',
                  }}>{c}</div>
                ))}
              </div>

              <div className="divider" />

              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Location Type</div>
                {LOC_TYPES.map(t => (
                  <div key={t} onClick={() => { setLocType(t); setPage(1); }} style={{
                    padding:'7px 10px', borderRadius:6, cursor:'pointer', fontSize:'0.84rem', marginBottom:3,
                    fontWeight: locType === t ? 700 : 400,
                    background: locType === t ? 'var(--green-pale)' : 'transparent',
                    color:      locType === t ? 'var(--green)' : 'var(--gray-600)',
                  }}>
                    {t !== 'All' && LOC_ICONS[t] + ' '}{t}
                  </div>
                ))}
              </div>

              <button onClick={() => { setCategory('All'); setLocType('All'); setSearch(''); setSearchInput(''); setPage(1); }}
                className="btn btn-outline btn-sm" style={{ width:'100%', justifyContent:'center' }}>Clear Filters</button>
            </div>

            {/* Results */}
            <div>
              <div style={{ fontSize:'0.83rem', color:'var(--gray-500)', marginBottom:14 }}>
                {loading ? 'Loading...' : `${opps.length} opportunit${opps.length !== 1 ? 'ies' : 'y'} found`}
              </div>

              {loading ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                  {Array(6).fill(null).map((_,i) => (
                    <div key={i} style={{ height:240, borderRadius:12, background:'var(--gray-200)' }} />
                  ))}
                </div>
              ) : opps.length === 0 ? (
                <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'60px 32px', textAlign:'center', color:'var(--gray-400)' }}>
                  <div style={{ fontSize:'3rem', marginBottom:10 }}>🔍</div>
                  <div style={{ fontWeight:700, color:'var(--navy)', marginBottom:6 }}>No opportunities found</div>
                  <p style={{ marginBottom:16, fontSize:'0.875rem' }}>Try adjusting your filters or search terms.</p>
                  <button onClick={() => { setCategory('All'); setLocType('All'); setSearch(''); setSearchInput(''); }} className="btn btn-primary">Clear Filters</button>
                </div>
              ) : (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                    {opps.map(opp => {
                      const applied = user && hasApplied(opp);
                      return (
                        <div key={opp._id} style={{ background:'white', border:'1px solid var(--gray-200)', borderRadius:12, overflow:'hidden', display:'flex', flexDirection:'column', transition:'box-shadow 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                          {/* Header strip */}
                          <div style={{ height:6, background:'var(--green)' }} />
                          <div style={{ padding:'16px 16px 12px', flex:1 }}>
                            {/* NGO info + tier */}
                            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
                              <div style={{ width:28, height:28, borderRadius:6, background:'var(--green-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.75rem', color:'var(--green)', flexShrink:0 }}>
                                {opp.ngo?.name?.charAt(0)}
                              </div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--gray-500)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{opp.ngo?.name}</div>
                              </div>
                              <TierBadge tier={opp.ngo?.verificationTier || 0} />
                            </div>

                            <h3 style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--navy)', marginBottom:8, lineHeight:1.3 }}>{opp.title}</h3>
                            <p style={{ fontSize:'0.77rem', color:'var(--gray-500)', lineHeight:1.6, marginBottom:10, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{opp.description}</p>

                            {/* Tags */}
                            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
                              <span style={{ fontSize:'0.65rem', fontWeight:700, background:'var(--green-pale)', color:'var(--green)', padding:'2px 8px', borderRadius:100 }}>{opp.category}</span>
                              <span style={{ fontSize:'0.65rem', fontWeight:600, background:'var(--gray-100)', color:'var(--gray-600)', padding:'2px 8px', borderRadius:100 }}>
                                {LOC_ICONS[opp.locationType]} {opp.locationType}
                              </span>
                              {opp.commitmentType && (
                                <span style={{ fontSize:'0.65rem', fontWeight:600, background:'var(--blue-light)', color:'var(--blue)', padding:'2px 8px', borderRadius:100 }}>
                                  {COMMIT_ICONS[opp.commitmentType]} {opp.commitmentType}
                                </span>
                              )}
                            </div>

                            {/* Details */}
                            <div style={{ fontSize:'0.72rem', color:'var(--gray-500)', display:'flex', flexDirection:'column', gap:3 }}>
                              {opp.location && <span>📍 {opp.location}</span>}
                              {opp.duration  && <span>⏱ {opp.duration}</span>}
                              <span>👥 {opp.volunteersNeeded} volunteer{opp.volunteersNeeded !== 1 ? 's' : ''} needed</span>
                            </div>
                          </div>

                          {/* Benefits */}
                          {opp.benefits?.length > 0 && (
                            <div style={{ padding:'8px 16px', borderTop:'1px solid var(--gray-50)', display:'flex', flexWrap:'wrap', gap:4 }}>
                              {opp.benefits.slice(0,3).map(b => (
                                <span key={b} style={{ fontSize:'0.62rem', fontWeight:600, background:'#EEF2FF', color:'#6366F1', padding:'2px 7px', borderRadius:100 }}>✓ {b}</span>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div style={{ padding:'12px 16px', borderTop:'1px solid var(--gray-100)', display:'flex', gap:8 }}>
                            <Link to={`/opportunities/${opp._id}`} className="btn btn-outline btn-sm" style={{ flex:1, justifyContent:'center', textDecoration:'none', display:'flex', alignItems:'center', fontSize:'0.78rem' }}>
                              View Details
                            </Link>
                            {user?.role === 'volunteer' && (
                              applied ? (
                                <span className="badge badge-green" style={{ padding:'6px 12px', fontSize:'0.75rem' }}>✓ Applied</span>
                              ) : (
                                <button className="btn btn-primary btn-sm" style={{ flex:1, justifyContent:'center', fontSize:'0.78rem' }}
                                  onClick={() => setApplyModal(opp)}>
                                  Apply Now
                                </button>
                              )
                            )}
                            {!user && (
                              <Link to="/login" className="btn btn-primary btn-sm" style={{ flex:1, justifyContent:'center', textDecoration:'none', display:'flex', alignItems:'center', fontSize:'0.78rem' }}>
                                Login to Apply
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {pages > 1 && (
                    <div style={{ display:'flex', justifyContent:'center', gap:6 }}>
                      <button onClick={() => setPage(p => Math.max(1, p-1))} style={{ width:30, height:30, borderRadius:6, border:'1px solid var(--gray-200)', background:'white', cursor:'pointer' }}>←</button>
                      {Array.from({ length: Math.min(pages, 8) }, (_, i) => i+1).map(p => (
                        <button key={p} onClick={() => setPage(p)} style={{ width:30, height:30, borderRadius:6, border:'1px solid', cursor:'pointer', fontWeight:600, fontSize:'0.83rem', borderColor: page===p ? 'var(--green)' : 'var(--gray-200)', background: page===p ? 'var(--green)' : 'white', color: page===p ? 'white' : 'var(--navy)' }}>{p}</button>
                      ))}
                      <button onClick={() => setPage(p => Math.min(pages, p+1))} style={{ width:30, height:30, borderRadius:6, border:'1px solid var(--gray-200)', background:'white', cursor:'pointer' }}>→</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Apply Modal */}
      {applyModal && (
        <div onClick={() => setApplyModal(null)} style={{ position:'fixed', inset:0, background:'rgba(17,24,39,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:16, backdropFilter:'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:16, width:'100%', maxWidth:480, padding:28, boxShadow:'var(--shadow-lg)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <div>
                <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--green)', textTransform:'uppercase', marginBottom:2 }}>Applying to</p>
                <h3 style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--navy)' }}>{applyModal.title}</h3>
                <p style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>{applyModal.ngo?.name}</p>
              </div>
              <button onClick={() => setApplyModal(null)} style={{ background:'var(--gray-100)', border:'none', borderRadius:'50%', width:30, height:30, cursor:'pointer', fontSize:'1.1rem' }}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Why are you a good fit? <span style={{ color:'var(--gray-400)', fontWeight:400 }}>(optional but recommended)</span></label>
              <textarea className="form-input" rows={4} style={{ resize:'vertical' }}
                placeholder="Tell the NGO about your relevant experience, skills, and why you're passionate about this cause..."
                value={applyMsg} onChange={e => setApplyMsg(e.target.value)} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-outline" style={{ flex:1, justifyContent:'center' }} onClick={() => setApplyModal(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={handleApply} disabled={applying === applyModal._id}>
                {applying === applyModal._id ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} /> Submitting...</> : '✅ Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
