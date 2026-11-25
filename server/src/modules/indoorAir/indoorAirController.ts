import { Request, Response } from 'express';
import { CPCBService } from '../../services/cpcb/cpcbService';
import { OpenMeteoService } from '../../services/openMeteo/openMeteoService';

export class IndoorAirController {
  /**
   * GET /api/indoor-air/guidance?lat=...&lon=...&city=...&cookingFuel=...
   * Evaluates outdoor PM2.5 & wind dispersion to determine ventilation safety and room tips
   */
  static async getGuidance(req: Request, res: Response) {
    try {
      const lat = parseFloat(req.query.lat as string) || 28.6139;
      const lon = parseFloat(req.query.lon as string) || 77.2090;
      const city = (req.query.city as string) || 'New Delhi';
      const cookingFuel = (req.query.cookingFuel as string) || 'lpg';

      // 1. Fetch current outdoor metrics
      let outdoorAqi = 120;
      let outdoorCategory = 'Moderate';
      let outdoorPm25 = 75;
      let stationName = 'Regional Physical Network';

      try {
        const stations = await CPCBService.getNearestStations(lat, lon, city, 30);
        if (stations.length > 0) {
          outdoorAqi = stations[0].aqi;
          outdoorCategory = stations[0].category;
          outdoorPm25 = stations[0].pollutants.pm25 || 80;
          stationName = stations[0].station;
        }
      } catch (err: unknown) {
        console.warn('IndoorAir CPCB nearest stations fetch fallback:', err);
      }

      // 2. Weather
      const weather = await OpenMeteoService.getCurrentWeather(lat, lon).catch(() => ({
        temperature: 28,
        humidity: 50,
        windSpeed: 6,
        weatherCode: 1,
        conditionText: 'Calm',
      }));

      // 3. Ventilation Logic:
      // In India, early morning hours typically feature thermal inversion (pollutants trapped near ground).
      // Windows should NOT be opened early morning or if outdoor AQI is Poor/Severe or wind is stagnant.
      const currentHour = new Date().getHours();
      const isMorningInversionHour = currentHour >= 5 && currentHour <= 9;
      const isOutdoorSevere = outdoorAqi > 250;
      const isOutdoorPoor = outdoorAqi > 150;
      const hasDecentWind = weather.windSpeed >= 8;

      let ventilationStatus: 'safe' | 'caution' | 'unsafe';
      let ventilationTitle: string;
      let ventilationAdvice: string;

      if (isOutdoorSevere || (isOutdoorPoor && isMorningInversionHour)) {
        ventilationStatus = 'unsafe';
        ventilationTitle = 'Keep Windows & Balconies Sealed';
        ventilationAdvice = `Outdoor PM2.5 is currently at ${outdoorPm25} µg/m³ with ${weather.windSpeed} km/h wind. Opening windows will flood living spaces with fine particles.`;
      } else if (isOutdoorPoor || !hasDecentWind) {
        ventilationStatus = 'caution';
        ventilationTitle = 'Limited Cross-Ventilation Only';
        ventilationAdvice = `Air quality is ${outdoorCategory} (AQI ${outdoorAqi}). If required, air rooms briefly (10-15 mins) during midday when solar heating helps disperse surface smog.`;
      } else {
        ventilationStatus = 'safe';
        ventilationTitle = 'Safe to Ventilate Living Spaces';
        ventilationAdvice = `Moderate outdoor conditions and adequate air movement (${weather.windSpeed} km/h) allow fresh air circulation without significant accumulation.`;
      }

      // 4. Targeted Cooking Recommendations based on Fuel
      const cookingGuidance = IndoorAirController.getCookingGuidance(cookingFuel);

      // 5. Practical Low-Cost Improvements
      const practicalTips = [
        {
          id: 'wet-mop',
          title: 'Wet Mopping vs Dry Sweeping',
          impact: 'High Impact',
          cost: 'Zero Cost',
          description: 'Dry broom sweeping resuspends deposited settled PM10 and heavy dust back into breathing zones. Always wet-mop floors with clean water or microfiber pads.',
        },
        {
          id: 'plants',
          title: 'Strategic Air-Filtering Flora',
          impact: 'Moderate Impact',
          cost: 'Low Cost (₹150-₹300)',
          description: 'NASA clean air study plants like Snake Plant (Sansevieria), Areca Palm, and Money Plant help capture coarse particulate dust on leaf surfaces and replenish oxygen.',
        },
        {
          id: 'door-seal',
          title: 'Door Bottom Draft Excluders',
          impact: 'Moderate Impact',
          cost: 'Low Cost (₹200)',
          description: 'Up to 30% of outdoor street dust enters through the gap under main entrance doors. A simple silicon strip or fabric snake stops dust entry.',
        },
        {
          id: 'exhaust-protocol',
          title: '15-Minute Kitchen Exhaust Overrun',
          impact: 'High Impact',
          cost: 'Zero Cost',
          description: 'Leave your kitchen exhaust fan or chimney running for 10-15 minutes after cooking finishes to evacuate lingering ultrafine oil droplets and NO2 combustion gases.',
        },
      ];

      res.status(200).json({
        outdoorContext: {
          city,
          aqi: outdoorAqi,
          category: outdoorCategory,
          pm25: outdoorPm25,
          stationName,
          windSpeed: weather.windSpeed,
          temperature: weather.temperature,
        },
        ventilation: {
          status: ventilationStatus,
          title: ventilationTitle,
          advice: ventilationAdvice,
          bestWindowToday: '01:00 PM - 03:30 PM (Midday dispersion peak)',
        },
        cookingGuidance,
        practicalTips,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate indoor air guidance: ' + err.message });
    }
  }

  private static getCookingGuidance(fuel: string) {
    switch (fuel) {
      case 'biomass':
        return {
          fuelName: 'Biomass / Traditional Chulha',
          riskLevel: 'Hazardous Indoor Exposure',
          keyRisk: 'Extremely high concentrations of carbon monoxide (CO), black carbon, and polycyclic aromatic hydrocarbons.',
          actions: [
            'Cook outdoors or in a well-ventilated dedicated shed if possible.',
            'Ensure a raised chimney pipe expels smoke away from sleeping areas.',
            'Keep infants and elderly members in separate unpolluted rooms during cooking.',
          ],
        };
      case 'induction':
        return {
          fuelName: 'Induction / Electric Cooking',
          riskLevel: 'Clean Energy Baseline',
          keyRisk: 'Only cooking oil aerosolization / frying emissions; zero toxic combustion byproducts (no NO2 or CO).',
          actions: [
            'Use standard kitchen splatter guards when cooking with mustard or groundnut oils.',
            'Regularly wipe down cooktops to prevent burnt food residues.',
          ],
        };
      case 'lpg':
      default:
        return {
          fuelName: 'LPG (Liquefied Petroleum Gas)',
          riskLevel: 'Moderate Exposure',
          keyRisk: 'Combustion generates Nitrogen Dioxide (NO2) and moisture, which can aggravate childhood asthma.',
          actions: [
            'Ensure the burner flame is crisp blue. A yellow or flickering flame indicates incomplete combustion.',
            'Always switch on the kitchen exhaust fan before lighting burners.',
            'Keep kitchen doors closed to living areas while cooking spicy or deep-fried foods.',
          ],
        };
    }
  }
}
