import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      setError(apiErrors?.[0]?.msg || err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-950 via-gray-950 to-indigo-950 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #8b5cf6 0%, transparent 50%), radial-gradient(circle at 20% 80%, #6366f1 0%, transparent 50%)' }}
        />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mb-6 mx-auto shadow-lg shadow-indigo-900/50">
            PT
          </div>
          <h2 className="text-4xl font-bold text-white mb-3">Join PrimeTrade</h2>
          <p className="text-indigo-300 text-lg">Task Manager</p>
          <p className="text-gray-400 mt-6 max-w-xs leading-relaxed text-sm">
            Create your account and start managing tasks with powerful role-based access control.
          </p>

          <div className="mt-10 space-y-3 text-left">
            {[
              ['✅', 'Create and track tasks easily'],
              ['🔒', 'Secure JWT authentication'],
              ['👑', 'Admin & User role support'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3 text-gray-300 text-sm">
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold text-white mb-3 mx-auto">
              PT
            </div>
            <h1 className="text-2xl font-bold text-white">PrimeTrade</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">Create account</h2>
            <p className="text-gray-400 mt-1 text-sm">Fill in your details to get started</p>
          </div>

          <div className="card">
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-950/60 border border-red-800 px-4 py-3 text-sm text-red-300">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="reg-name">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Alice Johnson"
                  className="input"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="reg-email">
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="reg-password">
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="input"
                  autoComplete="new-password"
                />
              </div>

              {/* Role selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, role: 'user' }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition duration-200
                      ${form.role === 'user'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                  >
                    <span className="text-2xl">👤</span>
                    <span>User</span>
                    <span className="text-xs text-gray-500 font-normal text-center leading-tight">Manage own tasks</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, role: 'admin' }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition duration-200
                      ${form.role === 'admin'
                        ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                        : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                  >
                    <span className="text-2xl">👑</span>
                    <span>Admin</span>
                    <span className="text-xs text-gray-500 font-normal text-center leading-tight">Manage all tasks</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary mt-2" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating account…
                  </span>
                ) : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
