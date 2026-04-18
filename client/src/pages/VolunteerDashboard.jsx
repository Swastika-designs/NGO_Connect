import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { eventAPI } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';

const LINKS = [
  { to:'/dashboard', label:'Dashboard', icon:'dashboard' },
  { to:'/ngos', label:'Browse NGOs', icon:'ngos' },
  { to:'/dashboard/profile', label:'Profile', icon:'profile' },
  { divider:true },
  { to:'#', label:'Settings', icon:'settings' },
  { to:'#', label:'Help Center', icon:'help' },
];

const CAT_BG = { Environment:'#D1FAE5', Education:'#FEF3C7', Healthcare:'#DBEAFE', 'Food & Hunger':'#FCE7F3', Other:'#F3F4F6' };

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  const loadEvents = () => eventAPI.getAll({ limit: 6, status: 'published' })
    .then(r => {
      const all = r.data.events || [];
      setEvents(all);
      setMyApps(all.filter(ev => ev.applicants?.some(a => (typeof a === 'object' ? a._id : a) === user._id)));
    });

  useEffect(() => {
    loadEvents().catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const handleApply = async (eventId) => {
    setApplying(eventId);
    try {
      await eventAPI.apply(eventId);
      toast.success('Application submitted! 🎉');
      await loadEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally { setApplying(null); }
  };

  const hasApplied = (ev) => ev.applicants?.some(a => (typeof a === 'object' ? a._id : a) === user._id);

  const topRight = (
    <>
      <div style={{ position:'relative' }}>
        <input placeholder="Find opportunities..." className="form-input" style={{ width:210, padding:'7px 12px 7px 30px', fontSize:'0.82rem' }} />
        <span style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', fontSize:'0.8rem' }}>🔍</span>
      </div>
      <span>🔔</span>
      <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'white', fontSize:'0.85rem' }}>{user?.name?.charAt(0)}</div>
    </>
  );

  return (
    <SidebarLayout links={LINKS} subLabel="Volunteer Portal" topRight={topRight}>
      <div className="page-enter" style={{ display:'grid', gridTemplateColumns:'1fr 270px', gap:18, alignItems:'start' }}>
        <div>
          <h1 style={{ fontWeight:800, fontSize:'1.35rem', color:'var(--navy)', marginBottom:4 }}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:18 }}>Find events that match your skills and make an impact.</p>

          {/* Stats — real data only */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            {[
              { label:'Active Applications', value: loading ? '—' : myApps.length, icon:'📋', c:'var(--blue)' },
              { label:'Hours Contributed', value: '0', icon:'⏱️', c:'var(--green)' },
              { label:'NGOs Helped', value: loading ? '—' : new Set(myApps.map(ev => ev.createdBy?._id)).size, icon:'⭐', c:'var(--yellow)' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div style={{ width:38, height:38, borderRadius:9, background:`${s.c}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', marginBottom:9 }}>{s.icon}</div>
                <div style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--gray-500)', marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Empty state if no events exist yet */}
          {!loading && events.length === 0 && (
            <div style={{ background:'var(--green-pale)', border:'1px solid var(--green-light)', borderRadius:12, padding:'28px 32px', marginBottom:20, textAlign:'center' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:10 }}>🌱</div>
              <div style={{ fontWeight:700, color:'var(--navy)', marginBottom:6 }}>No events available yet</div>
              <p style={{ color:'var(--gray-600)', fontSize:'0.875rem', marginBottom:16 }}>Browse NGOs to find organizations you can volunteer with directly.</p>
              <Link to="/ngos" className="btn btn-primary">Browse NGOs →</Link>
            </div>
          )}

          {/* Recommended Events */}
          {(loading || events.length > 0) && (
            <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 20px', marginBottom:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem' }}>Recommended Events</div>
              </div>
              {loading ? (
                <div style={{ textAlign:'center', padding:24 }}><span className="spinner" /></div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {events.map(ev => (
                    <div key={ev._id} style={{ border:'1px solid var(--gray-200)', borderRadius:9, overflow:'hidden' }}>
                      <div style={{ height:80, background: CAT_BG[ev.category] || CAT_BG.Other, display:'flex', alignItems:'flex-start', padding:9 }}>
                        <span style={{ fontSize:'0.63rem', fontWeight:700, letterSpacing:'0.06em', background:'rgba(0,0,0,0.14)', color:'white', padding:'2px 8px', borderRadius:100 }}>{ev.category?.toUpperCase()}</span>
                      </div>
                      <div style={{ padding:'11px 13px' }}>
                        <div style={{ fontWeight:700, fontSize:'0.85rem', color:'var(--navy)', marginBottom:3 }}>{ev.title}</div>
                        <div style={{ fontSize:'0.72rem', color:'var(--gray-500)', marginBottom:7, display:'flex', alignItems:'center', gap:4 }}>
                          <span>📅</span>{ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short' }) : 'TBD'}{ev.time ? ` • ${ev.time}` : ''}
                        </div>
                        <div style={{ display:'flex', gap:5, marginBottom:9, flexWrap:'wrap' }}>
                          {(ev.requiredSkills || []).slice(0, 2).map(s => <span key={s} className="badge badge-gray" style={{ fontSize:'0.63rem' }}>{s}</span>)}
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontSize:'0.72rem', color:'var(--gray-500)' }}>{ev.createdBy?.name || 'NGO'}</span>
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

          {/* Application status */}
          <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 20px' }}>
            <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.9rem', marginBottom:14 }}>My Application Status</div>
            {loading ? (
              <div style={{ textAlign:'center', padding:24 }}><span className="spinner" /></div>
            ) : myApps.length === 0 ? (
              <div style={{ textAlign:'center', padding:'24px 0', color:'var(--gray-400)' }}>
                <div style={{ fontSize:'1.8rem', marginBottom:6 }}>📋</div>
                <p>No applications yet. Use "Quick Apply" on events above.</p>
              </div>
            ) : (
              <table className="table">
                <thead><tr><th>Event</th><th>NGO</th><th>Date Applied</th><th>Status</th></tr></thead>
                <tbody>
                  {myApps.map((ev) => (
                    <tr key={ev._id}>
                      <td style={{ fontWeight:600, fontSize:'0.85rem' }}>{ev.title}</td>
                      <td style={{ fontSize:'0.8rem', color:'var(--gray-600)' }}>{ev.createdBy?.name || '—'}</td>
                      <td style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>{new Date(ev.updatedAt || ev.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
                      <td><span className="badge badge-yellow">● Under Review</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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
            <div style={{ width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:9, fontSize:'1.1rem' }}>💬</div>
            <div style={{ fontWeight:700, color:'white', fontSize:'0.85rem', marginBottom:5 }}>Looking for opportunities?</div>
            <div style={{ fontSize:'0.76rem', color:'rgba(255,255,255,0.55)', marginBottom:11, lineHeight:1.65 }}>Browse NGOs and find events that match your skills and interests.</div>
            <Link to="/ngos" style={{ fontSize:'0.78rem', color:'var(--green)', fontWeight:700, textDecoration:'none' }}>Explore NGOs →</Link>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
