import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ngoAPI, eventAPI } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';

const LINKS = [
  { to:'/dashboard', label:'Dashboard', icon:'dashboard' },
  { to:'/dashboard/profile', label:'My NGO Profile', icon:'profile' },
  { to:'/dashboard/post-event', label:'Post Event', icon:'events' },
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(null);

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
          const intRes = await ngoAPI.getInterests(myNgo._id);
          setInterests(intRes.data.interests || []);
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
      name: typeof applicant === 'object' ? (applicant.name || 'Volunteer') : 'Volunteer',
      event: ev.title,
      date: new Date(ev.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }),
    }))
  ).slice(0, 8);

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
                <thead><tr><th>Event</th><th>Date</th><th>Slots Needed</th><th>Applicants</th><th>Status</th></tr></thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev._id}>
                      <td style={{ fontWeight:600, fontSize:'0.85rem' }}>{ev.title}</td>
                      <td style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>{ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}</td>
                      <td style={{ fontSize:'0.85rem' }}>{ev.volunteersNeeded || '—'}</td>
                      <td><span className="badge badge-blue">{ev.applicants?.length || 0}</span></td>
                      <td><span className={`badge ${ev.status === 'published' ? 'badge-green' : 'badge-gray'}`}>{ev.status}</span></td>
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
            <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem', marginBottom:14 }}>Recent Volunteer Applications</div>
            {loading ? (
              <div style={{ textAlign:'center', padding:24 }}><span className="spinner" /></div>
            ) : allApplicants.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--gray-400)' }}>
                <div style={{ fontSize:'2rem', marginBottom:8 }}>📋</div>
                <p>No applications yet. Publish events to start receiving applications.</p>
              </div>
            ) : (
              <table className="table">
                <thead><tr><th>Applicant</th><th>Event</th><th>Applied Date</th><th>Status</th></tr></thead>
                <tbody>
                  {allApplicants.map((a, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                          <div style={{ width:30, height:30, borderRadius:'50%', background:`hsl(${i*60},55%,72%)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.72rem', color:'white' }}>{a.name.charAt(0)}</div>
                          <span style={{ fontWeight:600, fontSize:'0.85rem' }}>{a.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize:'0.85rem', color:'var(--gray-600)' }}>{a.event}</td>
                      <td style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>{a.date}</td>
                      <td><span className="badge badge-yellow">● Under Review</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  );
}
