import React from 'react';
import { Radio, MapPin } from 'lucide-react';

interface Station {
  station: string;
  city: string;
  distanceKm: number;
  aqi: number;
  category: string;
  lastUpdate: string;
}

interface NearbyStationsProps {
  stations?: Station[];
  activeStationName?: string;
}

export const NearbyStations: React.FC<NearbyStationsProps> = ({ stations, activeStationName }) => {
  if (!stations || stations.length === 0) return null;

  return (
    <div className="p-6 rounded-3xl bg-white border border-sage/20 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-sage/20">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-forest animate-pulse" />
          <h3 className="font-heading font-bold text-base text-forest">Nearby CPCB Monitoring Stations</h3>
        </div>
        <span className="text-xs text-charcoal/50">{stations.length} active stations</span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {stations.map((st, i) => {
          const isSelected = st.station === activeStationName;
          return (
            <div
              key={i}
              className={`p-3 rounded-2xl border transition flex items-center justify-between text-xs ${
                isSelected
                  ? 'bg-forest/5 border-forest/30 shadow-xs'
                  : 'bg-ivory/40 border-sage/20 hover:border-sage/40'
              }`}
            >
              <div className="space-y-0.5 truncate max-w-[280px]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-forest shrink-0" />
                  <p className="font-bold text-forest truncate">{st.station}</p>
                </div>
                <p className="text-[10px] text-charcoal/60 pl-5">
                  {st.distanceKm} km away • {st.city}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-heading font-black text-sm text-forest block">
                  AQI {st.aqi}
                </span>
                <span className="text-[10px] text-charcoal/60 uppercase">{st.category}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
