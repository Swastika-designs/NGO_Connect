import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ngoAPI } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';

const LINKS = [
  { to:'/dashboard', label:'Dashboard Overview', icon:'dashboard' },
  { to:'/dashboard/admin/ngos', label:'All NGOs', icon:'ngos' },
  { to:'/dashboard/admin/users', label:'All Users', icon:'users' },
  { divider:true },
  { to:'#', label:'Settings', icon:'settings' },
];

export default function AdminNGOs() {
  const { user } = useAuth();
  const toast = useToast();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    ngoAPI.getAllAdmin()
      .then(r => setNgos(r.data.ngos || []))
      .catch(() => toast.error('Failed to load NGOs'))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id + '_a');
    try {
      await ngoAPI.approve(id);
      setNgos(prev => prev.map(n => n._id === id ? { ...n, isApproved:true, isVerified:true } : n));
      toast.success('NGO approved ✅');
    } catch { toast.error('Failed'); } finally { setActionLoading(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this NGO permanently?')) return;
    setActionLoading(id + '_d');
    try {
      await ngoAPI.delete(id);
      setNgos(prev => prev.filter(n => n._id !== id));
      toast.success('NGO deleted');
    } catch { toast.error('Failed'); } finally { setActionLoading(null); }
  };

  const filtered = filter === 'all' ? ngos : filter === 'approved' ? ngos.filter(n => n.isApproved) : ngos.filter(n => !n.isApproved);

  const topRight = (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ width:26, height:26, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.78rem' }}>{user?.name?.charAt(0)}</div>
      <span style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--navy)' }}>{user?.name}</span>
    </div>
  );

  return (
    <SidebarLayout links={LINKS} subLabel="ADMIN PANEL" topRight={topRight}>
      <div className="page-enter">
        <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'var(--navy)', marginBottom:6 }}>All NGOs</h1>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:22 }}>Manage all registered NGOs on the platform.</p>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:18 }}>
          {[['all','All'], ['approved','Approved'], ['pending','Pending']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{
              padding:'7px 16px', borderRadius:7, border:'1.5px solid', cursor:'pointer', fontWeight:600, fontSize:'0.83rem',
              borderColor: filter === v ? 'var(--green)' : 'var(--gray-200)',
              background: filter === v ? 'var(--green-pale)' : 'white',
              color: filter === v ? 'var(--green)' : 'var(--gray-600)',
            }}>{l} <span style={{ fontWeight:400 }}>({v === 'all' ? ngos.length : v === 'approved' ? ngos.filter(n=>n.isApproved).length : ngos.filter(n=>!n.isApproved).length})</span></button>
          ))}
        </div>

        <div style={{ background:'white', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px 22px' }}>
          <table className="table">
            <thead><tr><th>Name</th><th>Category</th><th>Status</th><th>Created By</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:32 }}><span className="spinner" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:32, color:'var(--gray-400)' }}>No NGOs found</td></tr>
              ) : filtered.map(ngo => (
                <tr key={ngo._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:28, height:28, borderRadius:6, background:'var(--green-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.75rem', color:'var(--green)' }}>{ngo.name?.charAt(0)}</div>
                      <span style={{ fontWeight:600, fontSize:'0.85rem' }}>{ngo.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-gray" style={{ fontSize:'0.72rem' }}>{ngo.category}</span></td>
                  <td>
                    <span className={`badge ${ngo.isApproved ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize:'0.72rem' }}>
                      {ngo.isApproved ? '✓ Approved' : '⏳ Pending'}
                    </span>
                  </td>
                  <td style={{ fontSize:'0.82rem', color:'var(--gray-600)' }}>{ngo.createdBy?.name || '—'}</td>
                  <td style={{ fontSize:'0.8rem', color:'var(--gray-500)' }}>{new Date(ngo.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
                  <td>
                    <div style={{ display:'flex', gap:5 }}>
                      {!ngo.isApproved && (
                        <button className="btn btn-primary btn-sm" style={{ fontSize:'0.7rem', padding:'3px 9px' }} disabled={!!actionLoading} onClick={() => handleApprove(ngo._id)}>
                          {actionLoading === ngo._id+'_a' ? '...' : 'Approve'}
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" style={{ fontSize:'0.7rem', padding:'3px 9px' }} disabled={!!actionLoading} onClick={() => handleDelete(ngo._id)}>
                        {actionLoading === ngo._id+'_d' ? '...' : 'Delete'}
                      </button>
                    </div>
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
