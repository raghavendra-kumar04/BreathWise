import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to sign in. Please verify your credentials.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <Link to="/" className="mb-4">
          <Logo size="lg" showSubtitle={true} />
        </Link>
        <h2 className="font-heading font-extrabold text-2xl text-forest tracking-tight mt-2">
          Sign In to Your Dashboard
        </h2>
        <p className="mt-1 text-xs text-charcoal/70">
          Access your personal air quality dashboard and Gemini AI planner
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl border border-sage/20 rounded-3xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-ivory rounded-xl border border-sage/30 text-xs focus:outline-none focus:border-forest text-charcoal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-ivory rounded-xl border border-sage/30 text-xs focus:outline-none focus:border-forest text-charcoal"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-forest hover:bg-forest-light text-ivory font-semibold text-xs transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign in to BreatheWise'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-sage/20 text-center space-y-2">
            <p className="text-xs text-charcoal/70">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-forest hover:underline">
                Create free account
              </Link>
            </p>
            <div className="flex items-center justify-center gap-3 text-[11px] text-charcoal/50">
              <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
              <span>•</span>
              <Link to="/terms" className="hover:underline">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
