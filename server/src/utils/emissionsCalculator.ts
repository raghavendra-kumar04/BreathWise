/**
 * Transparent Indian Emission Factors
 * Sourced from: Ministry of Petroleum & Natural Gas (MoPNG), Central Pollution Control Board (CPCB),
 * and Indian Institute of Petroleum (IIP) urban mobility emission studies.
 *
 * Emission baselines per Passenger-Kilometer (g CO2 / passenger-km):
 * - Petrol Car (average occupancy 1.3): 140 g/km
 * - Diesel Car: 135 g/km
 * - Electric Car: 55 g/km (based on Indian grid average)
 * - Two-Wheeler (Motorcycle/Scooter): 45 g/km
 * - Delhi Metro / Electric Rapid Rail: 12 g/km
 * - Compressed Natural Gas (CNG) Bus: 25 g/km
 * - Cycling / Walking: 0 g/km
 */

export interface SimulatorInput {
  currentMode: 'petrol-car' | 'diesel-car' | 'two-wheeler' | 'cab';
  targetMode: 'metro' | 'cng-bus' | 'cycling' | 'wfh' | 'ev';
  dailyRoundTripKm: number;
  commuteDaysPerWeek: number;
  indoorScenario?: 'seal-and-hepa' | 'wet-mop-and-plants' | 'exhaust-protocol';
}

export interface SimulatorResult {
  baselineCo2KgMonthly: number;
  targetCo2KgMonthly: number;
  co2SavedKgMonthly: number;
  co2ReductionPercent: number;
  particulateAvoidedGramsMonthly: number;
  costComparisonInr: {
    baselineFuelCostMonthly: number;
    targetModeCostMonthly: number;
    moneySavedMonthly: number;
  };
  healthInsight: string;
  environmentalEquivalency: string;
}

export function calculateCommuteImpact(input: SimulatorInput): SimulatorResult {
  const kmPerMonth = input.dailyRoundTripKm * (input.commuteDaysPerWeek * 4.3);

  // g CO2 per passenger-km
  const emissionFactors: Record<string, number> = {
    'petrol-car': 140,
    'diesel-car': 135,
    'two-wheeler': 45,
    'cab': 150,
    'metro': 12,
    'cng-bus': 25,
    'ev': 55,
    'cycling': 0,
    'wfh': 0,
  };

  // Approx fuel/transit cost per km in India (INR)
  const costPerKm: Record<string, number> = {
    'petrol-car': 8.5,
    'diesel-car': 7.0,
    'two-wheeler': 2.4,
    'cab': 18.0,
    'metro': 2.0,
    'cng-bus': 1.2,
    'ev': 1.8,
    'cycling': 0.1,
    'wfh': 0,
  };

  const baselineFactor = emissionFactors[input.currentMode] ?? 140;
  const targetFactor = emissionFactors[input.targetMode] ?? 12;

  const baselineCo2Kg = (baselineFactor * kmPerMonth) / 1000;
  const targetCo2Kg = (targetFactor * kmPerMonth) / 1000;
  const co2SavedKg = Math.max(0, baselineCo2Kg - targetCo2Kg);
  const reductionPercent = baselineCo2Kg > 0 ? Math.round((co2SavedKg / baselineCo2Kg) * 100) : 0;

  // Primary PM2.5 avoidance (approx 0.08g PM2.5 per km from personal vehicle exhaust + brake/tyre dust)
  const pmFactor = input.currentMode === 'two-wheeler' ? 0.04 : 0.09;
  const pmTargetFactor = (input.targetMode === 'cycling' || input.targetMode === 'wfh') ? 0 : 0.01;
  const particulateAvoidedG = Math.max(0, (pmFactor - pmTargetFactor) * kmPerMonth);

  // Financial calculations
  const baselineCost = Math.round((costPerKm[input.currentMode] ?? 8) * kmPerMonth);
  const targetCost = Math.round((costPerKm[input.targetMode] ?? 2) * kmPerMonth);
  const moneySaved = Math.max(0, baselineCost - targetCost);

  // Tree equivalency: 1 mature urban tree absorbs ~21 kg CO2 per year (~1.75 kg per month)
  const treesEquivalent = (co2SavedKg / 1.75).toFixed(1);

  return {
    baselineCo2KgMonthly: Math.round(baselineCo2Kg),
    targetCo2KgMonthly: Math.round(targetCo2Kg),
    co2SavedKgMonthly: Math.round(co2SavedKg),
    co2ReductionPercent: reductionPercent,
    particulateAvoidedGramsMonthly: parseFloat(particulateAvoidedG.toFixed(1)),
    costComparisonInr: {
      baselineFuelCostMonthly: baselineCost,
      targetModeCostMonthly: targetCost,
      moneySavedMonthly: moneySaved,
    },
    environmentalEquivalency: `Equal to the carbon sequestration of planting ${treesEquivalent} mature urban trees this month.`,
    healthInsight: `By shifting off roadway corridors, you bypass peak street-level diesel soot and ground particulate plumes during stop-and-go congestion.`,
  };
}
