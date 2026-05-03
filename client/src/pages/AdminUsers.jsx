import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminAPI } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';

const LINKS = [
  { to:'/dashboard', label:'Dashboard Overview', icon:'dashboard' },
  { to:'/dashboard/admin/ngos', label:'All NGOs', icon:'ngos' },
  { to:'/dashboard/admin/users', label:'All Users', icon:'users' },
  { divider:true },
  { to:'#', label:'Settings', icon:'settings' },
];

const ROLE_BADGE = { admin:'badge-red', ngo:'badge-blue', donor:'badge-green', volunteer:'badge-yellow' };
const ROLE_LABEL = { admin:'Admin', ngo:'NGO', donor:'Donor', volunteer:'Volunteer' };

export default function AdminUsers() {
  const { user } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    adminAPI.getUsers()
      .then(r => setUsers(r.data.users || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleBlock = async (id, name) => {
    if (!confirm(`Block/unblock ${name}?`)) return;
    setActionLoading(id);
    try {
      const res = await adminAPI.blockUser(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isBlocked: res.data.user.isBlocked } : u));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setActionLoading(null); }
  };

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch = !search || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const roleCounts = { all: users.length, admin: users.filter(u=>u.role==='admin').length, ngo: users.filter(u=>u.role==='ngo').length, donor: users.filter(u=>u.role==='donor').length, volunteer: users.filter(u=>u.role==='volunteer').length };

  return (
    <SidebarLayout links={LINKS} subLabel="ADMIN PANEL">
      <div className="page-enter">
        <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', marginBottom:6 }}>All Users</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:22 }}>View, search, and manage all platform users.</p>

        {/* Role stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:20 }}>
          {[['all','Total','👥'],['donor','Donors','💝'],['volunteer','Volunteers','🤝'],['ngo','NGOs','🏛️'],['admin','Admins','🔑']].map(([role, label, icon]) => (
            <div key={role} onClick={() => setRoleFilter(role)} className="stat-card" style={{ cursor:'pointer', padding:'14px 16px', border: roleFilter===role ? '2px solid var(--green)' : '1px solid var(--gray-200)' }}>
              <div style={{ fontSize:'1.2rem', marginBottom:4 }}>{icon}</div>
              <div style={{ fontWeight:800, fontSize:'1.3rem', color:'var(--navy)' }}>{roleCounts[role]||0}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--gray-500)' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:12, marginBottom:18, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:220 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="form-input" style={{ paddingLeft:32, fontSize:'0.85rem' }} />
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }}>🔍</span>
          </div>
        </div>

        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', overflow:'hidden' }}>
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Skills / Location</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:32 }}><span className="spinner" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:32, color:'var(--gray-400)' }}>No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u._id} style={{ opacity: u.isBlocked ? 0.55 : 1 }}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--gray-200)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem', color:'var(--gray-600)' }}>
                        {u.avatar ? <img src={u.avatar} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} /> : u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight:600, fontSize:'0.875rem' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize:'0.82rem', color:'var(--gray-500)' }}>{u.email}</td>
                  <td><span className={`badge ${ROLE_BADGE[u.role]||'badge-gray'}`} style={{ fontSize:'0.72rem' }}>{ROLE_LABEL[u.role]||u.role}</span></td>
                  <td style={{ fontSize:'0.78rem', color:'var(--gray-500)' }}>
                    {u.role === 'volunteer' && u.skills?.length > 0 ? u.skills.slice(0,2).join(', ') : (u.location || '—')}
                  </td>
                  <td style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
                  <td>
                    {u.isBlocked ?
                      <span className="badge badge-red" style={{ fontSize:'0.7rem' }}>🚫 Blocked</span> :
                      <span className="badge badge-green" style={{ fontSize:'0.7rem' }}>✓ Active</span>
                    }
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <button
                        className="btn btn-sm"
                        style={{ fontSize:'0.7rem', padding:'3px 10px', background: u.isBlocked ? 'var(--green)' : 'var(--red)', color:'white', border:'none' }}
                        disabled={actionLoading === u._id}
                        onClick={() => handleBlock(u._id, u.name)}
                      >
                        {actionLoading === u._id ? '...' : u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
}
