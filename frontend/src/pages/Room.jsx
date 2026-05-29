import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import api from '../api/axios';

export default function Room() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [sessionStart, setSessionStart] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [newMsgCount, setNewMsgCount] = useState(0);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api.get(`/rooms/${id}`).then(res => {
      setRoom(res.data);
      setMessages(res.data.messages || []);
      if (res.data.activeSession && res.data.currentSessionStart) {
        const start = new Date(res.data.currentSessionStart);
        setSessionStart(start);
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }
    }).catch(() => navigate('/dashboard'));
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    socketRef.current = io('/', { auth: { token } });
    socketRef.current.emit('join-room', id);
    socketRef.current.on('new-message', msg => {
      setMessages(prev => [...prev, msg]);
      if (activeTab !== 'chat') setNewMsgCount(c => c + 1);
    });
    socketRef.current.on('session-started', ({ startTime }) => {
      const start = new Date(startTime);
      setSessionStart(start); setElapsed(0);
      setRoom(prev => prev ? { ...prev, activeSession: true } : prev);
    });
    socketRef.current.on('session-ended', () => {
      setSessionStart(null); setElapsed(0);
      setRoom(prev => prev ? { ...prev, activeSession: false } : prev);
    });
    return () => { socketRef.current.emit('leave-room', id); socketRef.current.disconnect(); };
  }, [id]);

  useEffect(() => {
    if (sessionStart) {
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - sessionStart) / 1000)), 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [sessionStart]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current.emit('send-message', { roomId: id, text });
    setText('');
    inputRef.current?.focus();
  };

  const handleStartSession = async () => {
    try {
      const res = await api.post(`/rooms/${id}/start`);
      const start = new Date(res.data.startTime);
      setSessionStart(start); setElapsed(0);
      setRoom(prev => ({ ...prev, activeSession: true }));
      socketRef.current.emit('session-started', { roomId: id, startTime: res.data.startTime });
    } catch (err) { alert(err.response?.data?.message); }
  };

  const handleEndSession = async () => {
    try {
      const res = await api.post(`/rooms/${id}/end`);
      setSessionStart(null); setElapsed(0);
      setRoom(prev => ({
        ...prev, activeSession: false,
        sessions: [...(prev.sessions || []), { duration: res.data.duration, startedBy: { username: user.username }, startTime: new Date() }]
      }));
      socketRef.current.emit('session-ended', { roomId: id, duration: res.data.duration });
    } catch (err) { alert(err.response?.data?.message); }
  };

  const fmt = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const fmtDuration = (secs) => {
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
    return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const avatarGradient = (name) => {
    const g = ['linear-gradient(135deg,#7c3aed,#4f46e5)', 'linear-gradient(135deg,#0ea5e9,#06b6d4)', 'linear-gradient(135deg,#059669,#0d9488)', 'linear-gradient(135deg,#e11d48,#ec4899)', 'linear-gradient(135deg,#d97706,#f59e0b)'];
    return g[(name?.charCodeAt(0) || 0) % g.length];
  };

  if (!room) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f5f3ff,#f8faff)' }}>
      <div className="text-center animate-fade-in">
        <div className="w-12 h-12 rounded-full border-3 border-violet-200 border-t-violet-500 animate-spin-slow mx-auto mb-4" style={{ borderWidth: '3px' }} />
        <p className="text-gray-400 text-sm font-medium">Loading room...</p>
      </div>
    </div>
  );

  const progressPct = Math.min((elapsed % 3600) / 36, 100);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'linear-gradient(160deg,#f5f3ff 0%,#f8faff 60%,#f0f9ff 100%)' }}>
      {/* Header */}
      <header className="px-5 py-3.5 flex justify-between items-center shrink-0 animate-fade-in" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(196,181,253,0.25)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-violet-600 transition font-medium px-2 py-1 rounded-lg hover:bg-violet-50">
            ← <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <div>
            <h1 className="font-bold text-gray-900 text-sm">{room.name}</h1>
            {room.description && <p className="text-gray-400 text-xs">{room.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest" style={{ background: '#f3f4f6', color: '#9ca3af' }}>
            🔑 {room.inviteCode}
          </div>
          {room.activeSession && (
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#d1fae5', color: '#059669', border: '1px solid #6ee7b7' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono tabular-nums">{fmt(elapsed)}</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 flex flex-col shrink-0 overflow-y-auto animate-slide-right" style={{ background: 'rgba(255,255,255,0.7)', borderRight: '1px solid rgba(196,181,253,0.2)' }}>
          {/* Session */}
          <div className="p-4" style={{ borderBottom: '1px solid rgba(196,181,253,0.2)' }}>
            <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Session</p>
            {room.activeSession ? (
              <div className="animate-fade-in">
                <div className="text-center mb-3 p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg,#d1fae5,#ccfbf1)', border: '1px solid #6ee7b7' }}>
                  <div className="text-2xl font-mono font-bold tabular-nums animate-timer-pulse" style={{ color: '#059669' }}>
                    {fmt(elapsed)}
                  </div>
                  <p className="text-xs mt-1 font-medium" style={{ color: '#34d399' }}>in progress</p>
                </div>
                {/* Progress bar */}
                <div className="w-full rounded-full h-1.5 mb-3 overflow-hidden" style={{ background: '#e5e7eb' }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg,#059669,#0d9488)' }} />
                </div>
                <button onClick={handleEndSession} className="btn btn-red w-full text-xs py-2">■ End session</button>
              </div>
            ) : (
              <button onClick={handleStartSession} className="btn btn-green w-full text-sm py-2.5">▶ Start session</button>
            )}
          </div>

          {/* Members */}
          <div className="p-4 flex-1">
            <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Members · {room.members?.length}</p>
            <div className="space-y-2.5">
              {room.members?.map((m, i) => (
                <div key={m._id} className={`flex items-center gap-2.5 animate-wave delay-${i * 50}`}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm" style={{ background: avatarGradient(m.username) }}>
                    {m.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-600 truncate font-medium">{m.username}</span>
                  {(room.owner?._id === m._id || room.owner === m._id) && (
                    <span className="ml-auto text-xs" style={{ color: '#f59e0b' }}>★</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex shrink-0" style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(196,181,253,0.2)' }}>
            {[{ key: 'chat', label: 'Chat', icon: '💬' }, { key: 'activity', label: 'History', icon: '📊' }].map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); if (tab.key === 'chat') setNewMsgCount(0); }}
                className={`relative px-5 py-3 text-sm font-semibold transition flex items-center gap-2 ${activeTab === tab.key ? 'text-violet-600 border-b-2 border-violet-500' : 'text-gray-400 hover:text-gray-600'}`}>
                {tab.icon} {tab.label}
                {tab.key === 'chat' && newMsgCount > 0 && activeTab !== 'chat' && (
                  <span className="absolute top-2 right-1.5 w-4 h-4 rounded-full text-xs flex items-center justify-center text-white font-bold animate-badge" style={{ background: '#7c3aed' }}>
                    {newMsgCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'chat' ? (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center mt-16 animate-fade-up">
                    <div className="animate-float inline-block text-5xl mb-3">💬</div>
                    <p className="text-gray-400 font-medium">No messages yet</p>
                    <p className="text-gray-300 text-sm mt-1">Say something to get started!</p>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMe = msg.senderName === user?.username;
                  return (
                    <div key={i} className={`flex gap-2.5 animate-msg ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 shadow-sm" style={{ background: avatarGradient(msg.senderName) }}>
                        {msg.senderName?.[0]?.toUpperCase()}
                      </div>
                      <div className={`flex flex-col max-w-xs ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs text-gray-400 font-medium">{msg.senderName}</span>
                          <span className="text-xs text-gray-300">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'text-white rounded-tr-sm' : 'rounded-tl-sm'}`}
                          style={isMe
                            ? { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }
                            : { background: '#ffffff', border: '1px solid #e8e6f0', color: '#374151' }}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="px-4 py-3 flex gap-2" style={{ background: 'rgba(255,255,255,0.9)', borderTop: '1px solid rgba(196,181,253,0.2)' }}>
                <input ref={inputRef} value={text} onChange={e => setText(e.target.value)}
                  placeholder="Message the group..."
                  className="input flex-1 py-2.5 text-sm" style={{ borderRadius: '12px' }} />
                <button type="submit" disabled={!text.trim()} className="btn btn-violet px-4 py-2.5 text-sm" style={{ opacity: text.trim() ? 1 : 0.4 }}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {!room.sessions?.length ? (
                <div className="text-center mt-16 animate-fade-up">
                  <div className="animate-float inline-block text-5xl mb-3">⏱️</div>
                  <p className="text-gray-400 font-medium">No sessions yet</p>
                  <p className="text-gray-300 text-sm mt-1">Start a session to begin tracking</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...room.sessions].reverse().map((sess, i) => (
                    <div key={i} className={`card animate-card delay-${Math.min(i * 100, 400)} flex justify-between items-center px-5 py-4`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: 'linear-gradient(135deg,#d1fae5,#ccfbf1)', border: '1px solid #6ee7b7' }}>⚡</div>
                        <div>
                          <p className="text-sm font-bold text-gray-700">Session #{room.sessions.length - i}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(sess.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            {' · '}
                            {new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {sess.startedBy?.username && ` · by ${sess.startedBy.username}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold tabular-nums px-3 py-1.5 rounded-xl" style={{ background: 'linear-gradient(135deg,#d1fae5,#ccfbf1)', color: '#059669', border: '1px solid #6ee7b7' }}>
                        {fmtDuration(sess.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
