import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { donationAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const MONEY_PRESETS = [100, 500, 1000, 2500, 5000, 10000];
const GOODS_CATEGORIES = [
  { value:'clothes',     label:'👕 Clothes & Apparel' },
  { value:'food',        label:'🍱 Food & Groceries' },
  { value:'electronics', label:'💻 Electronics' },
  { value:'books',       label:'📚 Books & Stationery' },
  { value:'furniture',   label:'🪑 Furniture' },
  { value:'toys',        label:'🧸 Toys & Games' },
  { value:'medical',     label:'💊 Medical Supplies' },
  { value:'other',       label:'📦 Other' },
];

export default function DonateModal({ ngo, onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  if (user && (user.role === 'ngo' || user.role === 'admin')) return null;

  const [donationType, setDonationType] = useState('money');
  const [amount, setAmount]   = useState('');
  const [custom, setCustom]   = useState('');
  const [method, setMethod]   = useState('upi');
  const [goodsCat,   setGoodsCat]   = useState('clothes');
  const [goodsDesc,  setGoodsDesc]  = useState('');
  const [goodsQty,   setGoodsQty]   = useState('');
  const [pickup,     setPickup]     = useState('donor_dropoff');
  const [pickupAddr, setPickupAddr] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [message,  setMessage]  = useState('');
  const [isAnon,   setIsAnon]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const finalAmt = amount === 'custom' ? parseInt(custom) : parseInt(amount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (donationType === 'money' && (!finalAmt || finalAmt < 1)) return toast.error('Enter a valid amount');
    if (donationType === 'goods' && !goodsDesc.trim()) return toast.error('Please describe what you are donating');
    if (donationType === 'goods' && pickup === 'ngo_pickup' && !pickupAddr.trim()) return toast.error('Please provide a pickup address');
    setLoading(true);
    try {
      const payload = { ngo: ngo._id, donationType, message, isAnonymous: isAnon };
      if (donationType === 'money') {
        Object.assign(payload, { amount: finalAmt, paymentMethod: method });
      } else {
        Object.assign(payload, { goodsCategory: goodsCat, goodsDescription: goodsDesc, goodsQuantity: goodsQty, pickupMethod: pickup, pickupAddress: pickupAddr, pickupDate: pickupDate || undefined });
      }
      await donationAPI.create(payload);
      toast.success(donationType === 'money' ? `Donated ₹${finalAmt.toLocaleString()} to ${ngo.name}!` : `Goods donation submitted to ${ngo.name}!`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Donation failed');
    } finally { setLoading(false); }
  };

  const tabBtn = (val, icon, label) => (
    <button type="button" onClick={() => setDonationType(val)} style={{ flex:1, padding:'11px 8px', borderRadius:7, border:'1.5px solid', cursor:'pointer', fontWeight:700, fontSize:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center', gap:5, transition:'all 0.15s', borderColor:donationType===val?'var(--green)':'var(--gray-200)', background:donationType===val?'var(--green-pale)':'var(--gray-50)', color:donationType===val?'var(--green)':'var(--gray-500)' }}>
      {icon} {label}
    </button>
  );

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(17,24,39,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:16, backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:16, width:'100%', maxWidth:490, maxHeight:'92vh', overflowY:'auto', boxShadow:'var(--shadow-lg)' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--gray-200)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
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
          <form onSubmit={handleSubmit} style={{ padding:22 }}>
            {/* Type toggle */}
            <div style={{ marginBottom:16 }}>
              <label className="form-label" style={{ marginBottom:8 }}>What would you like to donate?</label>
              <div style={{ display:'flex', gap:8 }}>
                {tabBtn('money','💳','Money')}
                {tabBtn('goods','📦','Goods / Items')}
              </div>
            </div>

            {/* NGO needs hint */}
            {ngo.ngoNeeds?.filter(n=>n.isActive).length > 0 && (
              <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:'0.8rem' }}>
                <div style={{ fontWeight:700, color:'#1D4ED8', marginBottom:5 }}>📋 What this NGO currently needs:</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {ngo.ngoNeeds.filter(n=>n.isActive).map((need,i)=>(
                    <span key={i} style={{ padding:'3px 9px', borderRadius:100, fontSize:'0.72rem', fontWeight:600, background:need.urgency==='high'?'#FEE2E2':need.urgency==='medium'?'#FEF3C7':'#D1FAE5', color:need.urgency==='high'?'#991B1B':need.urgency==='medium'?'#92400E':'#065F46' }}>
                      {need.urgency==='high'?'🔴 ':need.urgency==='medium'?'🟡 ':'🟢 '}{need.category} — {need.description}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* MONEY */}
            {donationType === 'money' && (<>
              <div className="form-group">
                <label className="form-label">Select Amount (₹)</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:10 }}>
                  {MONEY_PRESETS.map(a => (
                    <button key={a} type="button" onClick={() => { setAmount(String(a)); setCustom(''); }} style={{ padding:'10px 8px', borderRadius:6, border:'1.5px solid', cursor:'pointer', fontWeight:600, fontSize:'0.875rem', transition:'all 0.15s', borderColor:amount===String(a)?'var(--green)':'var(--gray-200)', background:amount===String(a)?'var(--green-pale)':'var(--gray-50)', color:amount===String(a)?'var(--green)':'var(--navy)' }}>₹{a.toLocaleString()}</button>
                  ))}
                </div>
                <input type="number" placeholder="Custom amount (₹)" className="form-input" value={custom} onChange={e => { setCustom(e.target.value); setAmount('custom'); }} min="1" />
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
              {finalAmt > 0 && (
                <div style={{ background:'var(--green-pale)', borderRadius:8, padding:'12px 16px', marginBottom:14, display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'0.875rem', color:'var(--gray-600)' }}>Total</span>
                  <span style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--green)' }}>₹{finalAmt.toLocaleString()}</span>
                </div>
              )}
            </>)}

            {/* GOODS */}
            {donationType === 'goods' && (<>
              <div className="form-group">
                <label className="form-label">Category <span style={{ color:'var(--red)' }}>*</span></label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
                  {GOODS_CATEGORIES.map(cat => (
                    <button key={cat.value} type="button" onClick={() => setGoodsCat(cat.value)} style={{ padding:'9px 10px', borderRadius:7, border:'1.5px solid', cursor:'pointer', fontWeight:600, fontSize:'0.8rem', textAlign:'left', transition:'all 0.15s', borderColor:goodsCat===cat.value?'var(--green)':'var(--gray-200)', background:goodsCat===cat.value?'var(--green-pale)':'var(--gray-50)', color:goodsCat===cat.value?'var(--green)':'var(--gray-700)' }}>{cat.label}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description <span style={{ color:'var(--red)' }}>*</span></label>
                <textarea className="form-input" rows={2} style={{ resize:'vertical' }} placeholder="e.g. 10 winter jackets, adult sizes M and L, good condition" value={goodsDesc} onChange={e => setGoodsDesc(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" placeholder="e.g. 10 items, 5 kg, 2 boxes" value={goodsQty} onChange={e => setGoodsQty(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">How will goods be transferred? <span style={{ color:'var(--red)' }}>*</span></label>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[
                    { val:'donor_dropoff', icon:'🚶', title:'I will drop off', desc:'You bring items to the NGO' },
                    { val:'ngo_pickup',    icon:'🚐', title:'NGO arranges pickup', desc:'NGO collects from your address' },
                  ].map(opt => (
                    <label key={opt.val} onClick={() => setPickup(opt.val)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:9, border:'1.5px solid', cursor:'pointer', transition:'all 0.15s', borderColor:pickup===opt.val?'var(--green)':'var(--gray-200)', background:pickup===opt.val?'var(--green-pale)':'var(--gray-50)' }}>
                      <span style={{ fontSize:'1.3rem' }}>{opt.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--navy)' }}>{opt.title}</div>
                        <div style={{ fontSize:'0.75rem', color:'var(--gray-500)' }}>{opt.desc}</div>
                      </div>
                      <div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid', flexShrink:0, borderColor:pickup===opt.val?'var(--green)':'var(--gray-300)', background:pickup===opt.val?'var(--green)':'transparent' }} />
                    </label>
                  ))}
                </div>
              </div>
              {pickup === 'ngo_pickup' && (<>
                <div className="form-group">
                  <label className="form-label">Your Pickup Address <span style={{ color:'var(--red)' }}>*</span></label>
                  <textarea className="form-input" rows={2} style={{ resize:'vertical' }} placeholder="Full address for pickup (street, area, city, pincode)" value={pickupAddr} onChange={e => setPickupAddr(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Pickup Date</label>
                  <input type="date" className="form-input" value={pickupDate} min={new Date().toISOString().split('T')[0]} onChange={e => setPickupDate(e.target.value)} />
                </div>
              </>)}
            </>)}

            <div className="form-group">
              <label className="form-label">Message (optional)</label>
              <textarea className="form-input" rows={2} style={{ resize:'vertical' }} placeholder="Leave a message of support..." value={message} onChange={e => setMessage(e.target.value)} />
            </div>

            <label style={{ display:'flex', gap:8, alignItems:'center', marginBottom:18, cursor:'pointer' }}>
              <input type="checkbox" checked={isAnon} onChange={e => setIsAnon(e.target.checked)} style={{ accentColor:'var(--green)', width:15, height:15 }} />
              <span style={{ fontSize:'0.875rem', color:'var(--gray-600)' }}>Donate anonymously</span>
            </label>

            <div style={{ display:'flex', gap:10 }}>
              <button type="button" className="btn btn-outline" style={{ flex:1, justifyContent:'center' }} onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex:2, justifyContent:'center', padding:13 }}>
                {loading ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} /> Processing...</> : donationType==='money' ? `Donate ${finalAmt?`₹${finalAmt.toLocaleString()}`:''}` : '📦 Submit Goods Donation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
