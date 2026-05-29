import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get('/rooms').then(res => { setRooms(res.data); setLoaded(true); }).catch(console.error);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/rooms', newRoom);
      setRooms(prev => [...prev, res.data]);
      setShowCreate(false);
      setNewRoom({ name: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/rooms/join', { inviteCode });
      if (!rooms.find(r => r._id === res.data._id)) setRooms(prev => [...prev, res.data]);
      setShowJoin(false);
      setInviteCode('');
      navigate(`/room/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid invite code');
    }
  };

  const totalSessions = rooms.reduce((acc, r) => acc + (r.sessions?.length || 0), 0);
  const totalSecs = rooms.reduce((acc, r) => acc + (r.sessions || []).reduce((s, sess) => s + (sess.duration || 0), 0), 0);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const avatarGradient = (name) => {
    const g = [
      'linear-gradient(135deg,#7c3aed,#4f46e5)',
      'linear-gradient(135deg,#0ea5e9,#06b6d4)',
      'linear-gradient(135deg,#059669,#0d9488)',
      'linear-gradient(135deg,#e11d48,#ec4899)',
      'linear-gradient(135deg,#d97706,#f59e0b)',
    ];
    return g[(name?.charCodeAt(0) || 0) % g.length];
  };

  const stats = [
    { label: 'Rooms joined', value: rooms.length, icon: '🏠', accent: '#7c3aed', bg: 'linear-gradient(135deg,#ede9fe,#e0e7ff)', border: '#c4b5fd' },
    { label: 'Sessions done', value: totalSessions, icon: '⚡', accent: '#059669', bg: 'linear-gradient(135deg,#d1fae5,#ccfbf1)', border: '#6ee7b7' },
    { label: 'Time studied', value: formatTime(totalSecs), icon: '⏱️', accent: '#d97706', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)', border: '#fcd34d' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #f8faff 50%, #f0f9ff 100%)' }}>
      {/* Subtle background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle,#c4b5fd,#a5b4fc)', top: '-100px', right: '-100px' }} />
        <div className="blob absolute w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: 'radial-gradient(circle,#bae6fd,#ddd6fe)', bottom: '-60px', left: '-60px', animationDelay: '5s' }} />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 px-6 py-4" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(196,181,253,0.3)' }}>
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 animate-slide-right">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>S</div>
            <span className="font-bold text-gray-800 text-lg tracking-tight">StudyRoom</span>
          </div>
          <div className="flex items-center gap-4 animate-slide-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md" style={{ background: avatarGradient(user?.username) }}>
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-600 hidden sm:block font-medium">{user?.username}</span>
            </div>
            <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-600 transition px-3 py-1.5 rounded-lg hover:bg-gray-100 font-medium">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 relative">
        {/* Greeting */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Hey, {user?.username} 👋
          </h1>
          <p className="text-gray-400 text-sm">Here's your study overview for today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {stats.map((s, i) => (
            <div key={s.label} className={`animate-card delay-${(i + 1) * 100} rounded-2xl p-5 border`} style={{ background: s.bg, borderColor: s.border }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-medium" style={{ color: s.accent, background: 'rgba(255,255,255,0.6)', padding: '2px 8px', borderRadius: '20px' }}>{s.label}</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: s.accent }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Rooms header */}
        <div className="flex justify-between items-center mb-5 animate-fade-up delay-300">
          <h2 className="text-lg font-bold text-gray-800">Your rooms</h2>
          <div className="flex gap-2">
            <button onClick={() => { setShowJoin(true); setError(''); }} className="btn btn-ghost text-sm px-4 py-2">
              Join with code
            </button>
            <button onClick={() => { setShowCreate(true); setError(''); }} className="btn btn-violet text-sm px-4 py-2">
              + New room
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-pop-in" style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Rooms grid */}
        {!loaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 rounded-lg bg-gray-100 w-1/2 mb-3" />
                <div className="h-3 rounded-lg bg-gray-100 w-3/4 mb-4" />
                <div className="h-3 rounded-lg bg-gray-100 w-1/3" />
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-24 animate-fade-up">
            <div className="animate-float inline-block text-6xl mb-4">🗂️</div>
            <p className="text-gray-500 font-medium mb-1">No rooms yet</p>
            <p className="text-gray-300 text-sm">Create one or join with an invite code</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room, i) => (
              <div key={room._id} onClick={() => navigate(`/room/${room._id}`)}
                className={`card animate-card delay-${Math.min(i * 100, 400)} p-5 cursor-pointer group`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800 group-hover:text-violet-600 transition text-base">{room.name}</h3>
                  {room.activeSession ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#d1fae5', color: '#059669', border: '1px solid #6ee7b7' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#f3f4f6', color: '#9ca3af' }}>Idle</span>
                  )}
                </div>
                {room.description && (
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">{room.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
                  <span>👥 {room.members?.length} member{room.members?.length !== 1 ? 's' : ''}</span>
                  <span>·</span>
                  <span>⚡ {room.sessions?.length || 0} sessions</span>
                  <span>·</span>
                  <span className="font-mono tracking-widest text-gray-200">{room.inviteCode}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4 animate-fade-in" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)' }}>
          <div className="card p-7 w-full max-w-md animate-scale-in" style={{ boxShadow: '0 24px 64px rgba(124,58,237,0.18)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg,#ede9fe,#e0e7ff)', border: '1px solid #c4b5fd' }}>🏠</div>
              <div>
                <h3 className="font-bold text-gray-900">Create a room</h3>
                <p className="text-gray-400 text-xs">Give it a name and describe what you're studying</p>
              </div>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input className="input" type="text" placeholder="Room name" required autoFocus
                value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} />
              <input className="input" type="text" placeholder="What are you studying? (optional)"
                value={newRoom.description} onChange={e => setNewRoom({ ...newRoom, description: e.target.value })} />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn btn-violet flex-1">Create room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join modal */}
      {showJoin && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4 animate-fade-in" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)' }}>
          <div className="card p-7 w-full max-w-md animate-scale-in" style={{ boxShadow: '0 24px 64px rgba(79,70,229,0.18)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg,#e0e7ff,#ede9fe)', border: '1px solid #a5b4fc' }}>🔑</div>
              <div>
                <h3 className="font-bold text-gray-900">Join a room</h3>
                <p className="text-gray-400 text-xs">Paste the invite code someone shared with you</p>
              </div>
            </div>
            <form onSubmit={handleJoin} className="space-y-3">
              <input className="input text-center font-mono tracking-widest text-lg uppercase" type="text" placeholder="A3F9C2B1" required autoFocus
                value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowJoin(false)} className="btn btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn btn-violet flex-1">Join room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
