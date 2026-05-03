import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ngoAPI, statsAPI } from '../services/api';
import NGOCard from '../components/NGOCard';

const StatBox = ({ icon, value, label, change }) => (
  <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 20px', textAlign:'center', boxShadow:'var(--shadow-sm)' }}>
    <div style={{ fontSize:'1.6rem', marginBottom:8 }}>{icon}</div>
    <div style={{ fontSize:'1.6rem', fontWeight:800, color:'var(--navy)', lineHeight:1.1 }}>{value}</div>
    <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.08em', color:'var(--gray-500)', textTransform:'uppercase', margin:'4px 0 6px' }}>{label}</div>
    {change && <div style={{ fontSize:'0.75rem', color:'var(--green)', fontWeight:600 }}>↑ {change} this month</div>}
  </div>
);

export default function Home() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    ngoAPI.getAll({ featured:true, limit:3 }).then(r => setFeatured(r.data.ngos || [])).catch(() => {});
    statsAPI.get().then(r => setStats(r.data.stats)).catch(() => {});
  }, []);

  return (
    <div className="page-enter">
      {/* HERO */}
      <section style={{
        minHeight:'100vh', position:'relative', overflow:'hidden',
        background:'linear-gradient(135deg, #0f172a 0%, #1a2744 40%, #0f2820 100%)',
        display:'flex', alignItems:'center',
      }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(16,185,129,0.07) 1px, transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:-200, right:-100, width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 65%)', pointerEvents:'none' }} />
        <div className="container" style={{ paddingTop:100, paddingBottom:80, position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:100, padding:'5px 14px', marginBottom:28 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', display:'inline-block' }} />
            <span style={{ fontSize:'0.75rem', fontWeight:700, color:'rgba(255,255,255,0.85)', letterSpacing:'0.08em' }}>GLOBAL COMMUNITY</span>
          </div>
          <h1 style={{ fontWeight:800, fontSize:'clamp(2.6rem,5.5vw,4rem)', lineHeight:1.08, color:'white', marginBottom:20, maxWidth:600 }}>
            Connecting <span style={{ color:'var(--green)' }}>Passion</span><br />with Purpose
          </h1>
          <p style={{ fontSize:'1rem', color:'rgba(255,255,255,0.6)', lineHeight:1.8, maxWidth:480, marginBottom:40 }}>
            Empowering communities by bringing together dedicated volunteers and impactful organizations to solve the world's most pressing challenges.
          </p>

          {/* CTAs: hide join buttons if already logged in */}
          {user ? (
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:28 }}>
              <Link to="/dashboard" className="btn btn-primary" style={{ padding:'12px 28px', fontSize:'1rem' }}>
                Go to Dashboard →
              </Link>
              <Link to="/ngos" className="btn btn-outline" style={{ background:'rgba(255,255,255,0.07)', borderColor:'rgba(255,255,255,0.25)', color:'white', padding:'12px 22px' }}>
                Browse NGOs
              </Link>
            </div>
          ) : (
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:28 }}>
              <Link to="/register?role=volunteer" className="btn btn-outline" style={{ background:'rgba(255,255,255,0.07)', borderColor:'rgba(255,255,255,0.25)', color:'white', padding:'12px 22px' }}>Join as Volunteer</Link>
              <Link to="/register?role=ngo" className="btn btn-outline" style={{ background:'rgba(255,255,255,0.07)', borderColor:'rgba(255,255,255,0.25)', color:'white', padding:'12px 22px' }}>Join as NGO</Link>
              <Link to="/register?role=donor" className="btn btn-primary" style={{ padding:'12px 22px' }}>Join as Donor</Link>
            </div>
          )}

          <div style={{ display:'inline-flex', alignItems:'center', gap:7, color:'rgba(255,255,255,0.45)', fontSize:'0.83rem', fontWeight:500 }}>
            <span>♡</span> Support a Cause
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background:'var(--gray-50)', padding:'48px 0' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            <StatBox icon="👥" value={stats?.totalUsers ? `${stats.totalUsers.toLocaleString()}` : '—'} label="Users Joined" change="+12%" />
            <StatBox icon="✅" value={stats?.totalNGOs ?? '—'} label="NGOs Verified" change="+5%" />
            <StatBox icon="💰" value={stats?.totalAmount ? `₹${(stats.totalAmount/100000).toFixed(1)}L+` : '—'} label="Funds Raised" change="+18%" />
            <StatBox icon="🌍" value={stats?.totalDonations ?? '—'} label="Donations Made" change="+10%" />
          </div>
        </div>
      </section>

      {/* FEATURED NGOs */}
      <section style={{ padding:'72px 0', background:'var(--gray-100)' }}>
        <div className="container">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:32 }}>
            <div>
              <h2 style={{ fontWeight:800, fontSize:'1.7rem', color:'var(--navy)', marginBottom:6 }}>Featured NGOs</h2>
              <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', maxWidth:440, lineHeight:1.6 }}>
                Spotlighting organizations making real, measurable impact across India. Join their mission today.
              </p>
            </div>
            <Link to="/ngos" style={{ color:'var(--green)', fontWeight:700, fontSize:'0.875rem' }}>Explore All NGOs →</Link>
          </div>
          {featured.length > 0 ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
              {featured.map(ngo => <NGOCard key={ngo._id} ngo={ngo} />)}
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'60px 0', color:'var(--gray-400)' }}>
              <div style={{ fontSize:'3rem', marginBottom:12 }}>🌱</div>
              <p style={{ marginBottom:16 }}>No featured NGOs yet.</p>
              {!user && <Link to="/dashboard/create-ngo" className="btn btn-primary">Register Your NGO</Link>}
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ padding:'80px 0', background:'var(--gray-50)', textAlign:'center' }}>
        <div className="container" style={{ maxWidth:600 }}>
          <h2 style={{ fontWeight:800, fontSize:'clamp(1.8rem,3.5vw,2.4rem)', color:'var(--navy)', marginBottom:14 }}>
            Ready to make a difference?
          </h2>
          <p style={{ color:'var(--gray-500)', fontSize:'0.95rem', lineHeight:1.75, marginBottom:36 }}>
            Whether you have an hour to give or a lifelong mission to lead, NGO Connect provides the tools and network to amplify your impact.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard →</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">Get Started Today</Link>
                <Link to="/ngos" className="btn btn-outline btn-lg">Browse NGOs</Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
