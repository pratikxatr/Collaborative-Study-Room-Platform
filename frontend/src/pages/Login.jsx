import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Wrong email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #f0eeff 0%, #faf9ff 50%, #eef4ff 100%)' }}>
      {/* Animated blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute w-96 h-96 rounded-full blur-3xl opacity-40" style={{ background: 'radial-gradient(circle, #c4b5fd, #a5b4fc)', top: '-80px', left: '-80px' }} />
        <div className="blob absolute w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, #bae6fd, #c7d2fe)', bottom: '0', right: '-60px', animationDelay: '4s' }} />
        <div className="blob absolute w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #ddd6fe, #e0e7ff)', top: '50%', left: '40%', animationDelay: '2s' }} />
      </div>

      {/* Left branding panel */}
      <div className="hidden lg:flex w-[46%] flex-col justify-between p-14 relative">
        <div className="animate-slide-right">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>S</div>
            <span className="font-bold text-gray-800 text-lg tracking-tight">StudyRoom</span>
          </div>
        </div>

        <div>
          <div className="animate-float mb-8 inline-block">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl" style={{ background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)', border: '1px solid #c4b5fd' }}>
              📚
            </div>
          </div>

          <div className="animate-slide-right delay-100">
            <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
              Study smarter,<br />
              <span className="gradient-text">together.</span>
            </h2>
            <p className="text-gray-500 text-base leading-relaxed max-w-sm">
              Create focused study rooms, track your sessions, and stay accountable with people who actually show up.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {[
              { icon: '⏱️', label: 'Live session timer synced for everyone' },
              { icon: '💬', label: 'Real-time group chat' },
              { icon: '📊', label: 'Track your study progress' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 animate-slide-right delay-${200 + i * 100}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-sm" style={{ background: '#fff', border: '1px solid #e8e6f0' }}>
                  {item.icon}
                </div>
                <span className="text-gray-500 text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-300 text-xs animate-fade-in delay-500">© 2025 StudyRoom</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 relative">
        <div className="w-full max-w-sm">
          <div className="card p-8 animate-scale-in shadow-xl" style={{ boxShadow: '0 20px 60px rgba(124,58,237,0.12), 0 4px 16px rgba(0,0,0,0.06)' }}>
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium mb-4" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                Welcome back
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
              <p className="text-gray-400 text-sm">Pick up where you left off</p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-pop-in" style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626' }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="animate-fade-up delay-100">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-0.5 uppercase tracking-wide">Email</label>
                <input className="input" type="email" required autoComplete="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="animate-fade-up delay-200">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-0.5 uppercase tracking-wide">Password</label>
                <input className="input" type="password" required autoComplete="current-password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="animate-fade-up delay-300 pt-1">
                <button type="submit" disabled={loading} className="btn btn-violet w-full">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-slow" />
                      Signing in...
                    </span>
                  ) : 'Sign in →'}
                </button>
              </div>
            </form>

            <p className="text-gray-400 text-sm mt-5 text-center animate-fade-up delay-400">
              No account?{' '}
              <Link to="/register" className="font-semibold" style={{ color: '#7c3aed' }}>Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
