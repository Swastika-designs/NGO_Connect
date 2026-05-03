import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ngoAPI, eventAPI } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';

const LINKS = [
  { to:'/dashboard',           label:'Dashboard',       icon:'dashboard' },
  { to:'/dashboard/post-event',label:'Post Event',      icon:'events'    },
  { to:'/dashboard/profile',   label:'My NGO Profile',  icon:'profile'   },
  { to:'/dashboard/messages',  label:'Messages',        icon:'feedback'  },
];

export default function AttendancePage() {
  const { eventId } = useParams();
  const { user }    = useAuth();
  const toast       = useToast();
  const navigate    = useNavigate();

  const [event,   setEvent]   = useState(null);
  const [ngo,     setNgo]     = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // 1. Get the event (populate applicants with name/email)
        const evRes  = await eventAPI.getOne(eventId);
        const ev     = evRes.data.event;

        // 2. Get my NGO
        const ngoRes = await ngoAPI.getMine();
        const myNgo  = ngoRes.data.ngo;

        if (!myNgo) {
          setError('You have no registered NGO. Please register an NGO first.');
          return;
        }
        if (!ev) {
          setError('Event not found.');
          return;
        }

        setEvent(ev);
        setNgo(myNgo);

        const applicants = ev.applicants || [];

        // 3. Try to load existing attendance records for this event
        let existing = [];
        try {
          const attRes = await ngoAPI.getAttendance(myNgo._id, eventId);
          existing = attRes.data.records || [];
        } catch { /* No prior records — OK */ }

        // 4. Build record list: one row per applicant
        setRecords(applicants.map(a => {
          const aid   = a._id?.toString() || a?.toString();
          const found = existing.find(r => {
            const vid = r.volunteer?._id?.toString() || r.volunteer?.toString();
            return vid === aid;
          });
          return {
            volunteerId:         aid,
            name:                a.name  || 'Volunteer',
            email:               a.email || '',
            status:              found?.status             || 'present',
            priorCommunication:  found?.priorCommunication || false,
            note:                found?.note               || '',
          };
        }));

      } catch (e) {
        setError('Failed to load attendance data. ' + (e.response?.data?.message || e.message));
      } finally { setLoading(false); }
    };
    load();
  }, [eventId]);

  const setField = (idx, key, val) =>
    setRecords(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r));

  const handleSave = async () => {
    if (!ngo) return;
    setSaving(true);
    try {
      await ngoAPI.markAttendance(ngo._id, eventId, {
        records: records.map(r => ({
          volunteer:          r.volunteerId,
          status:             r.status,
          priorCommunication: r.priorCommunication,
          note:               r.note,
        })),
      });
      toast.success('Attendance saved successfully ✅');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally { setSaving(false); }
  };

  const counts = {
    present:  records.filter(r => r.status === 'present').length,
    absent:   records.filter(r => r.status === 'absent').length,
    noShow:   records.filter(r => r.status === 'no-show' && !r.priorCommunication).length,
    excused:  records.filter(r => r.status === 'no-show' &&  r.priorCommunication).length,
  };

  if (loading) return (
    <SidebarLayout links={LINKS}>
      <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
        <span className="spinner" style={{ width:36, height:36 }} />
      </div>
    </SidebarLayout>
  );

  if (error) return (
    <SidebarLayout links={LINKS}>
      <div style={{ maxWidth:600, margin:'40px auto' }}>
        <div style={{ background:'var(--red-light)', border:'1px solid var(--red)', borderRadius:12, padding:'24px 28px', textAlign:'center' }}>
          <div style={{ fontSize:'2rem', marginBottom:10 }}>⚠️</div>
          <div style={{ fontWeight:700, color:'var(--red)', marginBottom:8 }}>Cannot Load Attendance</div>
          <p style={{ color:'var(--gray-600)', fontSize:'0.875rem', marginBottom:16 }}>{error}</p>
          <Link to="/dashboard" className="btn btn-primary">← Back to Dashboard</Link>
        </div>
      </div>
    </SidebarLayout>
  );

  return (
    <SidebarLayout links={LINKS}>
      <div className="page-enter" style={{ maxWidth:820 }}>
        {/* Breadcrumb */}
        <div style={{ fontSize:'0.8rem', color:'var(--gray-400)', marginBottom:14 }}>
          <span onClick={() => navigate('/dashboard')} style={{ cursor:'pointer', color:'var(--green)' }}>Dashboard</span>
          {' › '}
          <span style={{ color:'var(--navy)' }}>Attendance</span>
        </div>

        <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', marginBottom:4 }}>Mark Attendance</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:6 }}>
          {event?.title}
          {event?.date && (
            <span style={{ marginLeft:8, fontWeight:500 }}>
              · {new Date(event.date).toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })}
            </span>
          )}
        </p>

        {/* Summary cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
          {[
            { label:'Present',          value:counts.present, color:'var(--green)',  icon:'✅' },
            { label:'Absent',           value:counts.absent,  color:'var(--yellow)', icon:'⚠️' },
            { label:'No-show (flagged)',value:counts.noShow,  color:'var(--red)',    icon:'🚫' },
            { label:'Excused',          value:counts.excused, color:'var(--blue)',   icon:'📩' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:'1.2rem' }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight:800, fontSize:'1.3rem', color:s.color, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:'0.68rem', color:'var(--gray-500)', marginTop:2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* No applicants */}
        {records.length === 0 ? (
          <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'52px 32px', textAlign:'center', color:'var(--gray-400)' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:10 }}>👥</div>
            <div style={{ fontWeight:700, color:'var(--navy)', marginBottom:6 }}>No volunteers applied</div>
            <p style={{ fontSize:'0.875rem' }}>No one has applied to this event yet. Attendance cannot be marked until volunteers apply.</p>
          </div>
        ) : (
          <>
            {/* Legend */}
            <div style={{ display:'flex', gap:14, marginBottom:12, fontSize:'0.78rem', color:'var(--gray-500)', flexWrap:'wrap' }}>
              <span>Click a status button to mark each volunteer:</span>
              {[['✅ Present','var(--green)'],['⚠️ Absent','var(--yellow)'],['🚫 No-show','var(--red)']].map(([l,c]) => (
                <span key={l} style={{ fontWeight:600, color:c }}>{l}</span>
              ))}
            </div>

            <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', overflow:'hidden', marginBottom:20 }}>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--gray-100)', background:'var(--gray-50)', fontWeight:700, color:'var(--navy)', fontSize:'0.875rem' }}>
                Volunteers ({records.length})
              </div>

              {records.map((r, idx) => (
                <div key={idx} style={{ padding:'16px 20px', borderBottom:'1px solid var(--gray-50)', background:'white' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                    {/* Avatar */}
                    <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, flexShrink:0 }}>
                      {r.name?.charAt(0).toUpperCase()}
                    </div>

                    {/* Name + email */}
                    <div style={{ flex:1, minWidth:130 }}>
                      <div style={{ fontWeight:600, fontSize:'0.9rem', color:'var(--navy)' }}>{r.name}</div>
                      {r.email && <div style={{ fontSize:'0.75rem', color:'var(--gray-400)' }}>{r.email}</div>}
                    </div>

                    {/* Status buttons */}
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {[
                        { val:'present', label:'✅ Present', color:'var(--green)' },
                        { val:'absent',  label:'⚠️ Absent',  color:'var(--yellow)' },
                        { val:'no-show', label:'🚫 No-show', color:'var(--red)' },
                      ].map(({ val, label, color }) => (
                        <button key={val} type="button" onClick={() => setField(idx, 'status', val)} style={{
                          padding:'6px 14px', borderRadius:6, border:'1.5px solid', cursor:'pointer',
                          fontSize:'0.78rem', fontWeight:600, transition:'all 0.15s',
                          borderColor: r.status === val ? color : 'var(--gray-200)',
                          background:  r.status === val ? `${color}18` : 'white',
                          color:       r.status === val ? color : 'var(--gray-500)',
                        }}>{label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Prior communication — only for no-show */}
                  {r.status === 'no-show' && (
                    <div style={{ marginTop:10, paddingLeft:52 }}>
                      <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:'0.82rem', color:'var(--gray-700)' }}>
                        <input
                          type="checkbox"
                          checked={r.priorCommunication}
                          onChange={e => setField(idx, 'priorCommunication', e.target.checked)}
                          style={{ accentColor:'var(--green)', width:15, height:15 }}
                        />
                        <span>
                          <strong>Prior communication received</strong> — volunteer informed in advance. Do not flag as a no-show.
                        </span>
                      </label>
                      {r.priorCommunication && (
                        <div style={{ marginTop:6, fontSize:'0.75rem', color:'var(--blue)', fontWeight:600 }}>
                          📩 This absence is excused and will not be flagged.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Note */}
                  <div style={{ marginTop:8, paddingLeft:52 }}>
                    <input
                      className="form-input"
                      placeholder="Optional note (e.g. arrived late, excellent work)..."
                      value={r.note}
                      onChange={e => setField(idx, 'note', e.target.value)}
                      style={{ fontSize:'0.8rem', padding:'6px 10px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer actions */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:40 }}>
          <p style={{ fontSize:'0.8rem', color:'var(--gray-400)' }}>
            {counts.noShow > 0 && `⚠ ${counts.noShow} volunteer${counts.noShow > 1 ? 's' : ''} flagged as no-show.`}
          </p>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || records.length === 0}
            >
              {saving
                ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white', width:14, height:14 }} /> Saving...</>
                : '✅ Save Attendance'}
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
