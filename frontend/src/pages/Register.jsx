import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthMeta = [
    null,
    { label: 'Too short', color: '#ef4444', bg: '#fef2f2', bar: '#ef4444' },
    { label: 'Getting there', color: '#f59e0b', bg: '#fffbeb', bar: '#f59e0b' },
    { label: 'Strong password', color: '#059669', bg: '#f0fdf4', bar: '#059669' },
  ][strength];

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #eef4ff 0%, #faf9ff 50%, #f0eeff 100%)' }}>
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute w-96 h-96 rounded-full blur-3xl opacity-35" style={{ background: 'radial-gradient(circle, #a5b4fc, #c4b5fd)', top: '-60px', right: '-80px' }} />
        <div className="blob absolute w-72 h-72 rounded-full blur-3xl opacity-25" style={{ background: 'radial-gradient(circle, #bae6fd, #ddd6fe)', bottom: '40px', left: '-40px', animationDelay: '3s' }} />
      </div>

      {/* Left panel */}
      <div className="hidden lg:flex w-[46%] flex-col justify-between p-14 relative">
        <div className="animate-slide-right">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>S</div>
            <span className="font-bold text-gray-800 text-lg tracking-tight">StudyRoom</span>
          </div>
        </div>

        <div>
          <div className="animate-float mb-8 inline-block">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl" style={{ background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)', border: '1px solid #a5b4fc' }}>
              🎯
            </div>
          </div>

          <div className="animate-slide-right delay-100">
            <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
              Your study group<br />
              <span className="gradient-text">is waiting.</span>
            </h2>
            <p className="text-gray-500 text-base leading-relaxed max-w-sm">
              Join students who use StudyRoom to stay focused, track progress, and actually get things done.
            </p>
          </div>

          {/* Testimonial */}
          <div className="mt-10 animate-slide-right delay-300">
            <div className="card p-5" style={{ background: 'rgba(255,255,255,0.8)' }}>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-sm">★</span>)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic">
                "I went from studying 2 hours a week to 12. The session timer keeps me honest."
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>A</div>
                <span className="text-gray-400 text-xs">alex_studies · CS student</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-300 text-xs animate-fade-in delay-500">© 2025 StudyRoom</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 relative">
        <div className="w-full max-w-sm">
          <div className="card p-8 animate-scale-in" style={{ boxShadow: '0 20px 60px rgba(79,70,229,0.12), 0 4px 16px rgba(0,0,0,0.06)' }}>
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium mb-4" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                ✨ Free forever
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
              <p className="text-gray-400 text-sm">Takes less than a minute</p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-pop-in" style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626' }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: 'username', label: 'Username', type: 'text', placeholder: 'e.g. alex_studies', ac: 'username' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', ac: 'email' },
              ].map((f, i) => (
                <div key={f.key} className={`animate-fade-up delay-${(i + 1) * 100}`}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-0.5 uppercase tracking-wide">{f.label}</label>
                  <input className="input" type={f.type} required autoComplete={f.ac} placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}

              <div className="animate-fade-up delay-300">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-0.5 uppercase tracking-wide">Password</label>
                <input className="input" type="password" required minLength={6} autoComplete="new-password" placeholder="at least 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                {form.password.length > 0 && (
                  <div className="mt-2 animate-fade-in">
                    <div className="flex gap-1 mb-1.5">
                      {[1, 2, 3].map(n => (
                        <div key={n} className="h-1.5 flex-1 rounded-full transition-all duration-400"
                          style={{ background: n <= strength ? strengthMeta.bar : '#e5e7eb' }} />
                      ))}
                    </div>
                    <p className="text-xs ml-0.5 font-medium" style={{ color: strengthMeta.color }}>{strengthMeta.label}</p>
                  </div>
                )}
              </div>

              <div className="animate-fade-up delay-400 pt-1">
                <button type="submit" disabled={loading} className="btn btn-violet w-full">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-slow" />
                      Creating account...
                    </span>
                  ) : 'Get started →'}
                </button>
              </div>
            </form>

            <p className="text-gray-400 text-sm mt-5 text-center animate-fade-up delay-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: '#7c3aed' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
