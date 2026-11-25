import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Wind, ArrowLeft, Home, LayoutDashboard, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory font-sans text-charcoal flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-sage/30 bg-ivory-light/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-light transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Body */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          {/* Animated wind element behind the large 404 */}
          <div className="w-24 h-24 rounded-3xl bg-forest/10 text-forest mx-auto flex items-center justify-center shadow-inner mb-2">
            <Wind className="w-12 h-12 text-forest animate-pulse" />
          </div>
          <span className="font-heading font-black text-7xl sm:text-8xl text-forest tracking-tighter">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest">
            Lost in the Smog?
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 max-w-md mx-auto leading-relaxed">
            The page or environmental coordinates you were looking for could not be found or have been moved. Let's get you back to clean air.
          </p>
        </div>

        {/* Quick Recovery Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-2xl bg-forest hover:bg-forest-light text-ivory text-xs font-semibold shadow-md transition flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Landing Page</span>
          </Link>

          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-2xl bg-white border border-sage/30 hover:bg-ivory text-forest text-xs font-semibold shadow-xs transition flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Live AQI Dashboard</span>
          </Link>

          <Link
            to="/planner"
            className="px-5 py-2.5 rounded-2xl bg-white border border-sage/30 hover:bg-ivory text-forest text-xs font-semibold shadow-xs transition flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>AI Action Planner</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-sage/20 py-6 text-center text-xs text-charcoal/60">
        BreatheWise • Breathe Better. Live Healthier.
      </footer>
    </div>
  );
};
