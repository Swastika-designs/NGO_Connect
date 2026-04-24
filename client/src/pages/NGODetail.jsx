import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ngoAPI, donationAPI } from '../services/api';
import DonateModal from '../components/DonateModal';

const CAT_COLORS = { Education:'#3B82F6', Healthcare:'#EF4444', Environment:'#10B981', 'Animal Welfare':'#F59E0B', 'Disaster Relief':'#EF4444', 'Women Empowerment':'#8B5CF6', 'Child Welfare':'#F97316', 'Food & Hunger':'#10B981', Other:'#6B7280' };

const TIER_INFO = {
  0: { label:'Unverified', icon:'⚪', color:'var(--gray-500)', bg:'var(--gray-100)', border:'var(--gray-200)' },
  1: { label:'Bronze', icon:'🥉', color:'#92400E', bg:'#FEF2E8', border:'#FDBA74' },
  2: { label:'Silver', icon:'🥈', color:'#475569', bg:'#F1F5F9', border:'#CBD5E1' },
  3: { label:'Gold', icon:'🏆', color:'#92400E', bg:'#FEF3C7', border:'#FCD34D' },
};

const ALL_SKILLS = ['Teaching','Design','Medical','Technical','Admin','Physical Labor','Communication'];
const ALL_AVAIL  = ['Weekdays','Weekends','Evenings'];

export default function NGODetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [ngo, setNgo] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donateOpen, setDonateOpen] = useState(false);
  const [interestOpen, setInterestOpen] = useState(false);
  const [interestForm, setInterestForm] = useState({ message:'', skills:[], availability:[] });
  const [submittingInterest, setSubmittingInterest] = useState(false);
  const [interestSubmitted, setInterestSubmitted] = useState(false);

  const isNgoOrAdmin = user && (user.role === 'ngo' || user.role === 'admin');
  const isVolunteer  = user && user.role === 'volunteer';
  const canDonate    = !user || user.role === 'donor';

  const load = () => Promise.all([ngoAPI.getOne(id), donationAPI.getNGODonations(id)])
    .then(([n, d]) => { setNgo(n.data.ngo); setDonations(d.data.donations || []); })
    .catch(() => toast.error('Failed to load NGO'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (user?.role === 'volunteer') {
      setInterestForm(f => ({ ...f, skills: user.skills || [], availability: user.availability || [] }));
    }
  }, [user]);

  const handleInterestSubmit = async (e) => {
    e.preventDefault();
    setSubmittingInterest(true);
    try {
      await ngoAPI.expressInterest(id, interestForm);
      toast.success('Volunteer application submitted! The NGO will be in touch. ✅');
      setInterestOpen(false);
      setInterestSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmittingInterest(false); }
  };

  const toggleSkill = s => setInterestForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x=>x!==s) : [...f.skills,s] }));
  const toggleAvail = a => setInterestForm(f => ({ ...f, availability: f.availability.includes(a) ? f.availability.filter(x=>x!==a) : [...f.availability,a] }));

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'80vh' }}><span className="spinner" style={{ width:40, height:40 }} /></div>;
  if (!ngo) return <div style={{ textAlign:'center', padding:'120px 24px' }}><h2>NGO not found</h2><Link to="/ngos" className="btn btn-primary" style={{ marginTop:16 }}>← Back</Link></div>;

  const catColor = CAT_COLORS[ngo.category] || '#6B7280';
  const fmtCur   = n => `₹${Number(n).toLocaleString('en-IN')}`;
  const tier     = TIER_INFO[ngo.verificationTier || 0];

  return (
    <div className="page-enter" style={{ paddingTop:64, background:'var(--gray-50)', minHeight:'100vh' }}>
      {/* Cover */}
      <div style={{ height:240, background:ngo.coverImage ? `url(${ngo.coverImage}) center/cover no-repeat` : `linear-gradient(135deg, ${catColor}22, ${catColor}55)`, position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'rgba(17,24,39,0.35)' }} />
      </div>

      <div className="container" style={{ position:'relative', marginTop:-64 }}>
        {/* Header card */}
        <div style={{ background:'white', borderRadius:16, padding:'24px 28px', boxShadow:'var(--shadow-lg)', marginBottom:24, display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap', border:'1px solid var(--gray-200)' }}>
          <div style={{ width:80, height:80, borderRadius:14, flexShrink:0, border:'3px solid white', boxShadow:'var(--shadow-md)',
            background:ngo.logo ? `url(${ngo.logo}) center/cover` : catColor,
            display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'2rem' }}>
            {!ngo.logo && ngo.name?.charAt(0)}
          </div>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ display:'flex', gap:7, marginBottom:8, flexWrap:'wrap', alignItems:'center' }}>
              <span className="badge badge-green">{ngo.category}</span>
              {/* Verification tier badge */}
              <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'3px 10px', borderRadius:100, background:tier.bg, color:tier.color, border:`1px solid ${tier.border}` }}>
                {tier.icon} {tier.label} Tier
              </span>
              {ngo.isFeatured && <span className="badge" style={{ background:'#FEF3C7', color:'#92400E', border:'1px solid #FCD34D' }}>Featured</span>}
            </div>
            <h1 style={{ fontWeight:800, fontSize:'clamp(1.4rem,3vw,2rem)', color:'var(--navy)', marginBottom:6 }}>{ngo.name}</h1>
            {ngo.location?.city && <p style={{ color:'var(--gray-500)', fontSize:'0.875rem' }}>📍 {[ngo.location.city, ngo.location.state, ngo.location.country].filter(Boolean).join(', ')}</p>}
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', flexShrink:0, alignItems:'center' }}>
            {/* Message button — any logged-in user can message the NGO owner */}
            {user && ngo.createdBy?._id && user._id !== ngo.createdBy._id && (
              <button className="btn btn-outline" onClick={() => navigate(`/dashboard/messages/${ngo.createdBy._id}`)} style={{ padding:'10px 20px' }}>
                💬 Message
              </button>
            )}
            {canDonate && (
              <button className="btn btn-primary" onClick={() => setDonateOpen(true)} style={{ padding:'12px 28px' }}>
                💝 Donate Now
              </button>
            )}
            {isVolunteer && (
              interestSubmitted ? (
                <span className="badge badge-green" style={{ padding:'10px 16px', fontSize:'0.85rem' }}>✓ Applied</span>
              ) : (
                <button className="btn btn-outline" onClick={() => setInterestOpen(true)} style={{ padding:'12px 24px' }}>
                  ✋ Apply to Volunteer
                </button>
              )
            )}
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:22, alignItems:'start' }}>
          <div>
            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
              {[
                { label:'Total Raised', value:fmtCur(ngo.totalDonations||0), icon:'💰' },
                { label:'Donors', value:(ngo.donorCount||0).toLocaleString(), icon:'👥' },
                { label:'Beneficiaries', value:(ngo.beneficiaryCount||0).toLocaleString(), icon:'🤝' },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding:'18px', textAlign:'center' }}>
                  <div style={{ fontSize:'1.4rem', marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--green)', lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--gray-500)', marginTop:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* About */}
            <div className="card" style={{ padding:'22px 24px', marginBottom:20 }}>
              <h2 style={{ fontWeight:700, fontSize:'1.05rem', color:'var(--navy)', marginBottom:14 }}>About</h2>
              <p style={{ color:'var(--gray-600)', lineHeight:1.8, fontSize:'0.9rem', whiteSpace:'pre-wrap' }}>{ngo.description}</p>
              {ngo.mission && <>
                <h3 style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--navy)', margin:'18px 0 8px' }}>Mission</h3>
                <p style={{ color:'var(--gray-600)', lineHeight:1.8, fontSize:'0.9rem' }}>{ngo.mission}</p>
              </>}
            </div>

            {/* Donors — hidden for ngo/admin */}
            {!isNgoOrAdmin && (
              <div className="card" style={{ padding:'22px 24px' }}>
                <h2 style={{ fontWeight:700, fontSize:'1.05rem', color:'var(--navy)', marginBottom:16 }}>Recent Donors ({donations.length})</h2>
                {donations.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'32px 0' }}>
                    <div style={{ fontSize:'2.5rem', marginBottom:8 }}>💝</div>
                    <p style={{ color:'var(--gray-500)', marginBottom:16 }}>Be the first to donate!</p>
                    {canDonate && <button className="btn btn-primary" onClick={() => setDonateOpen(true)}>Donate Now</button>}
                  </div>
                ) : donations.slice(0,8).map(d => (
                  <div key={d._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--gray-100)' }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--green-pale)', border:'2px solid var(--green-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'var(--green)', flexShrink:0 }}>
                      {d.isAnonymous ? '?' : d.donor?.name?.charAt(0) || '?'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{d.isAnonymous ? 'Anonymous' : (d.donor?.name || 'Anonymous')}</div>
                      {d.message && <div style={{ fontSize:'0.78rem', color:'var(--gray-500)', fontStyle:'italic' }}>"{d.message}"</div>}
                    </div>
                    <div style={{ fontWeight:800, color:'var(--green)', fontSize:'0.95rem' }}>{fmtCur(d.amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Tier card */}
            <div className="card" style={{ padding:'18px 20px', background:tier.bg, border:`1px solid ${tier.border}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:'1.8rem' }}>{tier.icon}</span>
                <div>
                  <div style={{ fontWeight:700, color:tier.color, fontSize:'0.95rem' }}>{tier.label} Verified</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--gray-500)', marginTop:2 }}>
                    {ngo.verificationTier === 3 ? 'Fully verified — all documents approved' :
                     ngo.verificationTier === 2 ? 'Partially verified — core docs checked' :
                     ngo.verificationTier === 1 ? 'Basic verification complete' : 'Pending admin review'}
                  </div>
                </div>
              </div>
              {(ngo.documents||[]).filter(d => d.verified).length > 0 && (
                <div style={{ marginTop:10, fontSize:'0.75rem', color:'var(--gray-600)' }}>
                  ✅ {(ngo.documents||[]).filter(d => d.verified).length} document{(ngo.documents||[]).filter(d=>d.verified).length!==1?'s':''} verified
                </div>
              )}
            </div>

            {(ngo.contact?.email || ngo.contact?.phone || ngo.contact?.website) && (
              <div className="card" style={{ padding:'18px 20px' }}>
                <h3 style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--navy)', marginBottom:14 }}>Contact</h3>
                {ngo.contact.email && <p style={{ fontSize:'0.875rem', marginBottom:8, color:'var(--gray-600)' }}>✉️ {ngo.contact.email}</p>}
                {ngo.contact.phone && <p style={{ fontSize:'0.875rem', marginBottom:8, color:'var(--gray-600)' }}>📞 {ngo.contact.phone}</p>}
                {ngo.contact.website && <a href={ngo.contact.website} target="_blank" rel="noreferrer" style={{ fontSize:'0.875rem', color:'var(--green)', fontWeight:600 }}>🌐 Visit Website</a>}
                {/* Social links */}
                {(ngo.socialMedia?.facebook || ngo.socialMedia?.twitter || ngo.socialMedia?.instagram || ngo.socialMedia?.linkedin) && (
                  <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
                    {ngo.socialMedia.facebook && <a href={ngo.socialMedia.facebook} target="_blank" rel="noreferrer" style={{ fontSize:'0.75rem', color:'var(--blue)', fontWeight:600 }}>📘 FB</a>}
                    {ngo.socialMedia.twitter && <a href={ngo.socialMedia.twitter} target="_blank" rel="noreferrer" style={{ fontSize:'0.75rem', color:'var(--blue)', fontWeight:600 }}>🐦 TW</a>}
                    {ngo.socialMedia.instagram && <a href={ngo.socialMedia.instagram} target="_blank" rel="noreferrer" style={{ fontSize:'0.75rem', color:'var(--purple)', fontWeight:600 }}>📸 IG</a>}
                    {ngo.socialMedia.linkedin && <a href={ngo.socialMedia.linkedin} target="_blank" rel="noreferrer" style={{ fontSize:'0.75rem', color:'var(--blue)', fontWeight:600 }}>💼 LI</a>}
                  </div>
                )}
              </div>
            )}

            <div className="card" style={{ padding:'18px 20px' }}>
              <h3 style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--navy)', marginBottom:14 }}>Details</h3>
              {[
                ngo.foundedYear && ['Founded', ngo.foundedYear],
                ngo.registrationNumber && ['Reg. No.', ngo.registrationNumber],
                ngo.location?.country && ['Country', ngo.location.country],
                ngo.volunteerCount && ['Volunteers', ngo.volunteerCount.toLocaleString()],
              ].filter(Boolean).map(([label, value]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:'0.875rem' }}>
                  <span style={{ color:'var(--gray-500)' }}>{label}</span>
                  <span style={{ fontWeight:600, color:'var(--navy)' }}>{value}</span>
                </div>
              ))}
            </div>

            {ngo.tags?.length > 0 && (
              <div className="card" style={{ padding:'18px 20px' }}>
                <h3 style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--navy)', marginBottom:12 }}>Tags</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                  {ngo.tags.map(t => <span key={t} className="badge badge-gray" style={{ fontSize:'0.75rem' }}>#{t}</span>)}
                </div>
              </div>
            )}

            {canDonate && <button className="btn btn-primary" onClick={() => setDonateOpen(true)} style={{ width:'100%', justifyContent:'center', padding:14 }}>💝 Support This NGO</button>}
            {isVolunteer && !interestSubmitted && <button className="btn btn-outline" onClick={() => setInterestOpen(true)} style={{ width:'100%', justifyContent:'center', padding:14 }}>✋ Apply to Volunteer</button>}
            {user && ngo.createdBy?._id && user._id !== ngo.createdBy._id && (
              <button className="btn btn-outline" onClick={() => navigate(`/dashboard/messages/${ngo.createdBy._id}`)} style={{ width:'100%', justifyContent:'center', padding:12 }}>💬 Message This NGO</button>
            )}
            {isNgoOrAdmin && (
              <div style={{ background:'var(--gray-100)', borderRadius:10, padding:'12px 16px', textAlign:'center' }}>
                <p style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>NGO/Admin accounts cannot donate or apply as volunteers.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ height:48 }} />

      {donateOpen && <DonateModal ngo={ngo} onClose={() => setDonateOpen(false)} onSuccess={load} />}

      {/* Volunteer Interest Modal */}
      {interestOpen && (
        <div onClick={() => setInterestOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(17,24,39,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:16, backdropFilter:'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:16, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto', boxShadow:'var(--shadow-lg)' }}>
            <div style={{ padding:'22px 24px', borderBottom:'1px solid var(--gray-200)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.08em', color:'var(--green)', textTransform:'uppercase', marginBottom:2 }}>Volunteering with</p>
                <h2 style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--navy)' }}>{ngo.name}</h2>
              </div>
              <button onClick={() => setInterestOpen(false)} style={{ background:'var(--gray-100)', border:'none', borderRadius:'50%', width:30, height:30, fontSize:'1.1rem', cursor:'pointer' }}>×</button>
            </div>
            <form onSubmit={handleInterestSubmit} style={{ padding:24 }}>
              <div className="form-group">
                <label className="form-label">Why do you want to volunteer here? <span style={{ color:'var(--red)' }}>*</span></label>
                <textarea className="form-input" rows={4} required placeholder="Tell the NGO about your motivation..." value={interestForm.message} onChange={e => setInterestForm(f => ({ ...f, message:e.target.value }))} style={{ resize:'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Skills you bring</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {ALL_SKILLS.map(s => (
                    <button key={s} type="button" onClick={() => toggleSkill(s)} style={{
                      padding:'6px 12px', borderRadius:100, border:'1.5px solid', cursor:'pointer', fontWeight:600, fontSize:'0.8rem', transition:'all 0.15s',
                      borderColor: interestForm.skills.includes(s) ? 'var(--green)' : 'var(--gray-200)',
                      background: interestForm.skills.includes(s) ? 'var(--green-pale)' : 'white',
                      color: interestForm.skills.includes(s) ? 'var(--green)' : 'var(--gray-600)',
                    }}>{interestForm.skills.includes(s) ? '✓ ' : ''}{s}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Availability</label>
                <div style={{ display:'flex', gap:14 }}>
                  {ALL_AVAIL.map(a => (
                    <label key={a} style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer', fontSize:'0.875rem', fontWeight:500 }}>
                      <input type="checkbox" checked={interestForm.availability.includes(a)} onChange={() => toggleAvail(a)} style={{ accentColor:'var(--green)', width:15, height:15 }} />
                      {a}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submittingInterest} style={{ width:'100%', justifyContent:'center', padding:14, marginTop:8 }}>
                {submittingInterest ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} /> Submitting...</> : '✋ Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
