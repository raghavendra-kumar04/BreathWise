import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AQICard } from '../components/dashboard/AQICard';
import { PollutantGrid } from '../components/dashboard/PollutantGrid';
import { ForecastChart } from '../components/dashboard/ForecastChart';
import { NearbyStations } from '../components/dashboard/NearbyStations';
import { PersonaRiskCard } from '../components/dashboard/PersonaRiskCard';
import { LocationModal } from '../components/location/LocationModal';
import {
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Sliders,
  Calendar,
  Home,
  Bot,
  HeartPulse,
  Baby,
  Activity,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, activeLocation } = useAuth();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Active coordinates
  const lat = activeLocation.latitude;
  const lon = activeLocation.longitude;
  const city = activeLocation.city;

  // 1. Current Live Air Quality Query (CPCB priority + Open-Meteo fallback)
  const {
    data: airData,
    isLoading: isAirLoading,
    refetch: refetchAir,
    isRefetching,
  } = useQuery({
    queryKey: ['airQualityCurrent', lat, lon, city],
    queryFn: async () => {
      const res = await api.get(`/air-quality/current?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 15, // 15 mins cache
  });

  // 2. Forecast Query
  const { data: forecastData } = useQuery({
    queryKey: ['airQualityForecast', lat, lon],
    queryFn: async () => {
      const res = await api.get(`/air-quality/forecast?lat=${lat}&lon=${lon}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 30, // 30 mins cache
  });

  // 3. Nearby Stations Query
  const { data: stationsData } = useQuery({
    queryKey: ['nearbyStations', lat, lon, city],
    queryFn: async () => {
      const res = await api.get(`/air-quality/stations?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`);
      return res.data?.stations || [];
    },
    staleTime: 1000 * 60 * 60,
  });

  // Activity suitability logic based on current AQI
  const currentAqi = airData?.aqi ?? 150;
  const getActivitySuitability = () => {
    if (currentAqi <= 50) {
      return {
        exercise: { status: 'ideal', label: 'Ideal for Outdoor Sports', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
        commute: { status: 'safe', label: 'Any Commute Mode Safe', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
        windows: { status: 'open', label: 'Open Windows & Air Rooms', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      };
    } else if (currentAqi <= 100) {
      return {
        exercise: { status: 'moderate', label: 'Suitable for Most People', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
        commute: { status: 'safe', label: 'Standard Commute', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
        windows: { status: 'open', label: 'Safe for Ventilation', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      };
    } else if (currentAqi <= 200) {
      return {
        exercise: { status: 'caution', label: 'Limit High-Intensity Running', icon: AlertCircle, color: 'text-amber-800 bg-amber-50 border-amber-200' },
        commute: { status: 'caution', label: 'Prefer Closed Vehicles / Masks', icon: AlertCircle, color: 'text-amber-800 bg-amber-50 border-amber-200' },
        windows: { status: 'caution', label: 'Ventilate Midday Only', icon: AlertCircle, color: 'text-amber-800 bg-amber-50 border-amber-200' },
      };
    } else {
      return {
        exercise: { status: 'avoid', label: 'Avoid All Outdoor Exertion', icon: XCircle, color: 'text-red-700 bg-red-50 border-red-200' },
        commute: { status: 'avoid', label: 'N95 Respirator Required', icon: ShieldAlert, color: 'text-red-700 bg-red-50 border-red-200' },
        windows: { status: 'avoid', label: 'Keep Windows Sealed', icon: XCircle, color: 'text-red-700 bg-red-50 border-red-200' },
      };
    }
  };

  const suitability = getActivitySuitability();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans space-y-6">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sage/20 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sage-dark uppercase tracking-wider">
              Live Air Quality Dashboard
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-forest mt-0.5">
            Good day, {user?.name?.split(' ')[0] || 'Friend'}
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Real-time telemetry and protective decision intelligence for {city}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetchAir()}
            disabled={isRefetching}
            className="p-2.5 rounded-2xl bg-white border border-sage/30 hover:bg-ivory text-forest transition shadow-xs disabled:opacity-50"
            title="Refresh Air Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-2 bg-white rounded-2xl border border-sage/30 shadow-xs hover:shadow-md hover:border-forest/50 transition text-left cursor-pointer"
            title="Click here to change location"
          >
            <div className="w-8 h-8 rounded-xl bg-forest/10 text-forest group-hover:bg-forest group-hover:text-ivory transition flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-forest flex items-center gap-1">
                <span>{city}</span>
                {activeLocation.state && <span className="text-charcoal/50 font-normal">({activeLocation.state})</span>}
              </p>
              <p className="text-[10px] text-sage-dark group-hover:text-forest font-medium transition">
                Click here to change location
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Weather Strip */}
      {airData?.weather && (
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-white border border-sage/20 text-xs shadow-xs">
          <div className="flex items-center gap-1.5 text-forest font-semibold">
            <Thermometer className="w-4 h-4 text-amber" />
            <span>{airData.weather.temperature}°C</span>
            <span className="text-charcoal/60 font-normal">({airData.weather.conditionText})</span>
          </div>
          <div className="flex items-center gap-1.5 text-forest font-semibold">
            <Droplets className="w-4 h-4 text-sage" />
            <span>Humidity: {airData.weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-forest font-semibold">
            <Wind className="w-4 h-4 text-forest" />
            <span>Wind: {airData.weather.windSpeed} km/h</span>
          </div>
        </div>
      )}

      {/* Main AQI Hero + Planner Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isAirLoading ? (
            <div className="p-12 rounded-3xl bg-white border border-sage/20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-forest">Contacting nearest CPCB monitoring station...</p>
            </div>
          ) : airData ? (
            <AQICard
              aqi={airData.aqi}
              category={airData.category}
              prominentPollutant={airData.prominentPollutant}
              source={airData.source}
              sourceType={airData.sourceType}
              stationName={airData.stationName}
              distanceKm={airData.stationDistanceKm}
              observedAt={airData.observedAt}
              isModelFallback={airData.isModelFallback}
            />
          ) : (
            <div className="p-6 rounded-3xl bg-amber/10 border border-amber/30 text-amber-dark text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Failed to load environmental records for this coordinate. Please select another city.</span>
            </div>
          )}
        </div>

        {/* Gemini Action Card */}
        <div className="p-6 rounded-3xl bg-white border border-sage/20 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber/15 text-amber-dark text-[10px] font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Google Gemini 2.5 Flash
            </div>
            <h3 className="font-heading font-bold text-lg text-forest">AI Daily Action Planner</h3>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              Based on your commute (<strong className="text-forest">Metro/Bus</strong>) and today's AQI (<strong className="text-forest">{airData?.aqi || '--'}</strong>), Gemini generates morning briefings, mask schedules, and ventilation safe hours.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-sage/20 space-y-2">
            <Link
              to="/planner"
              className="w-full py-2.5 px-4 rounded-xl bg-forest hover:bg-forest-light text-ivory font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <span>View Daily Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* NEW: Activity Suitability Quick-Glance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Exercise Suitability */}
        <div className={`p-4 rounded-2xl border ${suitability.exercise.color} flex items-center justify-between`}>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Outdoor Exercise</span>
            <p className="font-heading font-bold text-xs">{suitability.exercise.label}</p>
          </div>
          <Activity className="w-5 h-5 shrink-0 opacity-80" />
        </div>

        {/* Commute Suitability */}
        <div className={`p-4 rounded-2xl border ${suitability.commute.color} flex items-center justify-between`}>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Commute Protection</span>
            <p className="font-heading font-bold text-xs">{suitability.commute.label}</p>
          </div>
          <Wind className="w-5 h-5 shrink-0 opacity-80" />
        </div>

        {/* Ventilation Suitability */}
        <div className={`p-4 rounded-2xl border ${suitability.windows.color} flex items-center justify-between`}>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Home Ventilation</span>
            <p className="font-heading font-bold text-xs">{suitability.windows.label}</p>
          </div>
          <Home className="w-5 h-5 shrink-0 opacity-80" />
        </div>
      </div>

      {/* Contextual Persona-Based Risk Intelligence Banner */}
      {airData && (
        <PersonaRiskCard
          aqi={airData.aqi}
          category={airData.category}
          prominentPollutant={airData.prominentPollutant}
        />
      )}

      {/* Pollutant Breakdown Grid */}
      {airData?.pollutants && (
        <PollutantGrid pollutants={airData.pollutants} />
      )}

      {/* Forecast Chart & Nearby Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ForecastChart
            hourlyForecast={forecastData?.hourlyForecast}
            dailyForecast={forecastData?.fiveDayDaily}
          />
        </div>
        <div>
          <NearbyStations
            stations={stationsData}
            activeStationName={airData?.stationName}
          />
        </div>
      </div>

      {/* NEW: Sensitive Groups & Health Guidance Strip */}
      <div className="p-6 rounded-3xl bg-white border border-sage/20 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-sage/20">
          <HeartPulse className="w-5 h-5 text-red-600" />
          <h3 className="font-heading font-bold text-base text-forest">
            Health Advisories for Sensitive Demographics in {city}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-ivory/60 border border-sage/20 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-forest">
              <Baby className="w-4 h-4 text-amber-dark" />
              <span>Children & Infants</span>
            </div>
            <p className="text-charcoal/70 leading-relaxed text-[11px]">
              Higher respiratory rates mean children inhale up to 50% more air per kg of body weight. Restrict outdoor playground activity when PM2.5 exceeds 120 µg/m³.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-ivory/60 border border-sage/20 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-forest">
              <HeartPulse className="w-4 h-4 text-red-600" />
              <span>Cardiac & Asthmatic Patients</span>
            </div>
            <p className="text-charcoal/70 leading-relaxed text-[11px]">
              Microscopic PM2.5 can pass through alveolar sacs into the bloodstream, triggering vascular inflammation. Keep prescribed quick-relief inhalers accessible.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-ivory/60 border border-sage/20 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-forest">
              <Wind className="w-4 h-4 text-sage-dark" />
              <span>Active Runners & Athletes</span>
            </div>
            <p className="text-charcoal/70 leading-relaxed text-[11px]">
              Heavy aerobic breathing bypasses nasal filtration. Shift distance workouts to early afternoons or indoor gyms when surface smog disperses.
            </p>
          </div>
        </div>
      </div>

      {/* NEW: Navigation Quick Shortcuts Hub */}
      <div className="p-6 rounded-3xl bg-forest text-ivory shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-forest-light">
          <div>
            <h3 className="font-heading font-bold text-base">Quick Access Hub</h3>
            <p className="text-xs text-ivory/70">Jump into specialized BreatheWise companion tools</p>
          </div>
          <span className="text-[10px] bg-forest-light text-sage px-2.5 py-1 rounded-full font-bold">
            All Modules Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/planner"
            className="p-3.5 rounded-2xl bg-forest-light/60 hover:bg-forest-light transition flex flex-col justify-between space-y-2 group"
          >
            <Calendar className="w-5 h-5 text-amber group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-xs block">AI Daily Planner</span>
              <span className="text-[10px] text-ivory/70">5 personalized tasks</span>
            </div>
          </Link>

          <Link
            to="/indoor-air"
            className="p-3.5 rounded-2xl bg-forest-light/60 hover:bg-forest-light transition flex flex-col justify-between space-y-2 group"
          >
            <Home className="w-5 h-5 text-sage group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-xs block">Indoor Coach</span>
              <span className="text-[10px] text-ivory/70">Ventilation timer</span>
            </div>
          </Link>

          <Link
            to="/simulator"
            className="p-3.5 rounded-2xl bg-forest-light/60 hover:bg-forest-light transition flex flex-col justify-between space-y-2 group"
          >
            <Sliders className="w-5 h-5 text-amber group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-xs block">What-If Simulator</span>
              <span className="text-[10px] text-ivory/70">Commute CO₂ trade-offs</span>
            </div>
          </Link>

          <Link
            to="/assistant"
            className="p-3.5 rounded-2xl bg-forest-light/60 hover:bg-forest-light transition flex flex-col justify-between space-y-2 group"
          >
            <Bot className="w-5 h-5 text-sage group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-xs block">AI Chatbot</span>
              <span className="text-[10px] text-ivory/70">Ask Gemini anything</span>
            </div>
          </Link>
        </div>
      </div>

      <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
    </div>
  );
};
