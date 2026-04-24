import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ngoAPI, eventAPI, opportunityAPI } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';

const LINKS = [
  { to:'/dashboard', label:'Dashboard', icon:'dashboard' },
  { to:'/dashboard/profile', label:'My NGO Profile', icon:'profile' },
  { to:"/dashboard/post-event", label:"Post Event", icon:"events" },
  { to:"/dashboard/messages", label:"Messages", icon:"feedback" },
  { divider:true },
  { to:'#', label:'Settings', icon:'settings' },
];

const STATUS_CLS = { 'Under Review':'badge-yellow', Accepted:'badge-green', Waitlisted:'badge-gray' };

export default function NGODashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [ngo, setNgo] = useState(null);
  const [events, setEvents] = useState([]);
  const [interests, setInterests] = useState([]);
  const [opps, setOpps] = useState([]);
  const [oppActionLoading, setOppActionLoading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(null);
  const [viewApp, setViewApp] = useState(null); // { applicant, event } for modal

  useEffect(() => {
    const load = async () => {
      try {
        // Use the /mine endpoint which returns own NGO regardless of approval status
        const ngoRes = await ngoAPI.getMine();
        const myNgo = ngoRes.data.ngo;
        setNgo(myNgo || null);
        const evRes = await eventAPI.getMyNGO();
        setEvents(evRes.data.events || []);
        if (myNgo) {
          const [intRes, oppRes] = await Promise.all([
            ngoAPI.getInterests(myNgo._id),
            opportunityAPI.getMyNGO().catch(() => ({ data:{ opportunities:[] } })),
          ]);
          setInterests(intRes.data.interests || []);
          setOpps(oppRes.data.opportunities || []);
        }
      } catch (e) {
        // silent
      } finally { setLoading(false); }
    };
    load();
  }, [user]);

  const handleInterest = async (id, status) => {
    setActionLoading(id);
    try {
      await ngoAPI.updateInterest(id, { status });
      setInterests(prev => prev.map(i => i._id === id ? { ...i, status } : i));
      toast.success(`Application ${status} ✅`);
    } catch (err) {
      toast.error('Failed to update');
    } finally { setActionLoading(null); }
  };

  const totalVolunteers = events.reduce((s, e) => s + (e.applicants?.length || 0), 0);
  const activeEvents = events.filter(e => e.status === 'published').length;
  const allApplicants = events.flatMap(ev =>
    (ev.applicants || []).map(applicant => ({
      _id:          typeof applicant === 'object' ? applicant._id : applicant,
      name:         typeof applicant === 'object' ? (applicant.name || 'Volunteer') : 'Volunteer',
      email:        typeof applicant === 'object' ? (applicant.email || '') : '',
      skills:       typeof applicant === 'object' ? (applicant.skills || []) : [],
      availability: typeof applicant === 'object' ? (applicant.availability || []) : [],
      bio:          typeof applicant === 'object' ? (applicant.bio || '') : '',
      location:     typeof applicant === 'object' ? (applicant.location || '') : '',
      phone:        typeof applicant === 'object' ? (applicant.phone || '') : '',
      event:        ev.title,
      eventId:      ev._id,
      date:         new Date(ev.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }),
    }))
  ).slice(0, 30);

  const topRight = (
    <>
      <div style={{ position:'relative' }}>
        <input placeholder="Search applications..." className="form-input" style={{ width:220, padding:'7px 12px 7px 30px', fontSize:'0.82rem' }} />
        <span style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', fontSize:'0.8rem' }}>🔍</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 10px', border:'1px solid var(--gray-200)', borderRadius:8 }}>
        <div style={{ width:26, height:26, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.78rem' }}>{user?.name?.charAt(0)}</div>
        <span style={{ fontSize:'0.8rem', fontWeight:600 }}>{user?.name?.split(' ')[0]}</span>
      </div>
    </>
  );

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding:'8px 18px', borderRadius:7, border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.85rem',
      background: activeTab === id ? 'var(--navy)' : 'transparent',
      color: activeTab === id ? 'white' : 'var(--gray-500)',
    }}>{label}</button>
  );

  return (
    <>
    <SidebarLayout links={LINKS} subLabel="NGO ADMIN PANEL" topRight={topRight}>
      <div className="page-enter">
        <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', marginBottom:3 }}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:22 }}>Manage your organization and volunteer events.</p>

        {/* No NGO yet */}
        {!loading && !ngo && (
          <div style={{ background:'var(--green-pale)', border:'1px solid var(--green-light)', borderRadius:12, padding:'24px 28px', marginBottom:22, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.95rem', marginBottom:4 }}>Complete your profile to get started 🚀</div>
              <div style={{ fontSize:'0.83rem', color:'var(--gray-600)' }}>Register your NGO so donors and volunteers can find you.</div>
            </div>
            <Link to="/dashboard/create-ngo" className="btn btn-primary" style={{ flexShrink:0 }}>Register NGO →</Link>
          </div>
        )}

        {/* Pending approval banner */}
        {!loading && ngo && !ngo.isApproved && (
          <div style={{ background:'#FEF3C7', border:'1px solid #FCD34D', borderRadius:12, padding:'16px 20px', marginBottom:22 }}>
            <div style={{ fontWeight:700, color:'#92400E', fontSize:'0.9rem', marginBottom:2 }}>⏳ Your NGO is under review</div>
            <div style={{ fontSize:'0.82rem', color:'#78350F' }}>It will be listed publicly once approved by an admin. Your events and profile are saved.</div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          {[
            { label:'Total Volunteers', value: loading ? '—' : totalVolunteers, sub:'Applicants', icon:'👥' },
            { label:'Active Events', value: loading ? '—' : activeEvents, sub:'Published', icon:'📅' },
            { label:'Volunteer Interests', value: loading ? '—' : interests.length, sub: interests.filter(i=>i.status==='pending').length + ' pending', warn: interests.filter(i=>i.status==='pending').length > 0, icon:'✋' },
            { label:'Total Events', value: loading ? '—' : events.length, sub:'All time', icon:'⏱️' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div style={{ fontSize:'0.66rem', fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
                <span style={{ fontSize:'1rem' }}>{s.icon}</span>
              </div>
              <div className="stat-value" style={{ fontSize:'1.4rem', margin:'4px 0 2px' }}>{s.value}</div>
              <div style={{ fontSize:'0.72rem', fontWeight:600, color:s.warn?'var(--yellow)':'var(--gray-400)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick action */}
        <div style={{ background:'linear-gradient(135deg,#1a2744 0%,#0f2820 100%)', borderRadius:12, padding:'18px 22px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:700, color:'white', fontSize:'0.95rem', marginBottom:4 }}>Create a New Event</div>
            <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.55)' }}>Post your next volunteer opportunity.</div>
          </div>
          <Link to="/dashboard/post-event" className="btn btn-primary" style={{ flexShrink:0 }}>+ Post an Event</Link>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, background:'var(--gray-100)', borderRadius:9, padding:4, marginBottom:20, width:'fit-content' }}>
          <TabBtn id="overview" label="My Events" />
          <TabBtn id="applications" label={`Applications${allApplicants.length > 0 ? ` (${allApplicants.length})` : ''}`} />
          <TabBtn id="interests" label={`Volunteer Interests${interests.length > 0 ? ` (${interests.length})` : ''}`} />
          <TabBtn id="opportunities" label={`Opportunities${opps.length > 0 ? ` (${opps.length})` : ''}`} />
        </div>

        {/* Tab: My Events */}
        {activeTab === 'overview' && (
          <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem' }}>My Events</div>
              <Link to="/dashboard/post-event" style={{ fontSize:'0.8rem', color:'var(--green)', fontWeight:600, textDecoration:'none' }}>+ Post New Event</Link>
            </div>
            {loading ? (
              <div style={{ textAlign:'center', padding:24 }}><span className="spinner" /></div>
            ) : events.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0' }}>
                <div style={{ fontSize:'2rem', marginBottom:8 }}>📅</div>
                <p style={{ color:'var(--gray-500)', marginBottom:16 }}>No events yet. Post your first event to recruit volunteers.</p>
                <Link to="/dashboard/post-event" className="btn btn-primary btn-sm">Post an Event</Link>
              </div>
            ) : (
              <table className="table">
                <thead><tr><th>Event</th><th>Date</th><th>Slots</th><th>Applicants</th><th>Status</th><th>Attendance</th></tr></thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev._id}>
                      <td style={{ fontWeight:600, fontSize:'0.85rem' }}>{ev.title}</td>
                      <td style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>{ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}</td>
                      <td style={{ fontSize:'0.85rem' }}>{ev.volunteersNeeded || '—'}</td>
                      <td><span className="badge badge-blue">{ev.applicants?.length || 0}</span></td>
                      <td><span className={`badge ${ev.status === 'published' ? 'badge-green' : 'badge-gray'}`}>{ev.status}</span></td>
                    <td>
                      <a href={`/dashboard/attendance/${ev._id}`}
                         style={{ fontSize:'0.75rem', color:'var(--blue)', fontWeight:600, textDecoration:'none' }}>
                        Mark →
                      </a>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Applications */}
        {activeTab === 'applications' && (
          <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 22px' }}>
            <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem', marginBottom:14 }}>Event Applications</div>
            {loading ? (
              <div style={{ textAlign:'center', padding:24 }}><span className="spinner" /></div>
            ) : allApplicants.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--gray-400)' }}>
                <div style={{ fontSize:'2rem', marginBottom:8 }}>📋</div>
                <p>No applications yet. Publish events to start receiving applications.</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {allApplicants.map((a, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', border:'1px solid var(--gray-200)', borderRadius:9 }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:`hsl(${i*60},55%,72%)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem', color:'white', flexShrink:0 }}>
                      {a.name.charAt(0)}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--navy)', marginBottom:2 }}>{a.name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--gray-500)', display:'flex', gap:8, flexWrap:'wrap' }}>
                        <span>📅 {a.event}</span>
                        {a.email && <span>✉ {a.email}</span>}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
                      <span className="badge badge-yellow" style={{ fontSize:'0.7rem' }}>● Under Review</span>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ fontSize:'0.75rem', padding:'4px 12px' }}
                        onClick={() => setViewApp(a)}
                      >
                        View Application →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Opportunities */}
        {activeTab === 'opportunities' && (
          <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem' }}>Posted Volunteer Opportunities</div>
              <a href="/dashboard/post-opportunity" style={{ fontSize:'0.8rem', color:'var(--green)', fontWeight:600, textDecoration:'none' }}>+ Post New</a>
            </div>
            {loading ? (
              <div style={{ textAlign:'center', padding:24 }}><span className="spinner" /></div>
            ) : opps.length === 0 ? (
              <div style={{ textAlign:'center', padding:'36px 0', color:'var(--gray-400)' }}>
                <div style={{ fontSize:'2rem', marginBottom:8 }}>🎯</div>
                <p style={{ marginBottom:16 }}>No opportunities posted yet.</p>
                <a href="/dashboard/post-opportunity" className="btn btn-primary btn-sm">Post an Opportunity</a>
              </div>
            ) : (
              <table className="table">
                <thead><tr><th>Title</th><th>Type</th><th>Location</th><th>Applicants</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {opps.map(opp => (
                    <tr key={opp._id}>
                      <td style={{ fontWeight:600, fontSize:'0.85rem' }}>{opp.title}</td>
                      <td style={{ fontSize:'0.8rem', color:'var(--gray-500)', textTransform:'capitalize' }}>{opp.commitmentType}</td>
                      <td style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>{opp.locationType}</td>
                      <td><span className="badge badge-blue">{opp.applications?.length || 0}</span></td>
                      <td>
                        <span className={`badge ${opp.status === 'open' ? 'badge-green' : 'badge-gray'}`}>
                          {opp.status === 'open' ? '🟢 Open' : opp.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:5 }}>
                          <button
                            className="btn btn-sm"
                            style={{ fontSize:'0.7rem', padding:'3px 8px', background: opp.status === 'open' ? 'var(--yellow)' : 'var(--green)', color:'white', border:'none' }}
                            disabled={!!oppActionLoading}
                            onClick={async () => {
                              setOppActionLoading(opp._id);
                              try {
                                await opportunityAPI.update(opp._id, { status: opp.status === 'open' ? 'closed' : 'open' });
                                setOpps(prev => prev.map(o => o._id === opp._id ? { ...o, status: opp.status === 'open' ? 'closed' : 'open' } : o));
                              } catch {}
                              setOppActionLoading(null);
                            }}
                          >
                            {opp.status === 'open' ? 'Close' : 'Reopen'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Applications for each opportunity */}
            {opps.some(o => (o.applications?.length || 0) > 0) && (
              <div style={{ marginTop:20, paddingTop:18, borderTop:'1px solid var(--gray-100)' }}>
                <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.875rem', marginBottom:12 }}>Opportunity Applications</div>
                {opps.filter(o => o.applications?.length > 0).map(opp => (
                  <div key={opp._id} style={{ marginBottom:16 }}>
                    <div style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--gray-600)', marginBottom:8 }}>📋 {opp.title}</div>
                    {opp.applications.map(app => (
                      <div key={app._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid var(--gray-50)' }}>
                        <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.78rem', flexShrink:0 }}>
                          {(app.volunteer?.name || 'V').charAt(0)}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{app.volunteer?.name || 'Volunteer'}</div>
                          {app.message && <div style={{ fontSize:'0.75rem', color:'var(--gray-500)', fontStyle:'italic' }}>"{app.message.slice(0,80)}{app.message.length > 80 ? '...' : ''}"</div>}
                        </div>
                        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                          {app.status === 'pending' ? (
                            <>
                              <button className="btn btn-primary btn-sm" style={{ fontSize:'0.7rem', padding:'3px 9px' }}
                                disabled={!!oppActionLoading}
                                onClick={async () => {
                                  setOppActionLoading(app._id);
                                  try {
                                    const res = await opportunityAPI.updateApplication(opp._id, app._id, { status:'accepted' });
                                    setOpps(prev => prev.map(o => o._id === opp._id ? res.data.opportunity : o));
                                  } catch {}
                                  setOppActionLoading(null);
                                }}>
                                Accept
                              </button>
                              <button className="btn btn-danger btn-sm" style={{ fontSize:'0.7rem', padding:'3px 9px' }}
                                disabled={!!oppActionLoading}
                                onClick={async () => {
                                  setOppActionLoading(app._id);
                                  try {
                                    const res = await opportunityAPI.updateApplication(opp._id, app._id, { status:'rejected' });
                                    setOpps(prev => prev.map(o => o._id === opp._id ? res.data.opportunity : o));
                                  } catch {}
                                  setOppActionLoading(null);
                                }}>
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className={`badge ${app.status === 'accepted' ? 'badge-green' : 'badge-red'}`} style={{ fontSize:'0.72rem', textTransform:'capitalize' }}>
                              {app.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Volunteer Interests */}
        {activeTab === 'interests' && (
          <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 22px' }}>
            <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem', marginBottom:14 }}>Volunteer Interest Applications</div>
            {loading ? (
              <div style={{ textAlign:'center', padding:24 }}><span className="spinner" /></div>
            ) : interests.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--gray-400)' }}>
                <div style={{ fontSize:'2rem', marginBottom:8 }}>✋</div>
                <p>No volunteer interest applications yet.</p>
              </div>
            ) : interests.map((interest) => (
              <div key={interest._id} style={{ border:'1px solid var(--gray-200)', borderRadius:9, padding:'14px 16px', marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.85rem' }}>{interest.volunteer?.name?.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--navy)' }}>{interest.volunteer?.name}</div>
                        <div style={{ fontSize:'0.72rem', color:'var(--gray-400)' }}>{interest.volunteer?.email}</div>
                      </div>
                    </div>
                    {interest.message && <p style={{ fontSize:'0.83rem', color:'var(--gray-600)', lineHeight:1.6, marginBottom:8 }}>{interest.message}</p>}
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      {(interest.skills || []).map(s => <span key={s} className="badge badge-green" style={{ fontSize:'0.7rem' }}>{s}</span>)}
                      {(interest.availability || []).map(a => <span key={a} className="badge badge-gray" style={{ fontSize:'0.7rem' }}>{a}</span>)}
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                    <span className={`badge ${interest.status === 'pending' ? 'badge-yellow' : interest.status === 'accepted' ? 'badge-green' : 'badge-red'}`} style={{ textTransform:'capitalize' }}>
                      {interest.status}
                    </span>
                    {interest.status === 'pending' && (
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-primary btn-sm" disabled={!!actionLoading} onClick={() => handleInterest(interest._id, 'accepted')} style={{ fontSize:'0.72rem', padding:'4px 10px' }}>
                          {actionLoading === interest._id ? '...' : 'Accept'}
                        </button>
                        <button className="btn btn-danger btn-sm" disabled={!!actionLoading} onClick={() => handleInterest(interest._id, 'rejected')} style={{ fontSize:'0.72rem', padding:'4px 10px' }}>
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>

    {/* Application Detail Modal */}
    {viewApp && (
      <div onClick={() => setViewApp(null)} style={{ position:'fixed', inset:0, background:'rgba(17,24,39,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:16, backdropFilter:'blur(4px)' }}>
        <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:16, width:'100%', maxWidth:520, maxHeight:'88vh', overflowY:'auto', boxShadow:'0 25px 50px rgba(0,0,0,0.25)' }}>
          <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--gray-200)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--green)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>Volunteer Application</p>
              <h2 style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--navy)' }}>{viewApp.event}</h2>
            </div>
            <button onClick={() => setViewApp(null)} style={{ background:'var(--gray-100)', border:'none', borderRadius:'50%', width:30, height:30, fontSize:'1.1rem', cursor:'pointer' }}>×</button>
          </div>
          <div style={{ padding:'22px 24px' }}>
            {/* Volunteer header */}
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, padding:'16px', background:'var(--gray-50)', borderRadius:10 }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'1.2rem', flexShrink:0 }}>
                {viewApp.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:'1rem', color:'var(--navy)', marginBottom:3 }}>{viewApp.name}</div>
                {viewApp.email && <div style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>✉ {viewApp.email}</div>}
                {viewApp.phone && <div style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>📞 {viewApp.phone}</div>}
                {viewApp.location && <div style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>📍 {viewApp.location}</div>}
              </div>
            </div>

            {/* Bio */}
            {viewApp.bio && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>About</div>
                <p style={{ fontSize:'0.875rem', color:'var(--gray-700)', lineHeight:1.65 }}>{viewApp.bio}</p>
              </div>
            )}

            {/* Skills */}
            {viewApp.skills?.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Skills</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {viewApp.skills.map(s => <span key={s} className="badge badge-green" style={{ fontSize:'0.78rem' }}>{s}</span>)}
                </div>
              </div>
            )}

            {/* Availability */}
            {viewApp.availability?.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Availability</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {viewApp.availability.map(a => <span key={a} className="badge badge-gray" style={{ fontSize:'0.78rem' }}>🕐 {a}</span>)}
                </div>
              </div>
            )}

            {(!viewApp.bio && !viewApp.skills?.length && !viewApp.availability?.length) && (
              <div style={{ background:'var(--gray-50)', borderRadius:8, padding:'16px', marginBottom:16, textAlign:'center', color:'var(--gray-400)', fontSize:'0.875rem' }}>
                No additional profile information provided by this volunteer.
              </div>
            )}

            <div style={{ display:'flex', gap:10, paddingTop:8, borderTop:'1px solid var(--gray-100)' }}>
              <button className="btn btn-outline" style={{ flex:1, justifyContent:'center' }} onClick={() => setViewApp(null)}>Close</button>
              {viewApp.email && (
                <a href={`mailto:${viewApp.email}`} className="btn btn-primary" style={{ flex:1, justifyContent:'center', textDecoration:'none', display:'flex', alignItems:'center' }}>
                  ✉ Contact Volunteer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
