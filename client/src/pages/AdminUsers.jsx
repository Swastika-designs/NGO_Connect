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

  useEffect(() => {
    adminAPI.getUsers()
      .then(r => setUsers(r.data.users || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const topRight = (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ width:26, height:26, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.78rem' }}>{user?.name?.charAt(0)}</div>
      <span style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--navy)' }}>{user?.name}</span>
    </div>
  );

  const roleCounts = { all: users.length, admin: users.filter(u=>u.role==='admin').length, ngo: users.filter(u=>u.role==='ngo').length, donor: users.filter(u=>u.role==='donor').length, volunteer: users.filter(u=>u.role==='volunteer').length };

  return (
    <SidebarLayout links={LINKS} subLabel="ADMIN PANEL" topRight={topRight}>
      <div className="page-enter">
        <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', marginBottom:6 }}>All Users</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:22 }}>View all registered users across roles.</p>

        <div style={{ display:'flex', gap:12, marginBottom:18, flexWrap:'wrap' }}>
          <div style={{ position:'relative' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="form-input" style={{ paddingLeft:32, width:260, fontSize:'0.85rem' }} />
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }}>🔍</span>
          </div>
          <div style={{ display:'flex', gap:5 }}>
            {[['all','All'], ['donor','Donors'], ['volunteer','Volunteers'], ['ngo','NGOs'], ['admin','Admins']].map(([v,l]) => (
              <button key={v} onClick={() => setRoleFilter(v)} style={{
                padding:'7px 14px', borderRadius:7, border:'1.5px solid', cursor:'pointer', fontWeight:600, fontSize:'0.8rem',
                borderColor: roleFilter === v ? 'var(--green)' : 'var(--gray-200)',
                background: roleFilter === v ? 'var(--green-pale)' : 'white',
                color: roleFilter === v ? 'var(--green)' : 'var(--gray-600)',
              }}>{l} ({roleCounts[v] || 0})</button>
            ))}
          </div>
        </div>

        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 22px' }}>
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign:'center', padding:32 }}><span className="spinner" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign:'center', padding:32, color:'var(--gray-400)' }}>No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--gray-200)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem', color:'var(--gray-600)' }}>{u.name?.charAt(0).toUpperCase()}</div>
                      <span style={{ fontWeight:600, fontSize:'0.875rem' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize:'0.82rem', color:'var(--gray-500)' }}>{u.email}</td>
                  <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-gray'}`} style={{ fontSize:'0.72rem', textTransform:'capitalize' }}>{ROLE_LABEL[u.role] || u.role}</span></td>
                  <td style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
}
