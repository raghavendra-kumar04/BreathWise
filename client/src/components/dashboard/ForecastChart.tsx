import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface ForecastProps {
  hourlyForecast?: Array<{
    time: string;
    aqi: number;
    category: string;
    pm25: number;
  }>;
  dailyForecast?: Array<{
    date: string;
    avgAqi: number;
    maxAqi: number;
    category: string;
  }>;
}

export const ForecastChart: React.FC<ForecastProps> = ({ hourlyForecast, dailyForecast }) => {
  const chartData = (hourlyForecast || []).map((item) => {
    const d = new Date(item.time);
    const hourLabel = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    return {
      hour: hourLabel,
      aqi: item.aqi,
      pm25: Math.round(item.pm25),
      category: item.category,
    };
  });

  return (
    <div className="p-6 rounded-3xl bg-white border border-sage/20 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-sage/20">
        <div>
          <h3 className="font-heading font-bold text-base text-forest">24-Hour Pollution Trajectory</h3>
          <p className="text-xs text-charcoal/60 mt-0.5">High-resolution Open-Meteo atmospheric dispersion model</p>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-forest/5 border border-forest/15 font-semibold text-forest">
          Model Forecast
        </span>
      </div>

      <div className="h-60 w-full pt-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0efe8" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#727a76' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#727a76' }} tickLine={false} domain={[0, 'auto']} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-charcoal text-ivory p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                        <p className="font-bold">{data.hour}</p>
                        <p className="text-sage">AQI: {data.aqi} ({data.category})</p>
                        <p className="text-charcoal-light">PM2.5: {data.pm25} µg/m³</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={100} stroke="#A3C853" strokeDasharray="3 3" label={{ value: 'Satisfactory (100)', fill: '#A3C853', fontSize: 10 }} />
              <ReferenceLine y={200} stroke="#FFF833" strokeDasharray="3 3" />
              <ReferenceLine y={300} stroke="#F29C33" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="aqi"
                stroke="#203C32"
                strokeWidth={3}
                dot={{ r: 2, fill: '#203C32' }}
                activeDot={{ r: 5, fill: '#E5A65A' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-charcoal/50">
            Awaiting trajectory data...
          </div>
        )}
      </div>

      {/* 5-day strip */}
      {dailyForecast && dailyForecast.length > 0 && (
        <div className="pt-3 border-t border-sage/20 grid grid-cols-5 gap-2 text-center">
          {dailyForecast.map((df, idx) => {
            const dayName = idx === 0 ? 'Today' : new Date(df.date).toLocaleDateString([], { weekday: 'short' });
            return (
              <div key={idx} className="p-2 rounded-xl bg-ivory/60 border border-sage/20 text-xs">
                <span className="block text-[10px] text-charcoal/60 font-semibold">{dayName}</span>
                <span className="font-heading font-black text-sm text-forest mt-0.5 block">{df.avgAqi}</span>
                <span className="text-[9px] text-charcoal/70 uppercase block">{df.category}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
