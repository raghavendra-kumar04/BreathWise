import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Home,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Clock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const IndoorAirPage: React.FC = () => {
  const { user, preferences } = useAuth();

  const lat = user?.location?.latitude ?? 28.6139;
  const lon = user?.location?.longitude ?? 77.2090;
  const city = user?.location?.city ?? 'New Delhi';
  const cookingFuel = preferences?.lifestyle?.cookingFuel ?? 'lpg';

  const { data: guidanceData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['indoorAirGuidance', lat, lon, city, cookingFuel],
    queryFn: async () => {
      const res = await api.get(`/indoor-air/guidance?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}&cookingFuel=${cookingFuel}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 15,
  });

  const ventilation = guidanceData?.ventilation;
  const cooking = guidanceData?.cookingGuidance;
  const outdoor = guidanceData?.outdoorContext;
  const tips = guidanceData?.practicalTips || [];

  const getVentilationBadge = (status: string) => {
    switch (status) {
      case 'safe':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          badge: 'bg-emerald-600 text-white',
          icon: ShieldCheck,
          label: 'Safe to Open Windows',
        };
      case 'caution':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          badge: 'bg-amber-600 text-white',
          icon: AlertTriangle,
          label: 'Ventilate with Caution',
        };
      case 'unsafe':
      default:
        return {
          bg: 'bg-red-50 text-red-800 border-red-300',
          badge: 'bg-red-600 text-white',
          icon: ShieldAlert,
          label: 'Keep Windows Closed',
        };
    }
  };

  const vBadge = getVentilationBadge(ventilation?.status || 'caution');
  const VIcon = vBadge.icon;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sage/20 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage/20 text-forest text-xs font-bold mb-2">
            <Home className="w-3.5 h-3.5" /> Household Micro-Environment Guardian
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-forest">
            Indoor Air Coach
          </h1>
          <p className="text-xs text-charcoal/70 mt-1">
            Outdoor pollution penetrates indoors, while cooking & dust create internal spikes. Protect your family's living sanctuary.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-sage/30 hover:bg-ivory rounded-2xl text-xs font-semibold text-forest shadow-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 rounded-3xl bg-white border border-sage/20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-forest">Analyzing indoor vs outdoor exposure parameters...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Ventilation Guidance Card */}
          <div className={`p-6 sm:p-8 rounded-3xl border ${vBadge.bg} shadow-sm space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-charcoal/10">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${vBadge.badge}`}>
                  {vBadge.label}
                </span>
                <span className="text-xs font-medium opacity-80">
                  Outdoor: {outdoor?.city} (AQI {outdoor?.aqi} • {outdoor?.category})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold opacity-90">
                <Clock className="w-3.5 h-3.5" />
                <span>Recommended Window: {ventilation?.bestWindowToday}</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center shrink-0 shadow-xs">
                <VIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl">{ventilation?.title}</h3>
                <p className="mt-1 text-xs sm:text-sm font-normal leading-relaxed opacity-95">
                  {ventilation?.advice}
                </p>
              </div>
            </div>
          </div>

          {/* Cooking Protection & Fuel-Specific Strategy */}
          {cooking && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-sage/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sage/20">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-dark" />
                  <h3 className="font-heading font-bold text-lg text-forest">
                    Cooking Emissions Protocol: {cooking.fuelName}
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber/15 text-amber-dark">
                  {cooking.riskLevel}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-ivory/60 border border-sage/20 text-xs text-charcoal/80">
                <strong className="text-forest">Primary Hazard:</strong> {cooking.keyRisk}
              </div>

              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal/60">
                  Recommended Mitigation Habits
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {cooking.actions.map((act: string, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-ivory/40 border border-sage/20 text-xs text-charcoal space-y-2 flex flex-col justify-between">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Practical Low-Cost Improvements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-forest">Low-Cost & Zero-Cost Household Safeguards</h3>
              <span className="text-xs text-charcoal/60">Scientifically Validated</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tips.map((tip: any) => (
                <div
                  key={tip.id}
                  className="p-5 rounded-2xl bg-white border border-sage/20 shadow-xs hover:border-forest/30 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-forest">{tip.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest/10 text-forest">
                      {tip.cost}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal/80 leading-relaxed font-normal">
                    {tip.description}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-sage-dark">
                    <span>{tip.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
