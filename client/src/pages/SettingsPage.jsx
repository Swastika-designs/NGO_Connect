import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';

const volunteerLinks = [
  { to:'/dashboard',          label:'Dashboard',          icon:'dashboard'    },
  { to:'/ngos',               label:'Browse NGOs',        icon:'ngos'         },
  { to:'/opportunities',      label:'Find Opportunities', icon:'applications' },
  { to:'/dashboard/messages', label:'Messages',           icon:'feedback'     },
  { to:'/dashboard/profile',  label:'Profile',            icon:'profile'      },
  { divider:true },
  { to:'/dashboard/settings', label:'Settings',           icon:'settings'     },
];
const ngoLinks = [
  { to:'/dashboard',          label:'Dashboard',          icon:'dashboard' },
  { to:'/dashboard/profile',  label:'My NGO Profile',     icon:'profile'   },
  { to:'/dashboard/post-event', label:'Post Event',       icon:'events'    },
  { to:'/dashboard/messages', label:'Messages',           icon:'feedback'  },
  { divider:true },
  { to:'/dashboard/settings', label:'Settings',           icon:'settings'  },
];
const donorLinks = [
  { to:'/dashboard',          label:'Dashboard',          icon:'dashboard' },
  { to:'/ngos',               label:'Browse NGOs',        icon:'ngos'      },
  { to:'/dashboard/messages', label:'Messages',           icon:'feedback'  },
  { to:'/dashboard/profile',  label:'Profile',            icon:'profile'   },
  { divider:true },
  { to:'/dashboard/settings', label:'Settings',           icon:'settings'  },
];
const adminLinks = [
  { to:'/dashboard',              label:'Dashboard Overview', icon:'dashboard' },
  { to:'/dashboard/admin/ngos',   label:'All NGOs',           icon:'ngos'      },
  { to:'/dashboard/admin/users',  label:'All Users',          icon:'users'     },
  { to:'/dashboard/messages',     label:'Messages',           icon:'feedback'  },
  { divider:true },
  { to:'/dashboard/settings',     label:'Settings',           icon:'settings'  },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [pwForm, setPwForm] = useState({ current:'', newPw:'', confirm:'' });
  const [pwLoading, setPwLoading] = useState(false);
  const [notif, setNotif] = useState({ email: true, updates: true, digest: false });

  const links = user?.role === 'volunteer' ? volunteerLinks
    : user?.role === 'ngo' ? ngoLinks
    : user?.role === 'admin' ? adminLinks
    : donorLinks;

  const handlePw = async (e) => {
    e.preventDefault();
    if (!pwForm.current) return toast.error('Enter current password');
    if (pwForm.newPw.length < 6) return toast.error('New password must be at least 6 characters');
    if (pwForm.newPw !== pwForm.confirm) return toast.error('Passwords do not match');
    setPwLoading(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      toast.success('Password updated successfully ✅');
      setPwForm({ current:'', newPw:'', confirm:'' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally { setPwLoading(false); }
  };

  const card = (children, title) => (
    <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'22px 24px', marginBottom:18 }}>
      {title && <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.95rem', marginBottom:18, paddingBottom:12, borderBottom:'1px solid var(--gray-100)' }}>{title}</div>}
      {children}
    </div>
  );

  const toggle = (key) => (
    <label style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--gray-100)', cursor:'pointer' }}>
      <span style={{ fontSize:'0.875rem', color:'var(--gray-700)' }}>
        {key === 'email' ? '📧 Email notifications for new events & opportunities'
        : key === 'updates' ? '🔔 Important account & NGO updates'
        : '📰 Weekly digest of activities'}
      </span>
      <div onClick={() => setNotif(n => ({ ...n, [key]: !n[key] }))}
        style={{ width:42, height:24, borderRadius:100, background:notif[key]?'var(--green)':'var(--gray-300)', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
        <div style={{ width:18, height:18, borderRadius:'50%', background:'white', position:'absolute', top:3, left:notif[key]?21:3, transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
    </label>
  );

  return (
    <SidebarLayout links={links} subLabel={`${user?.role?.toUpperCase()} PORTAL`}>
      <div className="page-enter">
        <h1 style={{ fontWeight:800, fontSize:'1.35rem', color:'var(--navy)', marginBottom:4 }}>Settings</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:22 }}>Manage your account preferences and security.</p>

        {/* Account info */}
        {card(
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1.3rem', color:'white', flexShrink:0 }}>
              {user?.name?.charAt(0)}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:'1rem', color:'var(--navy)' }}>{user?.name}</div>
              <div style={{ fontSize:'0.82rem', color:'var(--gray-500)', marginTop:2 }}>{user?.email}</div>
              <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'3px 9px', borderRadius:100, background:'var(--green-pale)', color:'var(--green)', marginTop:4, display:'inline-block', textTransform:'uppercase' }}>{user?.role}</span>
            </div>
          </div>,
          '👤 Account'
        )}

        {/* Change Password */}
        {card(
          <form onSubmit={handlePw}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" value={pwForm.current} onChange={e => setPwForm(f=>({...f,current:e.target.value}))} placeholder="••••••••" />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" value={pwForm.newPw} onChange={e => setPwForm(f=>({...f,newPw:e.target.value}))} placeholder="Min 6 characters" />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" value={pwForm.confirm} onChange={e => setPwForm(f=>({...f,confirm:e.target.value}))} placeholder="Repeat password" />
              </div>
            </div>
            <div style={{ marginTop:14 }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={pwLoading}>
                {pwLoading ? '...' : '🔒 Update Password'}
              </button>
            </div>
          </form>,
          '🔐 Change Password'
        )}

        {/* Notifications */}
        {card(
          <div>
            {toggle('email')}
            {toggle('updates')}
            {toggle('digest')}
            <div style={{ paddingTop:12 }}>
              <button className="btn btn-primary btn-sm" onClick={() => toast.success('Notification preferences saved ✅')}>
                Save Preferences
              </button>
            </div>
          </div>,
          '🔔 Notification Preferences'
        )}

        {/* Danger zone */}
        {card(
          <div>
            <p style={{ fontSize:'0.875rem', color:'var(--gray-600)', marginBottom:14 }}>
              Signing out will end your current session. You'll need to log in again to access your account.
            </p>
            <button className="btn btn-outline" style={{ color:'var(--red)', borderColor:'var(--red)' }} onClick={logout}>
              Sign Out
            </button>
          </div>,
          '⚠️ Session'
        )}
      </div>
    </SidebarLayout>
  );
}
