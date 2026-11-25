import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  Sliders,
  TrendingDown,
  Leaf,
  IndianRupee,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<'petrol-car' | 'diesel-car' | 'two-wheeler' | 'cab'>('two-wheeler');
  const [targetMode, setTargetMode] = useState<'metro' | 'cng-bus' | 'cycling' | 'wfh' | 'ev'>('metro');
  const [dailyRoundTripKm, setDailyRoundTripKm] = useState<number>(24);
  const [commuteDaysPerWeek, setCommuteDaysPerWeek] = useState<number>(5);

  const simulateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/insights/simulator', payload);
      return res.data?.result;
    },
  });

  const handleSimulate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    simulateMutation.mutate({
      currentMode,
      targetMode,
      dailyRoundTripKm,
      commuteDaysPerWeek,
    });
  };

  // Run initial simulation on component mount if empty
  React.useEffect(() => {
    handleSimulate();
  }, [currentMode, targetMode, dailyRoundTripKm, commuteDaysPerWeek]);

  const result = simulateMutation.data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sage/20 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber/15 text-amber-dark text-xs font-bold mb-2">
            <Sliders className="w-3.5 h-3.5" /> Decision-Support System
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-forest">
            What-If Impact Simulator
          </h1>
          <p className="text-xs text-charcoal/70 mt-1">
            Model the tangible carbon, particulate exposure, and financial trade-offs of shifting commute modes across Indian cities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-1 bg-white p-6 sm:p-7 rounded-3xl border border-sage/20 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-sage/20">
            <Sliders className="w-5 h-5 text-forest" />
            <h3 className="font-heading font-bold text-base text-forest">Scenario Parameters</h3>
          </div>

          <form onSubmit={handleSimulate} className="space-y-5 text-xs">
            {/* Current Commute */}
            <div>
              <label className="block font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Current Commute Mode
              </label>
              <select
                value={currentMode}
                onChange={(e: any) => setCurrentMode(e.target.value)}
                className="w-full p-2.5 bg-ivory rounded-xl border border-sage/30 text-charcoal focus:outline-none focus:border-forest"
              >
                <option value="two-wheeler">Two-Wheeler (Motorcycle / Scooter)</option>
                <option value="petrol-car">Petrol Car (Single Occupant)</option>
                <option value="diesel-car">Diesel Car / SUV</option>
                <option value="cab">Ride-Hailing Cab / Auto</option>
              </select>
            </div>

            {/* Target Commute */}
            <div>
              <label className="block font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Alternative Scenario Mode
              </label>
              <select
                value={targetMode}
                onChange={(e: any) => setTargetMode(e.target.value)}
                className="w-full p-2.5 bg-ivory rounded-xl border border-sage/30 text-charcoal focus:outline-none focus:border-forest"
              >
                <option value="metro">Delhi / Bengaluru Metro Rail</option>
                <option value="cng-bus">CNG City Bus Transit</option>
                <option value="ev">Electric Two-Wheeler / EV</option>
                <option value="cycling">Bicycle Commute</option>
                <option value="wfh">Work from Home (WFH)</option>
              </select>
            </div>

            {/* Distance Slider */}
            <div>
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="text-charcoal uppercase tracking-wider">Round-Trip Distance</span>
                <span className="text-forest font-extrabold text-sm">{dailyRoundTripKm} km/day</span>
              </div>
              <input
                type="range"
                min="4"
                max="80"
                step="2"
                value={dailyRoundTripKm}
                onChange={(e) => setDailyRoundTripKm(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-charcoal/40">
                <span>4 km</span>
                <span>40 km</span>
                <span>80 km</span>
              </div>
            </div>

            {/* Commute Days */}
            <div>
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="text-charcoal uppercase tracking-wider">Travel Days Per Week</span>
                <span className="text-forest font-extrabold text-sm">{commuteDaysPerWeek} days</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                value={commuteDaysPerWeek}
                onChange={(e) => setCommuteDaysPerWeek(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
            </div>
          </form>

          {/* Model Transparency Box */}
          <div className="p-3.5 rounded-2xl bg-ivory/70 border border-sage/20 text-[11px] text-charcoal/70 space-y-1">
            <div className="flex items-center gap-1 font-bold text-forest">
              <Info className="w-3.5 h-3.5" />
              <span>Transparent Formula Baseline</span>
            </div>
            <p>
              Calculated using Ministry of Petroleum & Natural Gas (MoPNG) and CPCB mobile source emission factors per passenger-km.
            </p>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {result && (
            <>
              {/* Highlight Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* CO2 Saved */}
                <div className="p-5 rounded-3xl bg-forest text-ivory shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-sage">Carbon Reduction</span>
                    <TrendingDown className="w-4 h-4 text-amber" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading font-black text-3xl">{result.co2SavedKgMonthly}</span>
                    <span className="text-xs text-ivory/70">kg CO₂ / mo</span>
                  </div>
                  <span className="text-[10px] bg-forest-light px-2 py-0.5 rounded-full inline-block font-bold">
                    -{result.co2ReductionPercent}% emission cut
                  </span>
                </div>

                {/* Money Saved */}
                <div className="p-5 rounded-3xl bg-white border border-sage/20 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-charcoal/60">Estimated Savings</span>
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading font-black text-3xl text-forest">
                      ₹{result.costComparisonInr.moneySavedMonthly}
                    </span>
                    <span className="text-xs text-charcoal/50">/ month</span>
                  </div>
                  <span className="text-[10px] text-charcoal/60 block">
                    Fuel vs Transit Fare
                  </span>
                </div>

                {/* Particulate Dust Avoided */}
                <div className="p-5 rounded-3xl bg-white border border-sage/20 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-charcoal/60">Road Dust Avoided</span>
                    <ShieldCheck className="w-4 h-4 text-amber-dark" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading font-black text-3xl text-forest">
                      {result.particulateAvoidedGramsMonthly}
                    </span>
                    <span className="text-xs text-charcoal/50">g PM2.5 / mo</span>
                  </div>
                  <span className="text-[10px] text-charcoal/60 block">
                    Brake & exhaust particulates
                  </span>
                </div>
              </div>

              {/* Equivalency & Health Narrative */}
              <div className="p-6 rounded-3xl bg-white border border-sage/20 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-sage/20">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-heading font-bold text-base text-forest">Environmental & Physiological Impact</h3>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 leading-relaxed font-medium">
                  {result.environmentalEquivalency}
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60">
                    Direct Health Protection
                  </span>
                  <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed font-normal">
                    {result.healthInsight}
                  </p>
                </div>
              </div>

              {/* Monthly Emission Comparison Table */}
              <div className="p-6 rounded-3xl bg-white border border-sage/20 shadow-sm space-y-3">
                <h4 className="font-heading font-bold text-sm text-forest">Monthly Comparative Breakdown</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-ivory/50">
                    <span className="font-semibold text-charcoal">Baseline ({currentMode})</span>
                    <span className="font-mono font-bold text-charcoal">{result.baselineCo2KgMonthly} kg CO₂ • ₹{result.costComparisonInr.baselineFuelCostMonthly}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-forest/5 border border-forest/20">
                    <span className="font-bold text-forest">Target Scenario ({targetMode})</span>
                    <span className="font-mono font-bold text-forest">{result.targetCo2KgMonthly} kg CO₂ • ₹{result.costComparisonInr.targetModeCostMonthly}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
