import { calculateCommuteImpact } from '../utils/emissionsCalculator';

describe('Transparent Indian Mobility Emission Simulator (MoPNG & CPCB baselines)', () => {
  test('calculates monthly CO2 reduction switching from Petrol Car to Metro', () => {
    const res = calculateCommuteImpact({
      currentMode: 'petrol-car',
      targetMode: 'metro',
      dailyRoundTripKm: 20,
      commuteDaysPerWeek: 5,
    });

    // 20 km * (5 * 4.3 = 21.5 days) = 430 km/month
    // Petrol car baseline: 430 * 140g = 60.2 kg CO2 -> rounded to 60 kg
    // Metro target: 430 * 12g = 5.16 kg CO2 -> rounded to 5 kg
    expect(res.baselineCo2KgMonthly).toBe(60);
    expect(res.targetCo2KgMonthly).toBe(5);
    expect(res.co2SavedKgMonthly).toBeGreaterThan(50);
    expect(res.co2ReductionPercent).toBeGreaterThan(90);
  });

  test('calculates substantial fuel cost savings in INR when switching to Cycling', () => {
    const res = calculateCommuteImpact({
      currentMode: 'petrol-car',
      targetMode: 'cycling',
      dailyRoundTripKm: 10,
      commuteDaysPerWeek: 5,
    });

    // Cycling cost is nominal (~22 INR maintenance) compared to petrol car (~1828 INR)
    expect(res.costComparisonInr.targetModeCostMonthly).toBeLessThanOrEqual(30);
    expect(res.costComparisonInr.moneySavedMonthly).toBeGreaterThan(1500);
    expect(res.co2ReductionPercent).toBe(100);
  });

  test('computes positive particulate matter avoided', () => {
    const res = calculateCommuteImpact({
      currentMode: 'diesel-car',
      targetMode: 'cng-bus',
      dailyRoundTripKm: 30,
      commuteDaysPerWeek: 5,
    });

    expect(res.particulateAvoidedGramsMonthly).toBeGreaterThan(0);
    expect(res.environmentalEquivalency).toContain('tree');
  });
});
