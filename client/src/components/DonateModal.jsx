import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { donationAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const PRESETS = [100, 500, 1000, 2500, 5000, 10000];

export default function DonateModal({ ngo, onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Guard: NGO and admin users cannot donate
  if (user && (user.role === 'ngo' || user.role === 'admin')) return null;
  const [amount, setAmount] = useState('');
  const [custom, setCustom] = useState('');
  const [message, setMessage] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(false);

  const finalAmt = amount === 'custom' ? parseInt(custom) : parseInt(amount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!finalAmt || finalAmt < 1) return toast.error('Enter a valid amount');
    setLoading(true);
    try {
      await donationAPI.create({ ngo: ngo._id, amount: finalAmt, message, isAnonymous: isAnon, paymentMethod: method });
      toast.success(`✅ Donated ₹${finalAmt.toLocaleString()} to ${ngo.name}!`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Donation failed');
    } finally { setLoading(false); }
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(17,24,39,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:16, backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:16, width:'100%', maxWidth:460, maxHeight:'90vh', overflowY:'auto', boxShadow:'var(--shadow-lg)', animation:'fadeUp 0.25s ease' }}>
        <div style={{ padding:'22px 24px', borderBottom:'1px solid var(--gray-200)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.08em', color:'var(--green)', textTransform:'uppercase', marginBottom:2 }}>Donating to</p>
            <h2 style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--navy)' }}>{ngo.name}</h2>
          </div>
          <button onClick={onClose} style={{ background:'var(--gray-100)', border:'none', borderRadius:'50%', width:30, height:30, fontSize:'1.1rem', cursor:'pointer' }}>×</button>
        </div>

        {!user ? (
          <div style={{ padding:28, textAlign:'center' }}>
            <p style={{ marginBottom:20, color:'var(--gray-600)' }}>Sign in to make a donation.</p>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/login')}>Sign In</button>
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding:24 }}>
            <div className="form-group">
              <label className="form-label">Select Amount (₹)</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:10 }}>
                {PRESETS.map(a => (
                  <button key={a} type="button" onClick={() => { setAmount(String(a)); setCustom(''); }}
                    style={{ padding:'10px 8px', borderRadius:6, border:'1.5px solid', cursor:'pointer', transition:'all 0.15s', fontWeight:600, fontSize:'0.875rem',
                      borderColor: amount === String(a) ? 'var(--green)' : 'var(--gray-200)',
                      background: amount === String(a) ? 'var(--green-pale)' : 'var(--gray-50)',
                      color: amount === String(a) ? 'var(--green)' : 'var(--navy)',
                    }}>₹{a.toLocaleString()}</button>
                ))}
              </div>
              <input type="number" placeholder="Custom amount" className="form-input" value={custom}
                onChange={e => { setCustom(e.target.value); setAmount('custom'); }} min="1" />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select className="form-input" value={method} onChange={e => setMethod(e.target.value)}>
                <option value="upi">UPI</option>
                <option value="card">Credit / Debit Card</option>
                <option value="netbanking">Net Banking</option>
                <option value="wallet">Wallet</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Message (optional)</label>
              <textarea className="form-input" rows={2} placeholder="Leave a message of support..." value={message} onChange={e => setMessage(e.target.value)} style={{ resize:'vertical' }} />
            </div>

            <label style={{ display:'flex', gap:8, alignItems:'center', marginBottom:20, cursor:'pointer' }}>
              <input type="checkbox" checked={isAnon} onChange={e => setIsAnon(e.target.checked)} style={{ accentColor:'var(--green)', width:15, height:15 }} />
              <span style={{ fontSize:'0.875rem', color:'var(--gray-600)' }}>Donate anonymously</span>
            </label>

            {finalAmt > 0 && (
              <div style={{ background:'var(--green-pale)', borderRadius:8, padding:'12px 16px', marginBottom:14, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:'0.875rem', color:'var(--gray-600)' }}>Total</span>
                <span style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--green)' }}>₹{finalAmt.toLocaleString()}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', justifyContent:'center', padding:14 }}>
              {loading ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} /> Processing...</> : `Donate ${finalAmt ? `₹${finalAmt.toLocaleString()}` : ''}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
