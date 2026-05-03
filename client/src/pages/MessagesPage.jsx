import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { messageAPI } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';

const LINKS = [
  { to:'/dashboard',          label:'Dashboard', icon:'dashboard' },
  { to:'/dashboard/messages', label:'Messages',  icon:'feedback'  },
  { to:'/dashboard/profile',  label:'Profile',   icon:'profile'   },
];

const ROLE_COLOR = {
  donor:'#10B981', volunteer:'#F59E0B', ngo:'#3B82F6', admin:'#EF4444',
};

function Avatar({ name, role, size = 36 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background: ROLE_COLOR[role] || '#9CA3AF',
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'white', fontWeight:700, fontSize: size * 0.38,
    }}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

function formatTime(d) {
  if (!d) return '';
  const dt   = new Date(d);
  const now  = new Date();
  const diff = now - dt;
  if (diff < 60000)    return 'just now';
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return dt.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  return dt.toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
}

export default function MessagesPage() {
  const { userId }  = useParams();
  const { user }    = useAuth();
  const toast       = useToast();
  const navigate    = useNavigate();
  const bottomRef   = useRef(null);
  const pollRef     = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [messages,      setMessages]      = useState([]);
  const [content,       setContent]       = useState('');
  const [convLoading,   setConvLoading]   = useState(true);
  const [chatLoading,   setChatLoading]   = useState(false);
  const [sending,       setSending]       = useState(false);
  const [activePeer,    setActivePeer]    = useState(null); // { _id, name, role }

  // ── Load conversations ────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const res = await messageAPI.getConversations();
      setConversations(res.data.conversations || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    loadConversations().finally(() => setConvLoading(false));
  }, [loadConversations]);

  // ── Load chat when userId param changes ───────────────────────────────────
  const loadChat = useCallback(async (uid) => {
    if (!uid) return;
    try {
      const res = await messageAPI.getChat(uid);
      setMessages(res.data.messages || []);
      // Also derive peer info from messages if not already set
      const msgs = res.data.messages || [];
      if (msgs.length > 0 && !activePeer) {
        const last = msgs[msgs.length - 1];
        const peer = last.sender._id === user._id || last.sender._id?.toString() === user._id?.toString()
          ? last.receiver : last.sender;
        setActivePeer(peer);
      }
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 60);
    } catch { /* silent */ }
  }, [activePeer, user._id]);

  useEffect(() => {
    if (!userId) { setMessages([]); return; }
    setChatLoading(true);
    loadChat(userId).finally(() => setChatLoading(false));

    // Poll for new messages every 3s
    pollRef.current = setInterval(() => loadChat(userId), 3000);
    return () => clearInterval(pollRef.current);
  }, [userId]); // eslint-disable-line

  // Refresh conversations every 6s (for unread badges)
  useEffect(() => {
    const iv = setInterval(loadConversations, 6000);
    return () => clearInterval(iv);
  }, [loadConversations]);

  // ── Open a conversation ───────────────────────────────────────────────────
  const openChat = (conv) => {
    setActivePeer(conv.user);
    navigate(`/dashboard/messages/${conv.user._id}`);
    // Mark as read optimistically
    setConversations(prev => prev.map(c =>
      c.user._id === conv.user._id ? { ...c, unread:0 } : c
    ));
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!content.trim() || !userId) return;
    setSending(true);
    const text = content.trim();
    setContent('');
    try {
      const res = await messageAPI.send({ receiver:userId, content:text });
      setMessages(prev => [...prev, res.data.message]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 60);
      loadConversations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
      setContent(text); // restore on failure
    } finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Determine peer from conversations or active state
  const peer = activePeer || conversations.find(c => c.user._id === userId)?.user;

  const myId = user?._id?.toString();

  return (
    <SidebarLayout links={LINKS}>
      <div className="page-enter" style={{ display:'flex', gap:0, height:'calc(100vh - 120px)', overflow:'hidden', borderRadius:12, border:'1px solid var(--gray-200)', background:'white' }}>

        {/* ── Left: Conversation list ── */}
        <div style={{ width:300, flexShrink:0, borderRight:'1px solid var(--gray-200)', display:'flex', flexDirection:'column', background:'white' }}>
          <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--gray-100)' }}>
            <div style={{ fontWeight:700, fontSize:'1rem', color:'var(--navy)' }}>Messages</div>
            <div style={{ fontSize:'0.72rem', color:'var(--gray-400)', marginTop:2 }}>
              {convLoading ? 'Loading...' : `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`}
            </div>
          </div>

          <div style={{ overflowY:'auto', flex:1 }}>
            {convLoading ? (
              <div style={{ padding:32, textAlign:'center' }}><span className="spinner" /></div>
            ) : conversations.length === 0 ? (
              <div style={{ padding:'44px 20px', textAlign:'center', color:'var(--gray-400)' }}>
                <div style={{ fontSize:'2rem', marginBottom:8 }}>💬</div>
                <div style={{ fontWeight:600, color:'var(--navy)', fontSize:'0.875rem', marginBottom:6 }}>No messages yet</div>
                <p style={{ fontSize:'0.78rem', lineHeight:1.6 }}>
                  Visit an NGO profile and click "💬 Message" to start a conversation.
                </p>
              </div>
            ) : conversations.map((conv, i) => {
              const isActive = conv.user._id === userId || conv.user._id?.toString() === userId;
              return (
                <div key={i} onClick={() => openChat(conv)} style={{
                  padding:'13px 18px', cursor:'pointer',
                  background: isActive ? 'var(--green-pale)' : 'white',
                  borderBottom:'1px solid var(--gray-50)',
                  borderLeft: isActive ? '3px solid var(--green)' : '3px solid transparent',
                  transition:'background 0.15s',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ position:'relative' }}>
                      <Avatar name={conv.user.name} role={conv.user.role} size={38} />
                      {conv.unread > 0 && (
                        <div style={{ position:'absolute', top:-3, right:-3, width:17, height:17, borderRadius:'50%', background:'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem', color:'white', fontWeight:700, border:'2px solid white' }}>
                          {conv.unread > 9 ? '9+' : conv.unread}
                        </div>
                      )}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                        <span style={{ fontWeight: conv.unread > 0 ? 700 : 600, fontSize:'0.875rem', color:'var(--navy)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:120 }}>{conv.user.name}</span>
                        <span style={{ fontSize:'0.65rem', color:'var(--gray-400)', flexShrink:0 }}>{formatTime(conv.lastAt)}</span>
                      </div>
                      <div style={{ fontSize:'0.75rem', color:'var(--gray-500)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:1 }}>
                        {conv.lastMessage}
                      </div>
                      <span style={{ fontSize:'0.62rem', fontWeight:700, color:ROLE_COLOR[conv.user.role]||'var(--gray-400)', textTransform:'capitalize' }}>
                        {conv.user.role}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: Chat area ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {!userId ? (
            /* Empty state */
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--gray-400)', padding:40 }}>
              <div style={{ fontSize:'3.5rem', marginBottom:14 }}>💬</div>
              <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'1.1rem', marginBottom:8 }}>Select a conversation</div>
              <p style={{ fontSize:'0.875rem', textAlign:'center', maxWidth:300, lineHeight:1.65 }}>
                Choose a conversation from the left, or visit an NGO page and click "💬 Message" to start a new chat.
              </p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding:'13px 20px', borderBottom:'1px solid var(--gray-100)', display:'flex', alignItems:'center', gap:12, background:'white' }}>
                {peer ? (
                  <>
                    <Avatar name={peer.name} role={peer.role} size={34} />
                    <div>
                      <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--navy)' }}>{peer.name}</div>
                      <div style={{ fontSize:'0.7rem', color:ROLE_COLOR[peer.role]||'var(--gray-400)', textTransform:'capitalize', fontWeight:600 }}>{peer.role}</div>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize:'0.875rem', color:'var(--gray-500)' }}>Loading...</div>
                )}
              </div>

              {/* Messages */}
              <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:8 }}>
                {chatLoading ? (
                  <div style={{ display:'flex', justifyContent:'center', padding:24 }}><span className="spinner" /></div>
                ) : messages.length === 0 ? (
                  <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--gray-400)' }}>
                    <div style={{ fontSize:'2rem', marginBottom:8 }}>👋</div>
                    <p style={{ fontSize:'0.875rem' }}>Send your first message!</p>
                  </div>
                ) : messages.map((msg, i) => {
                  const senderId = msg.sender?._id?.toString() || msg.sender?.toString();
                  const isMine   = senderId === myId;
                  return (
                    <div key={msg._id || i} style={{ display:'flex', flexDirection: isMine ? 'row-reverse' : 'row', alignItems:'flex-end', gap:8 }}>
                      {!isMine && <Avatar name={msg.sender?.name} role={msg.sender?.role} size={28} />}
                      <div style={{
                        maxWidth:'68%',
                        padding:'10px 14px',
                        borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background:   isMine ? 'var(--green)'   : 'var(--gray-100)',
                        color:        isMine ? 'white'          : 'var(--navy)',
                        boxShadow:    isMine ? 'none'           : 'var(--shadow-sm)',
                      }}>
                        <div style={{ fontSize:'0.875rem', lineHeight:1.55, wordBreak:'break-word' }}>{msg.content}</div>
                        <div style={{ fontSize:'0.62rem', marginTop:4, opacity:0.65, textAlign: isMine ? 'right' : 'left' }}>
                          {formatTime(msg.createdAt)}
                          {isMine && <span style={{ marginLeft:6 }}>{msg.read ? '✓✓' : '✓'}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding:'12px 16px', borderTop:'1px solid var(--gray-100)', background:'white' }}>
                <form onSubmit={handleSend} style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
                  <textarea
                    className="form-input"
                    placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    style={{ flex:1, resize:'none', padding:'10px 14px', lineHeight:1.5, maxHeight:100, overflowY:'auto' }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sending || !content.trim()}
                    style={{ padding:'10px 20px', flexShrink:0, height:42 }}
                  >
                    {sending
                      ? <span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white', width:14, height:14 }} />
                      : '↑ Send'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
