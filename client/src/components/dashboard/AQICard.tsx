import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Info, Wind } from 'lucide-react';

interface AQICardProps {
  aqi: number;
  category: string;
  prominentPollutant?: string;
  source: string;
  sourceType?: string;
  stationName?: string;
  distanceKm?: number;
  observedAt?: string;
  isModelFallback?: boolean;
}

export const AQICard: React.FC<AQICardProps> = ({
  aqi,
  category,
  prominentPollutant,
  source,
  sourceType,
  stationName,
  distanceKm,
  observedAt,
  isModelFallback,
}) => {
  const getTheme = () => {
    switch (category) {
      case 'Good':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-700',
          badge: 'bg-emerald-600 text-white',
          desc: 'Minimal impact. Air quality is considered satisfactory.',
          icon: CheckCircle2,
        };
      case 'Satisfactory':
        return {
          bg: 'bg-lime-500/10',
          border: 'border-lime-500/30',
          text: 'text-lime-700',
          badge: 'bg-lime-600 text-white',
          desc: 'Minor breathing discomfort to sensitive people.',
          icon: Info,
        };
      case 'Moderate':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-700',
          badge: 'bg-yellow-600 text-white',
          desc: 'Breathing discomfort to people with lungs, asthma and heart diseases.',
          icon: AlertTriangle,
        };
      case 'Poor':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-700',
          badge: 'bg-amber-600 text-white',
          desc: 'Breathing discomfort to most people on prolonged exposure.',
          icon: AlertTriangle,
        };
      case 'Very Poor':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-700',
          badge: 'bg-red-600 text-white',
          desc: 'Respiratory illness on prolonged exposure. Significant risk.',
          icon: ShieldAlert,
        };
      case 'Severe':
      default:
        return {
          bg: 'bg-rose-900/10',
          border: 'border-rose-900/30',
          text: 'text-rose-900',
          badge: 'bg-rose-900 text-white',
          desc: 'Affects healthy people and seriously impacts those with existing diseases.',
          icon: ShieldAlert,
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <div className={`p-6 sm:p-8 rounded-3xl border ${theme.border} ${theme.bg} backdrop-blur-sm relative overflow-hidden transition-all shadow-sm`}>
      {/* Top Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-charcoal/10">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${theme.badge}`}>
            {category}
          </span>
          <span className="text-xs text-charcoal/60 font-medium">Indian National AQI</span>
        </div>

        {/* Provenance Badge */}
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/70 border border-charcoal/10">
          <div className={`w-2 h-2 rounded-full ${isModelFallback ? 'bg-amber animate-pulse' : 'bg-emerald-600'}`} />
          <span>
            {source === 'CPCB'
              ? `Official CPCB Station • ${distanceKm !== undefined ? `${distanceKm} km away` : 'Live'}`
              : 'Open-Meteo Atmospheric Model'}
          </span>
          {sourceType && (
            <span className="text-[10px] text-charcoal/50">({sourceType})</span>
          )}
        </div>
      </div>

      {/* Main Gauge and Numbers */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-baseline gap-4">
          <div className="font-heading font-black text-6xl sm:text-7xl tracking-tighter text-charcoal">
            {aqi}
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal/60 block">Status Level</span>
            <div className={`font-heading font-extrabold text-2xl ${theme.text} flex items-center gap-1.5`}>
              <Icon className="w-5 h-5 shrink-0" />
              <span>{category}</span>
            </div>
          </div>
        </div>

        {prominentPollutant && (
          <div className="sm:text-right bg-white/60 p-3.5 rounded-2xl border border-charcoal/5">
            <span className="text-[11px] font-semibold text-charcoal/60 uppercase tracking-wider block">
              Primary Driver
            </span>
            <span className="font-heading font-black text-xl text-forest mt-0.5 inline-block">
              {prominentPollutant}
            </span>
          </div>
        )}
      </div>

      {/* Health Impact Description */}
      <p className="mt-4 text-xs sm:text-sm text-charcoal/80 font-normal leading-relaxed">
        {theme.desc}
      </p>

      {/* Station Details & Provenance Footer */}
      <div className="mt-6 pt-4 border-t border-charcoal/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-charcoal/60">
        <div className="truncate max-w-sm flex items-center gap-1">
          <Wind className="w-3.5 h-3.5 text-forest/70 shrink-0" />
          <span className="truncate">Station: <strong>{stationName || 'Regional India Network'}</strong></span>
        </div>
        {observedAt && (
          <span>Updated: {new Date(observedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        )}
      </div>
    </div>
  );
};
