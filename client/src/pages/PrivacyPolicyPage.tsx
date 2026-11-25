import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Lock, Eye, Database, Globe, ArrowLeft } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory font-sans text-charcoal flex flex-col">
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
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 space-y-8">
        <div>
          <span className="text-xs font-bold text-sage-dark uppercase tracking-wider">
            Transparency & User Security
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-forest mt-1">
            Privacy Policy
          </h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Last Updated: November 25, 2026 • Effective Immediately
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-sage/20 shadow-xs space-y-6 text-xs sm:text-sm leading-relaxed text-charcoal/80">
          <section className="space-y-2">
            <h2 className="font-heading font-bold text-lg text-forest flex items-center gap-2">
              <Eye className="w-5 h-5 text-forest" />
              1. Information We Collect
            </h2>
            <p>
              At BreatheWise, we strictly minimize personal data collection to what is necessary to calculate authentic environmental health exposure in Indian micro-environments:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Credentials:</strong> Name and email address for account authentication. Passwords are cryptographically hashed using salted bcrypt (minimum 12 rounds) and are never stored in plain text.</li>
              <li><strong>Geolocation & City Data:</strong> Latitude, longitude, and approximate municipality coordinates to identify the nearest physical Central Pollution Control Board (CPCB) monitoring station.</li>
              <li><strong>Lifestyle Preferences:</strong> Commute method (metro, two-wheeler, bus, car), outdoor exercise habits, and household cooking fuel (LPG, induction, biomass) used strictly by Google Gemini to construct actionable daily plans.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-lg text-forest flex items-center gap-2">
              <Database className="w-5 h-5 text-forest" />
              2. How Environmental & AI Data is Processed
            </h2>
            <p>
              BreatheWise does not sell, rent, or trade your personal information. Your environmental data is processed according to clear technical boundaries:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Ground Truth Data:</strong> Real-time atmospheric metrics (PM2.5, PM10, NO2, SO2, CO, Ozone) are queried from official public repositories (CPCB via data.gov.in and Open-Meteo).</li>
              <li><strong>Google Gemini AI:</strong> When you generate a daily action plan or chat with the assistant, verified environmental context and lifestyle parameters are provided to the model. We do not transmit sensitive personal identifiers (such as passwords or precise street addresses) to external AI APIs.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-lg text-forest flex items-center gap-2">
              <Lock className="w-5 h-5 text-forest" />
              3. Data Retention & User Rights
            </h2>
            <p>
              You maintain full sovereignty over your environmental ledger:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You can update or erase your active geolocation at any time from your Profile window.</li>
              <li>Chat history with the Gemini assistant can be permanently purged in one click using the "Clear Discussion" button.</li>
              <li>Temporary environmental telemetry records cached in our database are set to automatically expire after 24 hours.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-lg text-forest flex items-center gap-2">
              <Globe className="w-5 h-5 text-forest" />
              4. Community Submissions
            </h2>
            <p>
              When submitting observations to the Community Intelligence feed (e.g. garbage burning, construction dust plumes), your observation title, description, and chosen landmark become visible to nearby community members to raise environmental awareness.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-sage/20 py-6 text-center text-xs text-charcoal/60">
        BreatheWise • Developed for PromptWars • Breathe Better. Live Healthier.
      </footer>
    </div>
  );
};
