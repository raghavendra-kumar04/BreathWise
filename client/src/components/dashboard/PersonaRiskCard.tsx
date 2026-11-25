import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, HeartPulse, User, Bike, Wind, Stethoscope, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PersonaRiskCardProps {
  aqi: number;
  category: string;
  prominentPollutant: string;
  userCommute?: string;
  userCookingFuel?: string;
  userOutdoorActivity?: string;
}

interface PersonaPreset {
  id: string;
  label: string;
  icon: string;
  subtitle: string;
  sensitivity: 'Normal' | 'Moderate' | 'High' | 'Severe';
  getAdvice: (aqi: number, category: string, prominent: string) => {
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
    color: string;
    commuteAdvice: string;
    exerciseAdvice: string;
    indoorAdvice: string;
    clinicalNote: string;
  };
}

const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'general',
    label: 'Daily Commuter & Jogger',
    icon: '🏃',
    subtitle: 'Two-wheeler / Jogging / Urban commute',
    sensitivity: 'Normal',
    getAdvice: (aqi) => {
      if (aqi <= 50) {
        return {
          riskLevel: 'Low',
          color: 'green',
          commuteAdvice: 'Bicycle and two-wheeler commuting is optimal. Clean airflow along roadways.',
          exerciseAdvice: 'Ideal for marathon training, intense outdoor jogging, and sports.',
          indoorAdvice: 'Full natural cross-ventilation encouraged throughout the day.',
          clinicalNote: 'Zero respiratory strain predicted for healthy adults.',
        };
      }
      if (aqi <= 100) {
        return {
          riskLevel: 'Moderate',
          color: 'blue',
          commuteAdvice: 'Wear a bandana or light dust mask on high-traffic ring roads during stop-and-go jams.',
          exerciseAdvice: 'Outdoor running is safe, but prefer tree-canopied parks away from major highway intersections.',
          indoorAdvice: 'Open windows mid-day once solar radiation disperses early morning dust.',
          clinicalNote: 'Minor throat dryness possible during sustained strenuous breathing outdoors.',
        };
      }
      if (aqi <= 200) {
        return {
          riskLevel: 'High',
          color: 'amber',
          commuteAdvice: 'Shift to Metro or bus where possible. If on two-wheeler, wear an N95 mask.',
          exerciseAdvice: 'Move cardio indoors. Replace outdoor jogging with gym sessions or indoor bodyweight training.',
          indoorAdvice: 'Keep windows closed between 6:00 AM - 9:00 AM during thermal ground inversion.',
          clinicalNote: 'Increased airway resistance; stay hydrated to maintain respiratory mucosa.',
        };
      }
      return {
        riskLevel: 'Severe',
        color: 'red',
        commuteAdvice: 'Avoid two-wheeler riding. Travel in sealed public transit with recirculated air.',
        exerciseAdvice: 'Strictly avoid outdoor cardiovascular activity. Restrict exertion indoors.',
        indoorAdvice: 'Seal door under-cracks with wet towels and operate HEPA or DIY wet-cloth air capture.',
        clinicalNote: 'Particulate exposure exceeds safe limits; wear N95/FFP2 mask if stepping outside.',
      };
    },
  },
  {
    id: 'asthma',
    label: 'Asthmatic / Sensitive Airways',
    icon: '🫁',
    subtitle: 'History of wheezing, bronchitis, or allergies',
    sensitivity: 'Severe',
    getAdvice: (aqi) => {
      if (aqi <= 50) {
        return {
          riskLevel: 'Low',
          color: 'green',
          commuteAdvice: 'Safe for normal travel. Carry your rescue inhaler as standard protocol.',
          exerciseAdvice: 'Outdoor walks and light jogging are safe and beneficial for lung capacity.',
          indoorAdvice: 'Air out rooms thoroughly while baseline particulate levels are low.',
          clinicalNote: 'Air quality is clinically favorable for asthmatic patients today.',
        };
      }
      if (aqi <= 100) {
        return {
          riskLevel: 'High',
          color: 'amber',
          commuteAdvice: 'Wear a well-fitted N95 mask outdoors. Avoid standing near diesel buses or auto-rickshaw exhausts.',
          exerciseAdvice: 'Do not jog outdoors. Pre-medicate with prescribed preventive inhaler before outdoor walks.',
          indoorAdvice: 'Keep windows shut on roadside facing rooms. Run kitchen exhaust during all cooking.',
          clinicalNote: 'Sub-clinical bronchoconstriction can trigger cough reflex. Keep bronchodilator accessible.',
        };
      }
      return {
        riskLevel: 'Severe',
        color: 'red',
        commuteAdvice: 'Avoid all non-essential outdoor travel. Roadside particulates will provoke bronchial spasms.',
        exerciseAdvice: 'Zero outdoor exertion. Gentle indoor stretching only.',
        indoorAdvice: 'Maintain sealed indoor micro-environment. Avoid agarbatti (incense) and frying with high smoke oil.',
        clinicalNote: 'High risk of acute asthma exacerbation. Contact physician if peak expiratory flow drops by 20%.',
      };
    },
  },
  {
    id: 'child',
    label: 'School Child / Toddler',
    icon: '🧒',
    subtitle: 'Underdeveloped alveolar lungs (2x breath rate/kg)',
    sensitivity: 'High',
    getAdvice: (aqi) => {
      if (aqi <= 50) {
        return {
          riskLevel: 'Low',
          color: 'green',
          commuteAdvice: 'Safe for school bus and auto commute.',
          exerciseAdvice: 'Encourage outdoor playtime and physical education sports.',
          indoorAdvice: 'Natural airflow in study rooms boosts cognitive oxygenation.',
          clinicalNote: 'Children breathe cleanly; no particulate lung deposition hazard today.',
        };
      }
      if (aqi <= 100) {
        return {
          riskLevel: 'Moderate',
          color: 'blue',
          commuteAdvice: 'Ensure school van windows are raised along congested city arteries.',
          exerciseAdvice: 'Limit vigorous school playground periods to under 45 minutes.',
          indoorAdvice: 'Wet-mop bedroom floors to capture settling micro-dust from shoes.',
          clinicalNote: 'Monitor for allergic rhinitis or eye-rubbing symptoms after school return.',
        };
      }
      return {
        riskLevel: 'Severe',
        color: 'red',
        commuteAdvice: 'Equip with child-sized N95 mask. Request school bus windows remain firmly shut.',
        exerciseAdvice: 'School sports periods should be moved to indoor auditoriums or suspended.',
        indoorAdvice: 'Do not burn mosquito coils in child sleeping areas; switch to liquid vaporizers.',
        clinicalNote: 'Ultrafine PM2.5 penetrates deep into developing pediatric alveoli. Keep indoors.',
      };
    },
  },
  {
    id: 'senior',
    label: 'Senior Citizen (60+ yrs)',
    icon: '👵',
    subtitle: 'Vulnerable to cardiovascular & arterial stress',
    sensitivity: 'High',
    getAdvice: (aqi) => {
      if (aqi <= 50) {
        return {
          riskLevel: 'Low',
          color: 'green',
          commuteAdvice: 'Pleasant and safe for travel and neighborhood walks.',
          exerciseAdvice: 'Morning walks in local parks provide excellent cardiovascular stimulation.',
          indoorAdvice: 'Open balcony and bedroom windows for fresh air exchange.',
          clinicalNote: 'Optimal environmental conditions for senior well-being.',
        };
      }
      if (aqi <= 100) {
        return {
          riskLevel: 'Moderate',
          color: 'blue',
          commuteAdvice: 'Prefer auto-rickshaws or cabs with closed windows over walking in traffic.',
          exerciseAdvice: 'Delay early morning walk until 8:00 AM when sunrise clears surface smog.',
          indoorAdvice: 'Maintain cross-ventilation in afternoon hours (12 PM - 4 PM).',
          clinicalNote: 'Slight elevation in arterial blood pressure observed in seniors during particulate peaks.',
        };
      }
      return {
        riskLevel: 'Severe',
        color: 'red',
        commuteAdvice: 'Avoid outdoor travel completely. Rely on family or delivery for errands.',
        exerciseAdvice: 'Cancel all outdoor walking. Do indoor pacing or yoga inside.',
        indoorAdvice: 'Keep all windows closed. Drink warm fluids to soothe dry airways.',
        clinicalNote: 'Fine particulates enter bloodstream and trigger systemic vascular inflammation.',
      };
    },
  },
];

export const PersonaRiskCard: React.FC<PersonaRiskCardProps> = ({
  aqi,
  category,
  prominentPollutant,
}) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('general');

  const currentPersona = PERSONA_PRESETS.find((p) => p.id === selectedPersonaId) || PERSONA_PRESETS[0];
  const advice = currentPersona.getAdvice(aqi, category, prominentPollutant);

  return (
    <div className="p-6 rounded-3xl bg-white border border-sage/20 shadow-sm space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sage/20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-forest/10 flex items-center justify-center text-forest">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-forest flex items-center gap-2">
              <span>Persona-Based Risk Intelligence</span>
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-amber/15 text-amber-dark font-semibold">
                Contextual AI
              </span>
            </h3>
            <p className="text-xs text-charcoal/60">
              Adapts clinical recommendations to user physiology, commute mode & household environment
            </p>
          </div>
        </div>

        {/* Dynamic Risk Badge */}
        <div
          className={`self-start sm:self-auto px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
            advice.riskLevel === 'Low'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : advice.riskLevel === 'Moderate'
              ? 'bg-blue-100 text-blue-800 border border-blue-300'
              : advice.riskLevel === 'High'
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-red-100 text-red-900 border border-red-300'
          }`}
        >
          {advice.riskLevel === 'Low' ? (
            <ShieldCheck className="w-4 h-4 text-green-700" />
          ) : (
            <ShieldAlert className="w-4 h-4" />
          )}
          <span>{advice.riskLevel} Risk Profile</span>
        </div>
      </div>

      {/* Interactive Persona Selector Chips */}
      <div>
        <span className="text-[11px] font-bold text-charcoal/60 uppercase tracking-wider block mb-2">
          Select or Preview Persona Profile:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PERSONA_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPersonaId(p.id)}
              className={`p-2.5 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between ${
                selectedPersonaId === p.id
                  ? 'bg-forest text-ivory border-forest shadow-sm'
                  : 'bg-ivory/50 hover:bg-ivory border-sage/20 text-charcoal'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-base">{p.icon}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                    selectedPersonaId === p.id
                      ? 'bg-white/20 text-ivory'
                      : 'bg-forest/10 text-forest'
                  }`}
                >
                  {p.sensitivity}
                </span>
              </div>
              <p className="text-xs font-bold truncate leading-tight">{p.label}</p>
              <p
                className={`text-[10px] truncate mt-0.5 ${
                  selectedPersonaId === p.id ? 'text-ivory/70' : 'text-charcoal/50'
                }`}
              >
                {p.subtitle}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Contextual Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {/* Commute Advice */}
        <div className="p-3.5 rounded-2xl bg-ivory/60 border border-sage/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-forest">
            <Bike className="w-4 h-4 text-forest" />
            <span>Mobility & Commute</span>
          </div>
          <p className="text-xs text-charcoal/80 leading-relaxed">{advice.commuteAdvice}</p>
        </div>

        {/* Exercise Advice */}
        <div className="p-3.5 rounded-2xl bg-ivory/60 border border-sage/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-forest">
            <User className="w-4 h-4 text-forest" />
            <span>Outdoor Activity</span>
          </div>
          <p className="text-xs text-charcoal/80 leading-relaxed">{advice.exerciseAdvice}</p>
        </div>

        {/* Indoor Air Advice */}
        <div className="p-3.5 rounded-2xl bg-ivory/60 border border-sage/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-forest">
            <Wind className="w-4 h-4 text-forest" />
            <span>Indoor Air & Kitchen</span>
          </div>
          <p className="text-xs text-charcoal/80 leading-relaxed">{advice.indoorAdvice}</p>
        </div>
      </div>

      {/* Clinical Guidance Footnote */}
      <div className="p-3 rounded-2xl bg-forest/5 border border-forest/10 flex items-start gap-2.5 text-xs text-forest">
        <Stethoscope className="w-4 h-4 shrink-0 mt-0.5 text-forest" />
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="leading-relaxed">
            <strong>Clinical Context ({currentPersona.label}):</strong> {advice.clinicalNote}
          </p>
          <Link
            to="/assistant"
            className="inline-flex items-center gap-1 font-bold text-forest hover:underline shrink-0 text-xs"
          >
            <span>Ask AI Coach</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
