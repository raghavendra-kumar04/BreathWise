import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Cpu,
  MapPin,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  Users,
  Compass,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { LocationModal } from '../components/location/LocationModal';
import { Logo } from '../components/ui/Logo';

export const LandingPage: React.FC = () => {
  const { user, logout, activeLocation } = useAuth();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const comparisonData = [
    {
      feature: 'Environmental Data Source',
      ordinary: 'US AQI or generic global model interpolation',
      breathewise: 'Real CPCB ground stations (3,970+ physical monitors across India)',
    },
    {
      feature: 'AQI Scale Calibration',
      ordinary: 'US EPA AQI (misleading for Indian particulate baselines)',
      breathewise: 'Official Indian National AQI (NAQI) piecewise breakpoints',
    },
    {
      feature: 'Health Advice Delivery',
      ordinary: 'Generic static tips ("wear a mask if air is bad")',
      breathewise: 'Google Gemini 2.5 Flash reasoning over your exact commute & cooking fuel',
    },
    {
      feature: 'Indoor Air Guidance',
      ordinary: 'None or claims you must buy a ₹20,000 purifier',
      breathewise: 'Dynamic thermal inversion ventilation timers & low-cost/zero-cost safeguards',
    },
    {
      feature: 'Localized Neighborhood Intelligence',
      ordinary: 'None (blind to local garbage or leaf fires)',
      breathewise: 'Crowdsourced community reports with GPS landmark verification',
    },
    {
      feature: 'Mobility Impact Modeling',
      ordinary: 'None',
      breathewise: 'What-If Simulator estimating CO₂ cut, road dust avoided, & fuel savings',
    },
  ];

  const faqs = [
    {
      q: 'How does BreatheWise calculate the Air Quality Index for Indian cities?',
      a: 'BreatheWise utilizes the official piecewise linear interpolation formulas established by the Central Pollution Control Board (CPCB) and the Ministry of Environment, Forest and Climate Change (MoEFCC). Rather than using US EPA standards that miscategorize Indian particulate baselines, we compute sub-indices for PM2.5, PM10, NO2, SO2, CO, and Ozone, designating the highest sub-index as the prominent driver.',
    },
    {
      q: 'Why does BreatheWise ask for my commute and cooking fuel details?',
      a: 'Air pollution exposure varies drastically depending on whether you commute via a ventilated Metro car, an open two-wheeler, or a bicycle. Similarly, cooking with LPG vs. induction creates distinct indoor Nitrogen Dioxide (NO2) micro-climates. Google Gemini integrates these exact parameters into your morning action plan.',
    },
    {
      q: 'Does Google Gemini invent or guess pollution numbers?',
      a: 'Never. In BreatheWise, Gemini serves strictly as the intelligence and decision layer, not the source of environmental facts. Our backend queries verified CPCB physical ground stations and Open-Meteo atmospheric dispersion models, injecting this ground truth directly into Gemini with strict guardrails and Zod schema validation.',
    },
    {
      q: 'Is BreatheWise free to use across all Indian cities and towns?',
      a: 'Yes. BreatheWise is built with open environmental intelligence to empower citizens, runners, parents, and commuters across India. You can detect your city via GPS or search any municipality in India without subscription fees.',
    },
  ];

  const workflowSteps = [
    {
      num: '01',
      title: 'Detect Ground Telemetry',
      desc: 'Browser geolocation or manual city search pairs you with the nearest physical CPCB monitoring station.',
      icon: MapPin,
    },
    {
      num: '02',
      title: 'AI Synthesizes Context',
      desc: 'Google Gemini analyzes real PM2.5, PM10, and wind speed against your saved commute & cooking habits.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'Actionable Daily Blueprint',
      desc: 'Receive tailored morning briefings, safe outdoor exercise windows, and ventilation checklists.',
      icon: Activity,
    },
    {
      num: '04',
      title: 'Community Verification',
      desc: 'Flag street-level burning, construction dust, and pollution hotspots to keep neighbors informed.',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col font-sans">
      {/* Navigation */}
      <header className="border-b border-sage/30 bg-ivory-light/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo size="md" showSubtitle={false} />
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest/5 hover:bg-forest/10 border border-forest/15 text-xs font-semibold text-forest transition cursor-pointer"
              title="Click here to change location"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{activeLocation.city || 'Set City'}</span>
              <span className="text-[10px] text-sage-dark font-normal hidden sm:inline">• Click to change</span>
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

        {/* Live Metrics Trust Banner */}
        <div className="mt-12 p-4 rounded-2xl bg-white/70 border border-sage/20 shadow-xs max-w-3xl w-full flex flex-wrap items-center justify-around gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest font-extrabold text-sm">
              3.9k+
            </div>
            <div>
              <span className="font-bold text-xs text-forest block">CPCB Stations</span>
              <span className="text-[10px] text-charcoal/60">Official Ground Monitors</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber/15 flex items-center justify-center text-amber-dark font-extrabold text-sm">
              2.5
            </div>
            <div>
              <span className="font-bold text-xs text-forest block">Gemini Flash AI</span>
              <span className="text-[10px] text-charcoal/60">Grounded Action Plans</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage/20 flex items-center justify-center text-forest font-extrabold text-sm">
              0g
            </div>
            <div>
              <span className="font-bold text-xs text-forest block">Zero Fake AQI</span>
              <span className="text-[10px] text-charcoal/60">Authentic NAQI Scale</span>
            </div>
          </div>
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

        {/* SECTION 2: How It Works Workflow */}
        <section className="mt-24 w-full text-left space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-sage-dark uppercase tracking-wider">
              Complete Core Experience
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-forest">
              From Environmental Telemetry to Personal Action
            </h2>
            <p className="text-xs sm:text-sm text-charcoal/70">
              BreatheWise connects hardware telemetry with generative AI to protect your day in 4 seamless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-sage/20 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4"
                >
                  <span className="font-heading font-black text-4xl text-sage/20 absolute -right-2 -bottom-2 select-none">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-forest">{step.title}</h4>
                    <p className="text-xs text-charcoal/70 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: BreatheWise vs. Ordinary AQI Apps */}
        <section className="mt-24 w-full text-left space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-dark uppercase tracking-wider">
              The BreatheWise Advantage
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-forest">
              Ordinary AQI Apps vs. BreatheWise
            </h2>
            <p className="text-xs sm:text-sm text-charcoal/70">
              Why showing a number isn't enough when protecting your family's health in Indian cities.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-sage/20 shadow-sm overflow-hidden pt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sage/20 bg-ivory/50">
                    <th className="p-4 font-bold text-charcoal/70 uppercase tracking-wider">Feature Capability</th>
                    <th className="p-4 font-bold text-charcoal/70 uppercase tracking-wider">Ordinary AQI Apps</th>
                    <th className="p-4 font-bold text-forest uppercase tracking-wider bg-forest/5">BreatheWise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/15">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-ivory/30 transition">
                      <td className="p-4 font-bold text-forest">{row.feature}</td>
                      <td className="p-4 text-charcoal/70 flex items-start gap-1.5">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{row.ordinary}</span>
                      </td>
                      <td className="p-4 text-forest font-medium bg-forest/5">
                        <div className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{row.breathewise}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 4: Interactive FAQ Section */}
        <section className="mt-24 w-full text-left space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold mb-1">
              <HelpCircle className="w-3.5 h-3.5" /> Answers to Common Questions
            </div>
            <h2 className="font-heading font-extrabold text-3xl text-forest">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-sage/20 shadow-xs overflow-hidden transition"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4"
                  >
                    <span className="font-heading font-bold text-xs sm:text-sm text-forest">
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-forest shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-charcoal/80 leading-relaxed border-t border-sage/10 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Card */}
        <section className="mt-24 p-8 sm:p-12 rounded-3xl bg-forest text-ivory w-full text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-sage">
              Ready to Breathe Cleaner?
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl">
              Take Charge of Your Environmental Health Today
            </h2>
            <p className="text-xs sm:text-sm text-ivory/80 leading-relaxed font-normal">
              Join thousands of Indian commuters, runners, and families making smarter daily choices backed by Google Gemini.
            </p>
            <div className="pt-2">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-forest font-bold text-xs sm:text-sm shadow-md hover:bg-ivory transition"
              >
                <span>{user ? "Go to Dashboard" : "Get Started for Free"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with Privacy & Terms Links */}
      <footer className="border-t border-sage/20 py-8 text-center text-xs text-charcoal/60 space-y-2 mt-12">
        <div className="flex items-center justify-center gap-4 text-xs font-medium text-forest">
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
        </div>
        <p>BreatheWise • Breathe Better. Live Healthier. • Developed with Google Gemini for PromptWars</p>
      </footer>

      <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
    </div>
  );
};
