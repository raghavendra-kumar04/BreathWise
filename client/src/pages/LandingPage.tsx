import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wind,
  Cpu,
  MapPin,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  Users,
  Compass
} from 'lucide-react';
import { LocationModal } from '../components/location/LocationModal';

export const LandingPage: React.FC = () => {
  const { user, logout, activeLocation } = useAuth();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col font-sans">
      {/* Navigation */}
      <header className="border-b border-sage/30 bg-ivory-light/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-ivory shadow-sm">
              <Wind className="w-5 h-5 text-sage" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl text-forest tracking-tight">BreatheWise</span>
              <span className="ml-2 text-xs bg-sage/20 text-forest px-2 py-0.5 rounded-full font-medium">India</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest/5 hover:bg-forest/10 border border-forest/15 text-xs font-semibold text-forest transition"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{activeLocation.city || 'Set City'}</span>
            </button>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-1.5 bg-forest hover:bg-forest-light text-ivory rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="p-1.5 rounded-xl border border-sage/30 hover:bg-sage/10 text-forest text-xs font-semibold transition"
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-charcoal/60 hover:text-red-700 font-medium"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-forest hover:text-forest-light px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-forest hover:bg-forest-light text-ivory rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/15 text-amber-dark text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          India's First AI-Powered Environmental Companion
        </div>

        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-forest max-w-4xl leading-[1.15] tracking-tight">
          Understand your environment. Protect your everyday life.
        </h1>
        <p className="mt-5 text-base sm:text-lg text-charcoal/80 max-w-2xl font-normal leading-relaxed">
          BreatheWise translates raw, complex CPCB ground station pollution measurements into tailored, actionable decisions for Indian families, runners, commuters, and homes.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to={user ? "/dashboard" : "/register"}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-forest hover:bg-forest-light text-ivory font-semibold text-sm shadow-xl transition flex items-center justify-center gap-2"
          >
            <span>{user ? "Open Your Live Dashboard" : "Create Free Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-sage/40 hover:bg-white text-forest font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-forest" />
            <span>Check AQI in {activeLocation.city}</span>
          </button>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16 w-full text-left">
          <div className="p-6 rounded-3xl bg-white border border-sage/20 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center mb-4">
              <Activity className="w-5 h-5 text-forest" />
            </div>
            <h3 className="font-heading font-bold text-base text-forest">Real CPCB Stations</h3>
            <p className="mt-2 text-xs text-charcoal/70 leading-relaxed">
              Real-time National Air Quality Index (NAQI) calibrated specifically for Indian particulate baselines.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-sage/20 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-amber/20 text-amber-dark flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5 text-amber-dark" />
            </div>
            <h3 className="font-heading font-bold text-base text-forest">AI Daily Planner</h3>
            <p className="mt-2 text-xs text-charcoal/70 leading-relaxed">
              Google Gemini interprets air metrics against your commute mode, outdoor exercise, and household fuel.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-sage/20 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-sage/20 text-forest flex items-center justify-center mb-4">
              <Layers className="w-5 h-5 text-forest" />
            </div>
            <h3 className="font-heading font-bold text-base text-forest">Indoor Air Coach</h3>
            <p className="mt-2 text-xs text-charcoal/70 leading-relaxed">
              Safe ventilation windows based on real outdoor particulate flow rather than arbitrary timer rules.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-sage/20 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-forest" />
            </div>
            <h3 className="font-heading font-bold text-base text-forest">Community Intel</h3>
            <p className="mt-2 text-xs text-charcoal/70 leading-relaxed">
              Verified ground observations: local garbage burning, construction dust, and pollution hotspots.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-sage/20 py-8 text-center text-xs text-charcoal/60">
        BreatheWise • Developed for PromptWars • Built with React, TypeScript, Express & Google Gemini
      </footer>

      <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
    </div>
  );
};
