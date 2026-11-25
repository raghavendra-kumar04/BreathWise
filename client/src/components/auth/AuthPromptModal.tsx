import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  X,
} from 'lucide-react';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedCity: string;
  detectedState?: string;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  detectedCity,
  detectedState,
}) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Please provide your name.');
          setLoading(false);
          return;
        }
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }

      onClose();
      // Redirect directly to the dedicated dashboard window
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          (mode === 'register'
            ? 'Registration failed. Try signing in if you already have an account.'
            : 'Invalid email or password.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-sage/30 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-charcoal/40 hover:text-charcoal transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Location Detection Badge Header */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4 w-fit">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Location Identified: <strong>{detectedCity}</strong> {detectedState ? `(${detectedState})` : ''}</span>
        </div>

        <div>
          <h3 className="font-heading font-extrabold text-2xl text-forest">
            {mode === 'register' ? 'Unlock Real-Time AQI & AI Insights' : 'Welcome Back to BreatheWise'}
          </h3>
          <p className="text-xs text-charcoal/70 mt-1 leading-relaxed">
            {mode === 'register'
              ? `Create your free account to view CPCB ground telemetry, 24h forecasts, and personalized Gemini protection for ${detectedCity}.`
              : `Sign in to sync ${detectedCity} with your account profile and open your dedicated environmental dashboard.`}
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Raghav Sharma"
                  className="w-full pl-10 pr-3 py-2 bg-ivory rounded-xl border border-sage/30 text-xs focus:outline-none focus:border-forest text-charcoal"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-3 py-2 bg-ivory rounded-xl border border-sage/30 text-xs focus:outline-none focus:border-forest text-charcoal"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 bg-ivory rounded-xl border border-sage/30 text-xs focus:outline-none focus:border-forest text-charcoal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-forest hover:bg-forest-light text-ivory font-semibold text-xs transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {loading ? (
              <span>Saving credentials & location...</span>
            ) : (
              <>
                <span>{mode === 'register' ? `Save & View ${detectedCity} AQI` : 'Sign In & View Air Quality'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-sage/20 text-center">
          {mode === 'register' ? (
            <p className="text-xs text-charcoal/70">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="font-bold text-forest hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-xs text-charcoal/70">
              New to BreatheWise?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className="font-bold text-forest hover:underline"
              >
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
