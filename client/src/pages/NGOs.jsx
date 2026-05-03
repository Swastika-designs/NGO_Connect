import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ngoAPI } from '../services/api';
import DonateModal from '../components/DonateModal';

const CATEGORIES = ['Education','Healthcare','Environment','Animal Welfare','Disaster Relief',
  'Women Empowerment','Child Welfare','Food & Hunger','Poverty Alleviation',
  'Human Rights','Arts & Culture','Other'];

const CAT_COLORS = {
  Education:'#3B82F6', Healthcare:'#EF4444', Environment:'#10B981',
  'Animal Welfare':'#F59E0B', 'Disaster Relief':'#EF4444', 'Women Empowerment':'#8B5CF6',
  'Child Welfare':'#F97316', 'Food & Hunger':'#10B981', 'Poverty Alleviation':'#6366F1',
  'Human Rights':'#3B82F6', 'Arts & Culture':'#EC4899', Other:'#6B7280',
};

const TIER_INFO = {
  0:{ label:'Unverified', icon:'⚪', color:'var(--gray-500)', bg:'var(--gray-100)', border:'var(--gray-200)' },
  1:{ label:'Bronze',     icon:'🥉', color:'#92400E',         bg:'#FEF2E8',         border:'#FDBA74' },
  2:{ label:'Silver',     icon:'🥈', color:'#475569',         bg:'#F1F5F9',         border:'#CBD5E1' },
  3:{ label:'Gold',       icon:'🏆', color:'#92400E',         bg:'#FEF3C7',         border:'#FCD34D' },
};

function TierBadge({ tier = 0, small = false }) {
  const t = TIER_INFO[tier] || TIER_INFO[0];
  return (
    <span style={{
      fontSize: small ? '0.62rem' : '0.68rem', fontWeight:700,
      padding: small ? '2px 7px' : '3px 9px', borderRadius:100,
      background:t.bg, color:t.color, border:`1px solid ${t.border}`,
      display:'inline-flex', alignItems:'center', gap:3, whiteSpace:'nowrap',
    }}>
      {t.icon} {t.label}
    </span>
  );
}

export default function NGOs() {
  const { user } = useAuth();
  const [ngos,         setNgos]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [total,        setTotal]        = useState(0);
  const [pages,        setPages]        = useState(1);
  const [page,         setPage]         = useState(1);
  const [searchInput,  setSearchInput]  = useState('');
  const [activeSearch, setActiveSearch] = useState(''); // committed search
  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
  const [donating,     setDonating]     = useState(null);
  const firstRender = useRef(true);

  const canDonate = !user || user.role === 'donor';

  // Single fetch function — all filters in state, no URL dependency
  const fetchNGOs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (activeSearch.trim())        params.search   = activeSearch.trim();
      if (selectedCats.length === 1)  params.category = selectedCats[0];
      if (selectedTier !== null)      params.tier     = selectedTier;
      const res = await ngoAPI.getAll(params);
      setNgos(res.data.ngos   || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (e) {
      console.error('Fetch NGOs error:', e);
      setNgos([]);
    } finally { setLoading(false); }
  }, [page, activeSearch, selectedCats, selectedTier]);

  // Run fetch whenever any filter changes
  useEffect(() => { fetchNGOs(); }, [fetchNGOs]);

  // When filters change (not page), reset to page 1
  const prevFilters = useRef({ activeSearch, selectedCats, selectedTier });
  useEffect(() => {
    const p = prevFilters.current;
    if (p.activeSearch !== activeSearch || p.selectedCats !== selectedCats || p.selectedTier !== selectedTier) {
      setPage(1);
      prevFilters.current = { activeSearch, selectedCats, selectedTier };
    }
  }, [activeSearch, selectedCats, selectedTier]);

  const handleSearch = () => { setActiveSearch(searchInput); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  const toggleCat = (cat) => setSelectedCats(prev =>
    prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
  );

  const clearFilters = () => {
    setSelectedCats([]);
    setSelectedTier(null);
    setSearchInput('');
    setActiveSearch('');
    setPage(1);
  };

  const activeFilterCount = selectedCats.length + (selectedTier !== null ? 1 : 0) + (activeSearch ? 1 : 0);

  return (
    <div style={{ paddingTop:64, minHeight:'100vh', background:'var(--gray-50)' }}>
      {/* Header */}
      <div style={{ background:'white', borderBottom:'1px solid var(--gray-200)', padding:'28px 0 20px' }}>
        <div className="container">
          <div style={{ fontSize:'0.8rem', color:'var(--gray-400)', marginBottom:8 }}>
            <Link to="/" style={{ color:'var(--green)' }}>Home</Link> / Explore NGOs
          </div>
          <h1 style={{ fontWeight:800, fontSize:'1.8rem', color:'var(--navy)', marginBottom:4 }}>Explore NGOs</h1>
          <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:18 }}>
            Connect with verified non-profits and make a difference today.
          </p>
          <div style={{ display:'flex', gap:10, maxWidth:680 }}>
            <div style={{ flex:1, position:'relative' }}>
              <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', pointerEvents:'none' }}>🔍</span>
              <input
                className="form-input"
                style={{ paddingLeft:38, height:44, fontSize:'0.9rem' }}
                placeholder="Search by name, city, or cause..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              className="btn btn-primary"
              style={{ height:44, padding:'0 24px' }}
              onClick={handleSearch}
            >
              Search
            </button>
            {activeFilterCount > 0 && (
              <button
                className="btn btn-outline"
                style={{ height:44, padding:'0 16px' }}
                onClick={clearFilters}
              >
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
          {/* Active search tag */}
          {activeSearch && (
            <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>Showing results for:</span>
              <span style={{ background:'var(--green-pale)', color:'var(--green)', border:'1px solid var(--green-light)', padding:'3px 12px', borderRadius:100, fontSize:'0.78rem', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                "{activeSearch}"
                <span onClick={() => { setSearchInput(''); setActiveSearch(''); }} style={{ cursor:'pointer', fontWeight:900 }}>×</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ padding:'24px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'230px 1fr', gap:22, alignItems:'start' }}>

          {/* Filter panel */}
          <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'20px 18px', position:'sticky', top:80 }}>
            <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--navy)', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} style={{ fontSize:'0.72rem', color:'var(--red)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Clear all</button>
              )}
            </div>

            {/* Category */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Cause Area</div>
              {CATEGORIES.map(cat => (
                <label key={cat} style={{ display:'flex', alignItems:'center', gap:9, marginBottom:8, cursor:'pointer', userSelect:'none' }}>
                  <div
                    onClick={() => toggleCat(cat)}
                    style={{
                      width:17, height:17, borderRadius:4, flexShrink:0, cursor:'pointer',
                      border:`2px solid ${selectedCats.includes(cat) ? 'var(--green)' : 'var(--gray-300)'}`,
                      background: selectedCats.includes(cat) ? 'var(--green)' : 'white',
                      display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
                    }}
                  >
                    {selectedCats.includes(cat) && <span style={{ color:'white', fontSize:'0.65rem', fontWeight:900, lineHeight:1 }}>✓</span>}
                  </div>
                  <span style={{ fontSize:'0.84rem', color:'var(--gray-600)', fontWeight: selectedCats.includes(cat) ? 600 : 400 }}>{cat}</span>
                </label>
              ))}
            </div>

            <div className="divider" />

            {/* Tier filter */}
            <div>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Verification Tier</div>
              <div
                onClick={() => setSelectedTier(null)}
                style={{
                  padding:'8px 11px', borderRadius:7, cursor:'pointer', marginBottom:5, transition:'all 0.15s',
                  background: selectedTier === null ? 'var(--navy)' : 'var(--gray-50)',
                  border:`1px solid ${selectedTier === null ? 'var(--navy)' : 'var(--gray-200)'}`,
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                }}
              >
                <span style={{ fontSize:'0.83rem', fontWeight:600, color: selectedTier === null ? 'white' : 'var(--gray-600)' }}>🌐 All Tiers</span>
                {selectedTier === null && <span style={{ color:'var(--green)', fontWeight:700, fontSize:'0.8rem' }}>✓</span>}
              </div>
              {[3,2,1,0].map(tier => {
                const t = TIER_INFO[tier];
                const active = selectedTier === tier;
                return (
                  <div
                    key={tier}
                    onClick={() => setSelectedTier(active ? null : tier)}
                    style={{
                      padding:'8px 11px', borderRadius:7, cursor:'pointer', marginBottom:5, transition:'all 0.15s',
                      background: active ? 'var(--navy)' : 'var(--gray-50)',
                      border:`1px solid ${active ? 'var(--navy)' : 'var(--gray-200)'}`,
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                    }}
                  >
                    <span style={{ fontSize:'0.83rem', fontWeight:600, color: active ? 'white' : 'var(--gray-600)' }}>{t.icon} {t.label}</span>
                    {active && <span style={{ color:'var(--green)', fontWeight:700, fontSize:'0.8rem' }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results */}
          <div>
            {/* Result count */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <span style={{ fontSize:'0.85rem', color:'var(--gray-500)' }}>
                {loading ? 'Searching...' : `${total.toLocaleString()} NGO${total !== 1 ? 's' : ''} found`}
              </span>
              {(selectedCats.length > 0 || selectedTier !== null) && (
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {selectedCats.map(cat => (
                    <span key={cat} style={{ background:'var(--green-pale)', color:'var(--green)', border:'1px solid var(--green-light)', padding:'3px 10px', borderRadius:100, fontSize:'0.74rem', fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                      {cat}
                      <span onClick={() => toggleCat(cat)} style={{ cursor:'pointer', fontWeight:900 }}>×</span>
                    </span>
                  ))}
                  {selectedTier !== null && (
                    <span style={{ background:'var(--gray-100)', color:'var(--gray-600)', border:'1px solid var(--gray-200)', padding:'3px 10px', borderRadius:100, fontSize:'0.74rem', fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                      {TIER_INFO[selectedTier].icon} {TIER_INFO[selectedTier].label}
                      <span onClick={() => setSelectedTier(null)} style={{ cursor:'pointer', fontWeight:900 }}>×</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {Array(4).fill(null).map((_,i) => (
                  <div key={i} style={{ height:260, borderRadius:12, background:'var(--gray-200)', animation:'pulse 1.5s ease infinite' }} />
                ))}
              </div>
            ) : ngos.length === 0 ? (
              <div style={{ textAlign:'center', padding:'72px 40px', background:'white', borderRadius:12, border:'1px solid var(--gray-200)' }}>
                <div style={{ fontSize:'3rem', marginBottom:10 }}>🔍</div>
                <h3 style={{ fontWeight:700, marginBottom:8, color:'var(--navy)' }}>
                  {activeSearch ? `No results for "${activeSearch}"` : 'No NGOs found'}
                </h3>
                <p style={{ color:'var(--gray-500)', marginBottom:18, fontSize:'0.875rem' }}>
                  {activeSearch ? 'Try a different search term or remove some filters.' : 'Try adjusting your filters.'}
                </p>
                <button onClick={clearFilters} className="btn btn-primary">Clear All Filters</button>
              </div>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
                  {ngos.map(ngo => {
                    const catColor = CAT_COLORS[ngo.category] || '#6B7280';
                    return (
                      <div
                        key={ngo._id}
                        style={{ background:'white', border:'1px solid var(--gray-200)', borderRadius:12, overflow:'hidden', display:'flex', flexDirection:'column', transition:'box-shadow 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                      >
                        <div style={{ padding:'18px 18px 12px', display:'flex', gap:12, alignItems:'flex-start' }}>
                          <div style={{ width:48, height:48, borderRadius:10, background:`${catColor}20`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1.1rem', color:catColor, flexShrink:0, overflow:'hidden' }}>
                            {ngo.logo
                              ? <img src={ngo.logo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                              : ngo.name?.charAt(0)}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:6, alignItems:'center' }}>
                              <TierBadge tier={ngo.verificationTier || 0} small />
                              {ngo.isFeatured && (
                                <span style={{ fontSize:'0.62rem', fontWeight:700, background:'#FEF3C7', color:'#92400E', border:'1px solid #FCD34D', padding:'2px 7px', borderRadius:100 }}>
                                  ⭐ Featured
                                </span>
                              )}
                            </div>
                            <h3 style={{ fontWeight:700, fontSize:'1rem', color:'var(--navy)', marginBottom:5, lineHeight:1.25 }}>{ngo.name}</h3>
                            <p style={{ fontSize:'0.78rem', color:'var(--gray-500)', lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                              {ngo.description}
                            </p>
                          </div>
                        </div>
                        <div style={{ padding:'0 18px 12px', display:'flex', gap:10, fontSize:'0.74rem', color:'var(--gray-400)', flexWrap:'wrap', alignItems:'center' }}>
                          <span style={{ background:`${catColor}15`, color:catColor, padding:'2px 9px', borderRadius:100, fontWeight:600, fontSize:'0.68rem' }}>{ngo.category}</span>
                          {ngo.location?.city && <span>📍 {ngo.location.city}{ngo.location.state ? `, ${ngo.location.state}` : ''}</span>}
                          {ngo.donorCount > 0 && <span>👥 {ngo.donorCount.toLocaleString()} donors</span>}
                        </div>
                        <div style={{ padding:'0 18px 18px', display:'flex', gap:8, marginTop:'auto' }}>
                          {canDonate && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ flex:1, justifyContent:'center' }}
                              onClick={() => setDonating(ngo)}
                            >
                              💝 Donate
                            </button>
                          )}
                          <Link
                            to={`/ngos/${ngo._id}`}
                            className="btn btn-outline btn-sm"
                            style={{ flex:1, justifyContent:'center', textDecoration:'none', display:'flex', alignItems:'center' }}
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:6 }}>
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      style={{ width:32, height:32, borderRadius:7, border:'1px solid var(--gray-200)', background:'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}
                    >←</button>
                    {Array.from({ length: Math.min(pages, 8) }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          width:32, height:32, borderRadius:7, border:'1px solid', cursor:'pointer', fontWeight:600, fontSize:'0.83rem',
                          borderColor: page === p ? 'var(--green)' : 'var(--gray-200)',
                          background:  page === p ? 'var(--green)' : 'white',
                          color:       page === p ? 'white' : 'var(--navy)',
                        }}
                      >{p}</button>
                    ))}
                    {pages > 8 && <span style={{ color:'var(--gray-400)' }}>…</span>}
                    <button
                      onClick={() => setPage(p => Math.min(pages, p + 1))}
                      disabled={page === pages}
                      style={{ width:32, height:32, borderRadius:7, border:'1px solid var(--gray-200)', background:'white', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.4 : 1 }}
                    >→</button>
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
