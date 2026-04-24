import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { eventAPI, opportunityAPI, feedbackAPI } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';

const LINKS = [
  { to:'/dashboard',          label:'Dashboard',          icon:'dashboard'     },
  { to:'/ngos',               label:'Browse NGOs',        icon:'ngos'          },
  { to:'/opportunities',      label:'Find Opportunities', icon:'applications'  },
  { to:'/dashboard/messages', label:'Messages',           icon:'feedback'      },
  { to:'/dashboard/profile',  label:'Profile',            icon:'profile'       },
  { divider:true },
  { to:'#', label:'Settings', icon:'settings' },
];

const CAT_BG = {
  Environment:'#D1FAE5', Education:'#FEF3C7', Healthcare:'#DBEAFE',
  'Food & Hunger':'#FCE7F3', Other:'#F3F4F6',
};

const STATUS_STYLES = {
  pending:  { bg:'#FEF3C7', color:'#92400E', label:'⏳ Pending'  },
  accepted: { bg:'#D1FAE5', color:'#065F46', label:'✅ Accepted' },
  rejected: { bg:'#FEE2E2', color:'#991B1B', label:'❌ Rejected' },
};

const COMMIT_ICONS = { 'one-time':'📅', 'recurring':'🔄', 'flexible':'🕐' };

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const toast    = useToast();

  const [events,       setEvents]       = useState([]);
  const [myAppOpps,    setMyAppOpps]    = useState([]);
  const [myApps,       setMyApps]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [applying,     setApplying]     = useState(null);
  const [activeTab,    setActiveTab]    = useState('events');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const loadData = async () => {
    try {
      const [evRes, oppRes] = await Promise.all([
        eventAPI.getAll({ limit:20, status:'published' }),
        opportunityAPI.getMyApplications().catch(() => ({ data:{ applications:[] } })),
      ]);
      const allEvents = evRes.data.events || [];
      setEvents(allEvents.slice(0,6));
      const applied = allEvents.filter(ev => ev.applicants?.some(a => (typeof a === 'object' ? a._id : a) === user._id));
      // For each applied event, try to fetch my attendance record
      const appsWithAttendance = await Promise.all(applied.map(async ev => {
        try {
          const ngoId = ev.createdBy?._id || ev.ngo;
          if (!ngoId) return ev;
          const attRes = await import('../services/api').then(m => m.ngoAPI.getMyAttendance(ngoId, ev._id));
          return { ...ev, _attendance: attRes.data.record || null };
        } catch { return ev; }
      }));
      setMyApps(appsWithAttendance);
      setMyAppOpps(oppRes.data.applications || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleApply = async (eventId) => {
    setApplying(eventId);
    try {
      await eventAPI.apply(eventId);
      toast.success('Application submitted! 🎉');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally { setApplying(null); }
  };

  const hasApplied = (ev) => ev.applicants?.some(a => (typeof a === 'object' ? a._id : a) === user._id);

  const topRight = (
    <>
      <div style={{ position:'relative' }}>
        <input placeholder="Find opportunities..." className="form-input" style={{ width:210, padding:'7px 12px 7px 30px', fontSize:'0.82rem' }} readOnly onClick={() => window.location.href='/opportunities'} />
        <span style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', fontSize:'0.8rem' }}>🔍</span>
      </div>
      <span>🔔</span>
      <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'white', fontSize:'0.85rem' }}>{user?.name?.charAt(0)}</div>
    </>
  );

  const TabBtn = ({ id, label, count }) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding:'8px 16px', borderRadius:7, border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.85rem',
      background: activeTab === id ? 'var(--navy)' : 'transparent',
      color:      activeTab === id ? 'white' : 'var(--gray-500)',
    }}>
      {label}{count > 0 ? ` (${count})` : ''}
    </button>
  );

  return (
    <SidebarLayout links={LINKS} subLabel="Volunteer Portal" topRight={topRight}>
      <div className="page-enter">
        <h1 style={{ fontWeight:800, fontSize:'1.35rem', color:'var(--navy)', marginBottom:4 }}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:20 }}>Find opportunities, apply, and track your impact.</p>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          {[
            { label:'Event Applications', value: loading ? '—' : myApps.length, icon:'📋', c:'var(--blue)' },
            { label:'Opp. Applications', value: loading ? '—' : myAppOpps.length, icon:'✋', c:'var(--green)' },
            { label:'Accepted', value: loading ? '—' : myAppOpps.filter(a => a.application?.status === 'accepted').length, icon:'✅', c:'var(--green)' },
            { label:'NGOs Engaged', value: loading ? '—' : new Set([...myApps.map(ev => ev.createdBy?._id), ...myAppOpps.map(a => a.ngo?._id)]).size, icon:'⭐', c:'var(--yellow)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ width:36, height:36, borderRadius:9, background:`${s.c}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:'0.7rem', color:'var(--gray-500)', marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 270px', gap:18, alignItems:'start' }}>
          <div>
            {/* Tab navigation */}
            <div style={{ display:'flex', gap:4, background:'var(--gray-100)', borderRadius:9, padding:4, marginBottom:18, width:'fit-content' }}>
              <TabBtn id="events"  label="Events"        count={events.length} />
              <TabBtn id="opps"    label="Opportunities" count={0} />
              <TabBtn id="myApps" label="My Applications" count={myApps.length + myAppOpps.length} />
            </div>

            {/* Tab: Events */}
            {activeTab === 'events' && (
              <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 20px', marginBottom:18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem' }}>Available Events</div>
                  <Link to="/ngos" style={{ fontSize:'0.78rem', color:'var(--green)', fontWeight:600, textDecoration:'none' }}>Browse NGOs →</Link>
                </div>
                {loading ? (
                  <div style={{ textAlign:'center', padding:24 }}><span className="spinner" /></div>
                ) : events.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'32px 0' }}>
                    <div style={{ fontSize:'2rem', marginBottom:8 }}>🌱</div>
                    <p style={{ color:'var(--gray-500)' }}>No events yet. Check back soon!</p>
                  </div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {events.map(ev => (
                      <div key={ev._id} style={{ border:'1px solid var(--gray-200)', borderRadius:9, overflow:'hidden' }}>
                        <div style={{ height:70, background: CAT_BG[ev.category] || CAT_BG.Other, display:'flex', alignItems:'flex-start', padding:9 }}>
                          <span style={{ fontSize:'0.63rem', fontWeight:700, letterSpacing:'0.06em', background:'rgba(0,0,0,0.14)', color:'white', padding:'2px 8px', borderRadius:100 }}>{ev.category?.toUpperCase()}</span>
                        </div>
                        <div style={{ padding:'11px 13px' }}>
                          <div style={{ fontWeight:700, fontSize:'0.85rem', color:'var(--navy)', marginBottom:3 }}>{ev.title}</div>
                          <div style={{ fontSize:'0.72rem', color:'var(--gray-500)', marginBottom:7, display:'flex', alignItems:'center', gap:4 }}>
                            📅 {ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short' }) : 'TBD'}
                            {ev.time ? ` · ${ev.time}` : ''}
                          </div>
                          <div style={{ display:'flex', gap:4, marginBottom:8, flexWrap:'wrap' }}>
                            {(ev.requiredSkills || []).slice(0,2).map(s => (
                              <span key={s} className="badge badge-gray" style={{ fontSize:'0.63rem' }}>{s}</span>
                            ))}
                          </div>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <span style={{ fontSize:'0.7rem', color:'var(--gray-500)' }}>{ev.createdBy?.name || 'NGO'}</span>
                            {hasApplied(ev) ? (
                              <span className="badge badge-green" style={{ fontSize:'0.7rem' }}>✓ Applied</span>
                            ) : (
                              <button className="btn btn-dark btn-sm" style={{ fontSize:'0.7rem', padding:'5px 11px' }}
                                disabled={applying === ev._id} onClick={() => handleApply(ev._id)}>
                                {applying === ev._id ? '...' : 'Quick Apply'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Opportunities listing */}
            {activeTab === 'opps' && (
              <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem' }}>Volunteer Opportunities</div>
                  <Link to="/opportunities" style={{ fontSize:'0.78rem', color:'var(--green)', fontWeight:600, textDecoration:'none' }}>Browse All →</Link>
                </div>
                <div style={{ textAlign:'center', padding:'40px 0', color:'var(--gray-400)' }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:12 }}>🎯</div>
                  <div style={{ fontWeight:700, color:'var(--navy)', marginBottom:8 }}>Find your next opportunity</div>
                  <p style={{ fontSize:'0.875rem', marginBottom:18 }}>Browse volunteer opportunities from verified NGOs across India.</p>
                  <Link to="/opportunities" className="btn btn-primary">Browse Opportunities →</Link>
                </div>
              </div>
            )}

            {/* Tab: My Applications */}
            {activeTab === 'myApps' && (
              <div>
                {/* Event applications */}
                {myApps.length > 0 && (
                  <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 20px', marginBottom:16 }}>
                    <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem', marginBottom:14 }}>Event Applications</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {myApps.map(ev => {
                        const att = ev._attendance;
                        let attBadge = null;
                        if (att) {
                          if (att.status === 'present') attBadge = { label:'✅ Attended', bg:'#D1FAE5', color:'#065F46' };
                          else if (att.status === 'absent') attBadge = { label:'⚠️ Absent', bg:'#FEF3C7', color:'#92400E' };
                          else if (att.status === 'no-show' && att.priorCommunication) attBadge = { label:'📩 Excused Absence', bg:'#DBEAFE', color:'#1D4ED8' };
                          else if (att.status === 'no-show') attBadge = { label:'🚫 No-show (flagged)', bg:'#FEE2E2', color:'#991B1B' };
                        }
                        return (
                          <div key={ev._id} style={{ border:'1px solid var(--gray-200)', borderRadius:9, padding:'12px 14px' }}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--navy)', marginBottom:2 }}>{ev.title}</div>
                                <div style={{ fontSize:'0.75rem', color:'var(--gray-500)', display:'flex', gap:8 }}>
                                  <span>{ev.createdBy?.name || '—'}</span>
                                  {ev.date && <span>📅 {new Date(ev.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>}
                                </div>
                              </div>
                              <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
                                {attBadge ? (
                                  <span style={{ fontSize:'0.72rem', fontWeight:700, padding:'4px 10px', borderRadius:100, background:attBadge.bg, color:attBadge.color }}>{attBadge.label}</span>
                                ) : (
                                  <span className="badge badge-yellow" style={{ fontSize:'0.72rem' }}>● Under Review</span>
                                )}
                              </div>
                            </div>
                            {att?.note && (
                              <div style={{ marginTop:8, fontSize:'0.75rem', color:'var(--gray-500)', fontStyle:'italic', background:'var(--gray-50)', borderRadius:6, padding:'6px 10px' }}>
                                📝 Note from NGO: "{att.note}"
                              </div>
                            )}
                            {att?.status === 'no-show' && !att?.priorCommunication && (
                              <div style={{ marginTop:8, fontSize:'0.75rem', color:'#991B1B', background:'#FEE2E2', borderRadius:6, padding:'6px 10px' }}>
                                ⚠️ You were marked as a no-show for this event. If you believe this is incorrect, please contact the NGO.
                              </div>
                            )}
                            {att?.status === 'no-show' && att?.priorCommunication && (
                              <div style={{ marginTop:8, fontSize:'0.75rem', color:'#1D4ED8', background:'#DBEAFE', borderRadius:6, padding:'6px 10px' }}>
                                ℹ️ Your absence was excused — the NGO noted prior communication and will not flag this.
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Opportunity applications */}
                {myAppOpps.length > 0 && (
                  <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 20px', marginBottom:16 }}>
                    <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem', marginBottom:14 }}>Opportunity Applications</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {myAppOpps.map(item => {
                        const s = STATUS_STYLES[item.application?.status || 'pending'];
                        return (
                          <div key={item._id} style={{ border:'1px solid var(--gray-200)', borderRadius:9, padding:'14px 16px', display:'flex', alignItems:'center', gap:14 }}>
                            <div style={{ width:40, height:40, borderRadius:9, background:'var(--green-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'var(--green)', fontSize:'0.9rem', flexShrink:0 }}>
                              {item.ngo?.name?.charAt(0)}
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--navy)', marginBottom:2 }}>{item.title}</div>
                              <div style={{ fontSize:'0.75rem', color:'var(--gray-500)', display:'flex', gap:8, flexWrap:'wrap' }}>
                                <span>{item.ngo?.name}</span>
                                {item.locationType && <span>{item.locationType === 'Remote' ? '💻 Remote' : `📍 ${item.location || item.locationType}`}</span>}
                                {item.duration && <span>⏱ {item.duration}</span>}
                              </div>
                            </div>
                            <span style={{ fontSize:'0.75rem', fontWeight:700, padding:'5px 12px', borderRadius:100, background:s.bg, color:s.color, flexShrink:0 }}>
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {myApps.length === 0 && myAppOpps.length === 0 && (
                  <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'52px 32px', textAlign:'center', color:'var(--gray-400)' }}>
                    <div style={{ fontSize:'2.5rem', marginBottom:10 }}>📋</div>
                    <div style={{ fontWeight:700, color:'var(--navy)', marginBottom:6 }}>No applications yet</div>
                    <p style={{ fontSize:'0.875rem', marginBottom:18 }}>Apply to events and volunteer opportunities to see them here.</p>
                    <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                      <button onClick={() => setActiveTab('events')} className="btn btn-outline">Browse Events</button>
                      <Link to="/opportunities" className="btn btn-primary">Find Opportunities →</Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'white', borderRadius:11, border:'1px solid var(--gray-200)', padding:'15px 16px' }}>
              <div style={{ fontWeight:700, fontSize:'0.85rem', color:'var(--navy)', marginBottom:12 }}>Your Profile</div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <div style={{ width:42, height:42, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'1rem' }}>{user?.name?.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--navy)' }}>{user?.name}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--gray-400)' }}>{user?.email}</div>
                </div>
              </div>
              {user?.skills?.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:'0.72rem', color:'var(--gray-500)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>Skills</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                    {user.skills.map(s => <span key={s} className="badge badge-green" style={{ fontSize:'0.7rem' }}>{s}</span>)}
                  </div>
                </div>
              )}
              {user?.availability?.length > 0 && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:'0.72rem', color:'var(--gray-500)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>Availability</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                    {user.availability.map(a => <span key={a} className="badge badge-gray" style={{ fontSize:'0.7rem' }}>{a}</span>)}
                  </div>
                </div>
              )}
              <Link to="/dashboard/profile" className="btn btn-outline btn-sm" style={{ width:'100%', justifyContent:'center' }}>Edit Profile</Link>
            </div>

            <div style={{ background:'var(--navy)', borderRadius:11, padding:'15px 16px' }}>
              <div style={{ fontSize:'1.4rem', marginBottom:8 }}>🎯</div>
              <div style={{ fontWeight:700, color:'white', fontSize:'0.85rem', marginBottom:5 }}>Volunteer Opportunities</div>
              <div style={{ fontSize:'0.76rem', color:'rgba(255,255,255,0.55)', marginBottom:11, lineHeight:1.65 }}>
                Find detailed volunteer roles — from one-time events to long-term commitments — that match your schedule.
              </div>
              <Link to="/opportunities" style={{ fontSize:'0.78rem', color:'var(--green)', fontWeight:700, textDecoration:'none' }}>Browse Opportunities →</Link>
            </div>

            {/* Feedback widget */}
            <div style={{ background:'white', borderRadius:11, border:'1px solid var(--gray-200)', padding:'15px 16px' }}>
              <div style={{ fontWeight:700, fontSize:'0.85rem', color:'var(--navy)', marginBottom:10 }}>💬 Share Feedback</div>
              <div style={{ display:'flex', gap:3, marginBottom:10 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setFeedbackRating(s)}
                    style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem', color:s<=feedbackRating?'#F59E0B':'var(--gray-200)', padding:'0 2px' }}>★</button>
                ))}
              </div>
              <textarea
                className="form-input"
                rows={3}
                style={{ fontSize:'0.8rem', resize:'vertical', marginBottom:8 }}
                placeholder="Share your experience or suggestions..."
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
              />
              <button
                className="btn btn-primary btn-sm"
                style={{ width:'100%', justifyContent:'center' }}
                disabled={feedbackLoading || !feedbackText.trim()}
                onClick={async () => {
                  setFeedbackLoading(true);
                  try {
                    await feedbackAPI.create({ message: feedbackText, rating: feedbackRating });
                    toast.success('Feedback submitted! Thank you 🙏');
                    setFeedbackText('');
                    setFeedbackRating(5);
                  } catch { toast.error('Failed to submit feedback'); }
                  finally { setFeedbackLoading(false); }
                }}
              >
                {feedbackLoading ? '...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
