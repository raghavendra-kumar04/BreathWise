import React from 'react';

interface PollutantsProps {
  pollutants: {
    pm25?: number;
    pm10?: number;
    no2?: number;
    so2?: number;
    co?: number;
    o3?: number;
    nh3?: number;
  };
}

export const PollutantGrid: React.FC<PollutantsProps> = ({ pollutants }) => {
  const items = [
    {
      id: 'pm25',
      name: 'PM2.5',
      fullName: 'Fine Particles (<2.5 µm)',
      unit: 'µg/m³',
      value: pollutants.pm25,
      safeLimit: 60,
      description: 'Penetrates deep into respiratory tract and bloodstream.',
    },
    {
      id: 'pm10',
      name: 'PM10',
      fullName: 'Coarse Particulates (<10 µm)',
      unit: 'µg/m³',
      value: pollutants.pm10,
      safeLimit: 100,
      description: 'Dust from roads, construction, and mechanical abrasion.',
    },
    {
      id: 'no2',
      name: 'NO₂',
      fullName: 'Nitrogen Dioxide',
      unit: 'µg/m³',
      value: pollutants.no2,
      safeLimit: 80,
      description: 'High temperature fuel combustion from vehicles and power.',
    },
    {
      id: 'so2',
      name: 'SO₂',
      fullName: 'Sulphur Dioxide',
      unit: 'µg/m³',
      value: pollutants.so2,
      safeLimit: 80,
      description: 'Industrial emissions and coal combustion.',
    },
    {
      id: 'co',
      name: 'CO',
      fullName: 'Carbon Monoxide',
      unit: 'mg/m³',
      value: pollutants.co ? (pollutants.co > 100 ? (pollutants.co / 1000).toFixed(2) : pollutants.co) : undefined,
      safeLimit: 2.0,
      description: 'Incomplete combustion in petrol/diesel engines.',
    },
    {
      id: 'o3',
      name: 'Ozone (O₃)',
      fullName: 'Ground Ozone',
      unit: 'µg/m³',
      value: pollutants.o3,
      safeLimit: 100,
      description: 'Secondary photochemical pollutant triggered by sunlight.',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-base text-forest">Pollutant Concentration Breakdown</h3>
        <span className="text-xs text-charcoal/60">Official CPCB NAQI Standards</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => {
          const valNum = typeof item.value === 'string' ? parseFloat(item.value) : item.value;
          const isElevated = valNum !== undefined && !isNaN(valNum) && valNum > item.safeLimit;

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white border border-sage/20 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-extrabold text-sm text-forest">{item.name}</span>
                  <span className="text-[10px] text-charcoal/50 font-mono">
                    Limit: {item.safeLimit} {item.unit}
                  </span>
                </div>
                <p className="text-[10px] text-charcoal/60 truncate mt-0.5">{item.fullName}</p>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className={`font-heading font-extrabold text-2xl ${isElevated ? 'text-amber-dark' : 'text-forest'}`}>
                  {item.value !== undefined ? item.value : '—'}
                </span>
                <span className="text-[11px] text-charcoal/50">{item.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
