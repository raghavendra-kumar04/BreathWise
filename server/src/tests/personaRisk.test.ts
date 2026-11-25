/**
 * Clinical and Exposure Decision Logic Tests
 * Validates dynamic risk level thresholds, clinical advisory outputs,
 * and vulnerability-specific precautions across Indian air quality categories.
 */

export interface PersonaAdvice {
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  commuteAdvice: string;
  exerciseAdvice: string;
  indoorAdvice: string;
  clinicalNote: string;
}

export function evaluatePersonaRisk(
  personaId: 'general' | 'asthma' | 'pediatric' | 'senior',
  aqi: number
): PersonaAdvice {
  switch (personaId) {
    case 'asthma':
      if (aqi <= 50) {
        return {
          riskLevel: 'Low',
          commuteAdvice: 'Safe for normal travel. Carry your rescue inhaler as standard protocol.',
          exerciseAdvice: 'Outdoor walks and light jogging are safe and beneficial for lung capacity.',
          indoorAdvice: 'Air out rooms thoroughly while baseline particulate levels are low.',
          clinicalNote: 'Air quality is clinically favorable for asthmatic patients today.',
        };
      }
      if (aqi <= 100) {
        return {
          riskLevel: 'High',
          commuteAdvice: 'Wear a well-fitted N95 mask outdoors. Avoid standing near diesel bus exhausts.',
          exerciseAdvice: 'Do not jog outdoors. Pre-medicate with prescribed preventive inhaler.',
          indoorAdvice: 'Keep windows shut on roadside facing rooms. Run kitchen exhaust.',
          clinicalNote: 'Sub-clinical bronchoconstriction can trigger cough reflex. Keep bronchodilator accessible.',
        };
      }
      return {
        riskLevel: 'Severe',
        commuteAdvice: 'Avoid all non-essential outdoor travel. Particulates provoke bronchial spasms.',
        exerciseAdvice: 'Zero outdoor exertion. Gentle indoor stretching only.',
        indoorAdvice: 'Operate indoor air purifier or wet-curtain filtration.',
        clinicalNote: 'High risk of acute asthma exacerbation. Follow action plan closely.',
      };

    case 'pediatric':
      if (aqi <= 50) {
        return {
          riskLevel: 'Low',
          commuteAdvice: 'Safe for walking or cycling to school.',
          exerciseAdvice: 'Outdoor play, sports, and school physical training safe.',
          indoorAdvice: 'Open classroom and bedroom windows for daytime air exchange.',
          clinicalNote: 'Alveolar respiratory rate unaffected at current air quality.',
        };
      }
      if (aqi <= 100) {
        return {
          riskLevel: 'Moderate',
          commuteAdvice: 'School van windows should stay closed during morning peak traffic.',
          exerciseAdvice: 'Limit vigorous playground games to less than 30 minutes.',
          indoorAdvice: 'Keep bedroom windows closed during early morning temperature drop.',
          clinicalNote: 'Children breathe twice as fast per kg of body weight; observe for eye rubbing.',
        };
      }
      return {
        riskLevel: 'Severe',
        commuteAdvice: 'Ensure child wears a pediatric-sized N95 or KF94 mask.',
        exerciseAdvice: 'Postpone all outdoor sports and physical training classes.',
        indoorAdvice: 'Keep children in inner rooms away from street-facing balconies.',
        clinicalNote: 'Acute particulate inhalation can aggravate developing lung tissue.',
      };

    case 'senior':
      if (aqi <= 50) {
        return {
          riskLevel: 'Low',
          commuteAdvice: 'Safe for neighborhood walks, errands, and social visits.',
          exerciseAdvice: 'Morning walks in parks are healthy and recommended.',
          indoorAdvice: 'Full natural ventilation recommended.',
          clinicalNote: 'Cardiac and vascular strain parameters within normal bounds.',
        };
      }
      if (aqi <= 100) {
        return {
          riskLevel: 'Moderate',
          commuteAdvice: 'Travel during mid-day hours when ground thermal inversion lifts.',
          exerciseAdvice: 'Shift morning walk to 8:30 AM or later when sunshine disperses mist.',
          indoorAdvice: 'Keep bedroom warm and draft-free.',
          clinicalNote: 'Fine particulates increase arterial vasoconstriction in hypertensive seniors.',
        };
      }
      return {
        riskLevel: 'Severe',
        commuteAdvice: 'Avoid stepping outdoors into heavy smog.',
        exerciseAdvice: 'Restrict physical activity to indoor walking corridors.',
        indoorAdvice: 'Hydrate well and keep indoor air free of incense/agarbatti smoke.',
        clinicalNote: 'Elevated risk of ischemic cardiac events during severe air pollution spikes.',
      };

    case 'general':
    default:
      if (aqi <= 50) {
        return {
          riskLevel: 'Low',
          commuteAdvice: 'Bicycle and two-wheeler commuting is optimal.',
          exerciseAdvice: 'Ideal for marathon training, intense outdoor jogging, and sports.',
          indoorAdvice: 'Full natural cross-ventilation encouraged throughout the day.',
          clinicalNote: 'Zero respiratory strain predicted for healthy adults.',
        };
      }
      if (aqi <= 100) {
        return {
          riskLevel: 'Moderate',
          commuteAdvice: 'Wear a bandana or light dust mask on high-traffic ring roads.',
          exerciseAdvice: 'Outdoor running is safe, but prefer tree-canopied parks.',
          indoorAdvice: 'Open windows mid-day once solar radiation disperses early dust.',
          clinicalNote: 'Minor throat dryness possible during sustained strenuous breathing.',
        };
      }
      if (aqi <= 200) {
        return {
          riskLevel: 'High',
          commuteAdvice: 'Shift to Metro or bus where possible. Wear N95 on two-wheeler.',
          exerciseAdvice: 'Move cardio indoors. Replace outdoor jogging with gym workouts.',
          indoorAdvice: 'Keep windows closed between 6:00 AM - 9:00 AM.',
          clinicalNote: 'Increased airway resistance; stay hydrated.',
        };
      }
      return {
        riskLevel: 'Severe',
        commuteAdvice: 'Avoid two-wheeler riding. Travel in sealed public transit.',
        exerciseAdvice: 'Strictly avoid outdoor cardiovascular activity.',
        indoorAdvice: 'Seal door under-cracks and operate air filtration.',
        clinicalNote: 'Particulate exposure exceeds safe limits; wear N95 mask.',
      };
  }
}

describe('Persona Risk & Clinical Decision Logic Suite', () => {
  describe('Asthmatic Persona Sensitivity Testing', () => {
    test('triggers High Risk at moderate AQI 75 (lowered threshold for reactive airways)', () => {
      const advice = evaluatePersonaRisk('asthma', 75);
      expect(advice.riskLevel).toBe('High');
      expect(advice.exerciseAdvice).toContain('Do not jog outdoors');
      expect(advice.clinicalNote).toContain('Keep bronchodilator accessible');
    });

    test('maintains Low Risk when AQI is Good (<= 50)', () => {
      const advice = evaluatePersonaRisk('asthma', 35);
      expect(advice.riskLevel).toBe('Low');
      expect(advice.clinicalNote).toContain('clinically favorable');
    });

    test('escalates to Severe Risk at AQI > 100', () => {
      const advice = evaluatePersonaRisk('asthma', 180);
      expect(advice.riskLevel).toBe('Severe');
      expect(advice.clinicalNote).toContain('High risk of acute asthma exacerbation');
    });
  });

  describe('Pediatric Persona Vulnerability Testing', () => {
    test('advises closing school van windows at AQI 85', () => {
      const advice = evaluatePersonaRisk('pediatric', 85);
      expect(advice.riskLevel).toBe('Moderate');
      expect(advice.commuteAdvice).toContain('School van windows should stay closed');
      expect(advice.clinicalNote).toContain('Children breathe twice as fast per kg');
    });

    test('recommends postponing outdoor PT sports when air is Poor (AQI 220)', () => {
      const advice = evaluatePersonaRisk('pediatric', 220);
      expect(advice.riskLevel).toBe('Severe');
      expect(advice.exerciseAdvice).toContain('Postpone all outdoor sports');
    });
  });

  describe('Senior Citizen Cardiovascular Testing', () => {
    test('highlights arterial vasoconstriction risk at AQI 90', () => {
      const advice = evaluatePersonaRisk('senior', 90);
      expect(advice.clinicalNote).toContain('vasoconstriction');
      expect(advice.exerciseAdvice).toContain('8:30 AM or later');
    });

    test('warns against ischemic cardiac events at severe pollution levels (AQI 320)', () => {
      const advice = evaluatePersonaRisk('senior', 320);
      expect(advice.riskLevel).toBe('Severe');
      expect(advice.clinicalNote).toContain('ischemic cardiac events');
    });
  });

  describe('General Commuter Baseline Testing', () => {
    test('confirms zero respiratory strain at clean AQI 25', () => {
      const advice = evaluatePersonaRisk('general', 25);
      expect(advice.riskLevel).toBe('Low');
      expect(advice.exerciseAdvice).toContain('Ideal for marathon training');
    });

    test('tolerates moderate AQI up to 100 before escalating risk', () => {
      const advice = evaluatePersonaRisk('general', 95);
      expect(advice.riskLevel).toBe('Moderate');
    });

    test('recommends N95 mask on two-wheeler when AQI is High (AQI 160)', () => {
      const advice = evaluatePersonaRisk('general', 160);
      expect(advice.riskLevel).toBe('High');
      expect(advice.commuteAdvice).toContain('Wear N95');
    });
  });
});
