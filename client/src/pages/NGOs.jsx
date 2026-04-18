import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ngoAPI } from '../services/api';
import DonateModal from '../components/DonateModal';

const CATEGORIES = ['Education','Healthcare','Environment','Animal Welfare','Disaster Relief','Women Empowerment','Child Welfare','Food & Hunger','Poverty Alleviation','Human Rights','Arts & Culture','Other'];
const TIERS = ['Gold','Silver','Bronze'];
const LOCATIONS = ['All Locations','India','Africa','Asia','Worldwide','East Africa','South Asia','Amazon Basin'];
const CAT_COLORS = { Education:'#3B82F6', Healthcare:'#EF4444', Environment:'#10B981', 'Animal Welfare':'#F59E0B', 'Disaster Relief':'#EF4444', 'Women Empowerment':'#8B5CF6', 'Child Welfare':'#F97316', 'Food & Hunger':'#10B981', 'Poverty Alleviation':'#6366F1', 'Human Rights':'#3B82F6', 'Arts & Culture':'#EC4899', Other:'#6B7280' };

export default function NGOs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);
  const [donating, setDonating] = useState(null);
  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedTier, setSelectedTier] = useState('Gold');
  const [location, setLocation] = useState('All Locations');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';

  useEffect(() => { if (categoryParam) setSelectedCats([categoryParam]); }, [categoryParam]);

  const fetchNGOs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit:8 };
      if (selectedCats.length === 1) params.category = selectedCats[0];
      if (search) params.search = search;
      const res = await ngoAPI.getAll(params);
      setNgos(res.data.ngos || []);
      setPages(res.data.pages || 1);
    } catch { setNgos([]); } finally { setLoading(false); }
  }, [page, search, selectedCats]);

  useEffect(() => { fetchNGOs(); }, [fetchNGOs]);

  const handleSearch = () => {
    const p = Object.fromEntries(searchParams.entries());
    if (searchInput) p.search = searchInput; else delete p.search;
    p.page = '1';
    setSearchParams(p);
  };

  const toggleCat = (cat) => setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  const clearFilters = () => { setSelectedCats([]); setSelectedTier('Gold'); setLocation('All Locations'); };
  const activeFilters = [...selectedCats];

  return (
    <div style={{ paddingTop:64, minHeight:'100vh', background:'var(--gray-50)' }}>
      {/* Header */}
      <div style={{ background:'white', borderBottom:'1px solid var(--gray-200)', padding:'28px 0 20px' }}>
        <div className="container">
          <p style={{ fontSize:'0.8rem', color:'var(--gray-400)', marginBottom:8 }}>
            <a href="/" style={{ color:'var(--green)' }}>Home</a> / Explore NGOs
          </p>
          <h1 style={{ fontWeight:800, fontSize:'1.8rem', color:'var(--navy)', marginBottom:4 }}>Explore NGOs</h1>
          <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:18 }}>Connect with verified non-profits and make a difference today.</p>
          <div style={{ display:'flex', gap:10, maxWidth:780 }}>
            <div style={{ flex:1, position:'relative' }}>
              <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }}>🔍</span>
              <input className="form-input" style={{ paddingLeft:36, height:44, fontSize:'0.9rem' }}
                placeholder="Search by NGO name or keywords..."
                value={searchInput} onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </div>
            <button className="btn btn-primary" style={{ height:44, padding:'0 24px' }} onClick={handleSearch}>≡ Search</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding:'24px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'230px 1fr', gap:22, alignItems:'start' }}>

          {/* Filter Panel */}
          <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'20px 18px', position:'sticky', top:80 }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontWeight:700, fontSize:'0.875rem', color:'var(--navy)', marginBottom:12 }}>
                <span>⚙</span> Cause
              </div>
              {CATEGORIES.slice(0,6).map(cat => (
                <label key={cat} style={{ display:'flex', alignItems:'center', gap:9, marginBottom:9, cursor:'pointer' }}>
                  <div onClick={() => toggleCat(cat)} style={{
                    width:17, height:17, borderRadius:4, flexShrink:0, cursor:'pointer',
                    border:`2px solid ${selectedCats.includes(cat) ? 'var(--green)' : 'var(--gray-300)'}`,
                    background:selectedCats.includes(cat) ? 'var(--green)' : 'white',
                    display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
                  }}>
                    {selectedCats.includes(cat) && <span style={{ color:'white', fontSize:'0.65rem', fontWeight:900, lineHeight:1 }}>✓</span>}
                  </div>
                  <span style={{ fontSize:'0.85rem', color:'var(--gray-600)', fontWeight:selectedCats.includes(cat)?600:400 }}>{cat}</span>
                </label>
              ))}
            </div>
            <div className="divider" />
            <div style={{ marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontWeight:700, fontSize:'0.875rem', color:'var(--navy)', marginBottom:10 }}>
                <span>📍</span> Location
              </div>
              <select className="form-input" value={location} onChange={e => setLocation(e.target.value)} style={{ fontSize:'0.83rem' }}>
                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="divider" />
            <div style={{ marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontWeight:700, fontSize:'0.875rem', color:'var(--navy)', marginBottom:10 }}>
                <span>✅</span> Verification Tier
              </div>
              {TIERS.map(tier => {
                const icons = { Gold:'🏆', Silver:'🥈', Bronze:'🥉' };
                const active = selectedTier === tier;
                return (
                  <div key={tier} onClick={() => setSelectedTier(tier)} style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'8px 12px', borderRadius:7, marginBottom:5, cursor:'pointer',
                    background:active ? 'var(--navy)' : 'var(--gray-50)',
                    border:`1px solid ${active ? 'var(--navy)' : 'var(--gray-200)'}`, transition:'all 0.15s',
                  }}>
                    <span style={{ fontSize:'0.83rem', fontWeight:600, color:active ? 'white' : 'var(--gray-600)' }}>{icons[tier]} {tier}</span>
                    {active && <span style={{ color:'var(--green)', fontWeight:700 }}>✓</span>}
                  </div>
                );
              })}
            </div>
            <button onClick={clearFilters} className="btn btn-outline btn-sm" style={{ width:'100%', justifyContent:'center' }}>Clear Filters</button>
          </div>

          {/* Results */}
          <div>
            {/* Active filters */}
            {activeFilters.length > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ display:'flex', gap:7, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>Active filters:</span>
                  {activeFilters.map(f => (
                    <span key={f} style={{ background:'var(--green-pale)', color:'var(--green-dark)', border:'1px solid var(--green-light)', padding:'3px 10px', borderRadius:100, fontSize:'0.75rem', fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                      {f} <span style={{ cursor:'pointer', fontWeight:900 }} onClick={() => setSelectedCats(p => p.filter(c => c !== f))}>×</span>
                    </span>
                  ))}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:'0.83rem', color:'var(--gray-500)' }}>
                  Sort by: <select style={{ border:'1px solid var(--gray-200)', borderRadius:6, padding:'4px 8px', fontSize:'0.8rem', color:'var(--navy)', fontWeight:600, background:'white', outline:'none', cursor:'pointer' }}>
                    <option>Relevance</option><option>Most Supported</option><option>Newest</option>
                  </select>
                </div>
              </div>
            )}

            {loading ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {Array(4).fill(null).map((_,i) => <div key={i} style={{ height:260, borderRadius:12, background:'var(--gray-200)' }} />)}
              </div>
            ) : ngos.length === 0 ? (
              <div style={{ textAlign:'center', padding:'72px 40px', background:'white', borderRadius:12, border:'1px solid var(--gray-200)' }}>
                <div style={{ fontSize:'3rem', marginBottom:10 }}>{selectedCats.length > 0 || search ? '🔍' : '🌱'}</div>
                <h3 style={{ fontWeight:700, marginBottom:8 }}>{selectedCats.length > 0 || search ? 'No NGOs found' : 'No NGOs registered yet'}</h3>
                <p style={{ color:'var(--gray-500)', marginBottom:18 }}>
                  {selectedCats.length > 0 || search ? 'Try adjusting your filters.' : 'No NGOs found. Be the first to register.'}
                </p>
                {selectedCats.length > 0 || search ? (
                  <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
                ) : (
                  <a href="/dashboard/create-ngo" className="btn btn-primary">Register Your NGO →</a>
                )}
              </div>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
                  {ngos.map(ngo => {
                    const catColor = CAT_COLORS[ngo.category] || '#6B7280';
                    return (
                      <div key={ngo._id} style={{ background:'white', border:'1px solid var(--gray-200)', borderRadius:12, overflow:'hidden', display:'flex', flexDirection:'column', transition:'box-shadow 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow-md)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
                        <div style={{ padding:'18px 18px 14px', display:'flex', gap:12, alignItems:'flex-start' }}>
                          <div style={{ width:46, height:46, borderRadius:10, background:`${catColor}20`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1rem', color:catColor, flexShrink:0 }}>
                            {ngo.name?.charAt(0)}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            {ngo.isFeatured && (
                              <span style={{ fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.04em', background:'#FEF3C7', color:'#92400E', border:'1px solid #FCD34D', padding:'2px 7px', borderRadius:100, display:'inline-block', marginBottom:5 }}>🏆 GOLD TIER</span>
                            )}
                            {!ngo.isFeatured && ngo.isVerified && (
                              <span style={{ fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.04em', background:'#F1F5F9', color:'#475569', border:'1px solid #CBD5E1', padding:'2px 7px', borderRadius:100, display:'inline-block', marginBottom:5 }}>🥈 SILVER TIER</span>
                            )}
                            <h3 style={{ fontWeight:700, fontSize:'1rem', color:'var(--navy)', marginBottom:5, lineHeight:1.25 }}>{ngo.name}</h3>
                            <p style={{ fontSize:'0.78rem', color:'var(--gray-500)', lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{ngo.description}</p>
                          </div>
                        </div>
                        <div style={{ padding:'0 18px', display:'flex', gap:14, fontSize:'0.75rem', color:'var(--gray-400)', marginBottom:14 }}>
                          {ngo.location?.city && <span>📍 {ngo.location.city}</span>}
                          {ngo.donorCount > 0 && <span>👥 {ngo.donorCount.toLocaleString()} Supporters</span>}
                        </div>
                        <div style={{ padding:'0 18px 18px', display:'flex', gap:8, marginTop:'auto' }}>
                          <button className="btn btn-primary btn-sm" style={{ flex:1, justifyContent:'center' }} onClick={() => setDonating(ngo)}>Donate</button>
                          <a href={`/ngos/${ngo._id}`} className="btn btn-outline btn-sm" style={{ flex:1, justifyContent:'center', textDecoration:'none', display:'flex', alignItems:'center' }}>
                            View Profile
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:6 }}>
                    <button onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page:Math.max(1, page-1) })}
                      style={{ width:30, height:30, borderRadius:6, border:'1px solid var(--gray-200)', background:'white', cursor:'pointer' }}>←</button>
                    {Array.from({ length:Math.min(pages,8) }, (_,i) => i+1).map(p => (
                      <button key={p} onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page:p })}
                        style={{ width:30, height:30, borderRadius:6, border:'1px solid', cursor:'pointer', fontWeight:600, fontSize:'0.83rem',
                          borderColor:page===p ? 'var(--green)' : 'var(--gray-200)',
                          background:page===p ? 'var(--green)' : 'white',
                          color:page===p ? 'white' : 'var(--navy)',
                        }}>{p}</button>
                    ))}
                    {pages > 8 && <span style={{ color:'var(--gray-400)' }}>...</span>}
                    <button onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page:Math.min(pages, page+1) })}
                      style={{ width:30, height:30, borderRadius:6, border:'1px solid var(--gray-200)', background:'white', cursor:'pointer' }}>→</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {donating && <DonateModal ngo={donating} onClose={() => setDonating(null)} onSuccess={() => {}} />}
    </div>
  );
}
