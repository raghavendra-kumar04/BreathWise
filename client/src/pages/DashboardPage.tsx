import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AQICard } from '../components/dashboard/AQICard';
import { PollutantGrid } from '../components/dashboard/PollutantGrid';
import { ForecastChart } from '../components/dashboard/ForecastChart';
import { NearbyStations } from '../components/dashboard/NearbyStations';
import { LocationModal } from '../components/location/LocationModal';
import { MapPin, Thermometer, Droplets, Wind, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
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
            {user?.name?.split(' ')[0] || 'Friend'}, here is your air briefing.
          </h1>
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
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-sage/30 shadow-xs hover:shadow transition text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-forest">{city}</p>
              <p className="text-[10px] text-charcoal/60">
                {user?.location?.state ? `${user.location.state} • Change` : 'Tap to change'}
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

        {/* Phase 3 Teaser: Gemini Action Card */}
        <div className="p-6 rounded-3xl bg-white border border-sage/20 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber/15 text-amber-dark text-[10px] font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Phase 3 Gemini Preview
            </div>
            <h3 className="font-heading font-bold text-lg text-forest">AI Daily Action Planner</h3>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              Based on your commute (<strong className="text-forest">Public Transit</strong>) and current AQI (<strong className="text-forest">{airData?.aqi || '--'}</strong>), Gemini generates morning briefings, mask schedules, and ventilation safe hours.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-sage/20">
            <Link
              to="/profile"
              className="w-full py-2.5 px-4 rounded-xl bg-forest/10 hover:bg-forest/15 text-forest font-semibold text-xs flex items-center justify-center transition"
            >
              Update Profile for Gemini
            </Link>
          </div>
        </div>
      </div>

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

      <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
    </div>
  );
};
