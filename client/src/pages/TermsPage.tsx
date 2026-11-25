import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { FileText, CheckCircle2, AlertTriangle, Scale, ArrowLeft } from 'lucide-react';

export const TermsPage: React.FC = () => {
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
            User Agreement & Service Terms
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-forest mt-1">
            Terms & Conditions
          </h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Last Updated: November 25, 2026 • Effective for all BreatheWise users & guests
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-sage/20 shadow-xs space-y-6 text-xs sm:text-sm leading-relaxed text-charcoal/80">
          <section className="space-y-2">
            <h2 className="font-heading font-bold text-lg text-forest flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-forest" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing BreatheWise, detecting your city location, creating an account, or interacting with our Gemini AI environmental decision-support services, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-lg text-forest flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-dark" />
              2. Medical & Health Disclaimer
            </h2>
            <p className="p-4 rounded-2xl bg-amber/15 border border-amber/30 text-amber-dark font-medium">
              BreatheWise and its Gemini-powered recommendations are intended solely for environmental awareness, lifestyle exposure reduction, and public health education. BreatheWise is NOT a certified medical diagnostic device and does NOT provide medical advice, diagnosis, or treatment.
            </p>
            <p>
              Individuals with chronic respiratory illnesses, asthma, cardiovascular conditions, pregnancy, or elderly care requirements should always consult licensed healthcare professionals regarding specialized medical regimens during severe pollution episodes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-lg text-forest flex items-center gap-2">
              <Scale className="w-5 h-5 text-forest" />
              3. Data Integrity & Scientific Provenance
            </h2>
            <p>
              BreatheWise displays real-time National Air Quality Index (NAQI) calculated from CPCB ground monitors and regional atmospheric dispersion models provided by Open-Meteo under CC BY 4.0. While we verify data freshness, individual government stations may occasionally undergo sensor calibration or experience power outages. BreatheWise explicitly discloses data freshness and telemetry sources rather than fabricating readings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-lg text-forest flex items-center gap-2">
              <FileText className="w-5 h-5 text-forest" />
              4. Community Guidelines & Verification
            </h2>
            <p>
              Users submitting crowdsourced reports (e.g. open burning, construction dust) agree to provide factual, honest observations in good faith. Submitting fraudulent, abusive, or defamatory content is strictly prohibited and subject to moderation removal and account termination.
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
