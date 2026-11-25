import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Navigation, Search, CheckCircle2, AlertCircle, Compass, Sparkles, Info } from 'lucide-react';
import axios from 'axios';
import { AuthPromptModal } from '../auth/AuthPromptModal';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickLocation {
  name: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  tag: string;
  description: string;
}

const QUICK_LOCATIONS: QuickLocation[] = [
  {
    name: 'Peteru (Repalle)',
    city: 'Peteru',
    state: 'Andhra Pradesh',
    lat: 16.0396062,
    lon: 80.8396339,
    tag: 'Rural',
    description: 'Repalle Mandal, Bapatla District',
  },
  {
    name: 'Repalle',
    city: 'Repalle',
    state: 'Andhra Pradesh',
    lat: 16.0200,
    lon: 80.8500,
    tag: 'Town',
    description: 'Bapatla District',
  },
  {
    name: 'Guntur',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    lat: 16.3067,
    lon: 80.4365,
    tag: 'City / ISP Hub',
    description: 'Includes Arundelpet, Brodipet, Nagarampalem',
  },
  {
    name: 'Vijayawada',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    lat: 16.5062,
    lon: 80.6480,
    tag: 'City',
    description: 'NTR District',
  },
  {
    name: 'Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    lat: 17.3850,
    lon: 78.4867,
    tag: 'Metro',
    description: 'Telangana Capital',
  },
  {
    name: 'Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9716,
    lon: 77.5946,
    tag: 'Metro',
    description: 'Karnataka',
  },
  {
    name: 'New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    lat: 28.6139,
    lon: 77.2090,
    tag: 'Capital',
    description: 'National Capital Region',
  },
];

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { updateLocation, activeLocation, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string; details?: string } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dedicated Auth Prompt Modal trigger for guests
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [detectedCityName, setDetectedCityName] = useState('');
  const [detectedStateName, setDetectedStateName] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleLocationConfirmed = async (
    city: string,
    state: string,
    latitude: number,
    longitude: number,
    isManualClick: boolean = false
  ) => {
    await updateLocation({ city, state, latitude, longitude });

    // If user is already logged in:
    if (user) {
      if (isManualClick) {
        setStatusMsg({ type: 'success', text: `Location set to ${city}, ${state}` });
        setTimeout(onClose, 600);
      } else {
        // Detected via Wi-Fi/GPS: Don't auto-close abruptly if it detected an ISP hub like Arundelpet
        const isIspHub =
          city.toLowerCase().includes('arundelpet') ||
          city.toLowerCase().includes('guntur');

        setStatusMsg({
          type: isIspHub ? 'info' : 'success',
          text: `Detected: ${city}, ${state}`,
          details: isIspHub
            ? 'Note: Desktop Wi-Fi broadband routes through regional ISP hubs (e.g. Arundelpet, Guntur). If you are in another town or village, search or choose from the list below.'
            : undefined,
        });
      }
    } else {
      // If user is a guest, prompt them in the dedicated form to signup/login to view AQI & save data
      setDetectedCityName(city);
      setDetectedStateName(state);
      setShowAuthPrompt(true);
    }
  };

  // 1. Browser Geolocation API with graceful fallback & timeout handling
  const handleDetectGPS = () => {
    setDetectingGps(true);
    setStatusMsg(null);

    if (!navigator.geolocation) {
      setStatusMsg({
        type: 'error',
        text: 'Geolocation is not supported by your browser. Please search or pick a location below.',
      });
      setDetectingGps(false);
      searchInputRef.current?.focus();
      return;
    }

    const onGeoSuccess = async (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { 'Accept-Language': 'en' } }
        );

        const address = res.data.address || {};
        // Preserve exact locality / village / taluk / mandal hierarchy for rural & semi-urban areas
        const city =
          address.village ||
          address.suburb ||
          address.town ||
          address.city ||
          address.county || // e.g. Repalle Mandal
          address.state_district ||
          'Detected Location';
        const state = address.state || '';

        await handleLocationConfirmed(city, state, latitude, longitude, false);
      } catch (err) {
        await handleLocationConfirmed('Detected Location', '', latitude, longitude, false);
      } finally {
        setDetectingGps(false);
      }
    };

    const onGeoError = (err: GeolocationPositionError) => {
      // Retry once with low accuracy if high accuracy failed
      if (err.code === 3) {
        navigator.geolocation.getCurrentPosition(
          onGeoSuccess,
          () => {
            setStatusMsg({
              type: 'error',
              text: 'GPS timed out. Desktop browsers often lack GPS hardware. Select your location below or type in search.',
            });
            setDetectingGps(false);
            searchInputRef.current?.focus();
          },
          { timeout: 7000, enableHighAccuracy: false, maximumAge: 600000 }
        );
        return;
      }

      let msg = 'Failed to get GPS location.';
      if (err.code === 1) {
        msg = 'Location access was blocked in browser settings. Please search your village or city below.';
      } else if (err.code === 2) {
        msg = 'Position unavailable on this device. Please select or search below.';
      }
      setStatusMsg({ type: 'error', text: msg });
      setDetectingGps(false);
      searchInputRef.current?.focus();
    };

    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, {
      timeout: 12000,
      enableHighAccuracy: true,
      maximumAge: 300000,
    });
  };

  // 2. Search Geocoding via Nominatim with instant local lookup
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    setSearching(true);
    setStatusMsg(null);

    // Instant check against preset locations (e.g. Peteru, Repalle)
    const matchingPresets = QUICK_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.city.toLowerCase().includes(query) ||
        loc.state.toLowerCase().includes(query)
    );

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery + ', India'
        )}&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );

      // Combine matched presets with geocoding results
      const combined = [...res.data];
      if (matchingPresets.length > 0 && !res.data.some((d: any) => d.name?.toLowerCase() === query)) {
        matchingPresets.forEach((p) => {
          combined.unshift({
            display_name: `${p.city}, ${p.state}, India`,
            name: p.city,
            lat: p.lat.toString(),
            lon: p.lon.toString(),
            address: { village: p.city, state: p.state },
          });
        });
      }

      setSearchResults(combined);
      if (combined.length === 0) {
        setStatusMsg({ type: 'error', text: `No results found for "${searchQuery}". Try another spelling.` });
      }
    } catch (err) {
      // If Nominatim fails or is blocked, use matching presets
      if (matchingPresets.length > 0) {
        setSearchResults(
          matchingPresets.map((p) => ({
            display_name: `${p.city}, ${p.state}, India`,
            name: p.city,
            lat: p.lat.toString(),
            lon: p.lon.toString(),
            address: { village: p.city, state: p.state },
          }))
        );
      } else {
        setStatusMsg({ type: 'error', text: 'Geocoding service unavailable. Please select from quick locations below.' });
      }
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCity = async (item: any) => {
    try {
      const address = item.address || {};
      const city =
        address.village ||
        address.suburb ||
        address.town ||
        address.city ||
        address.county ||
        item.name;
      const state = address.state || '';
      const latitude = parseFloat(item.lat);
      const longitude = parseFloat(item.lon);

      await handleLocationConfirmed(city, state, latitude, longitude, true);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to update location.' });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="location-modal-title"
          className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sage/30 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between pb-4 border-b border-sage/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 id="location-modal-title" className="font-heading font-bold text-lg text-forest">Set Your Location</h3>
                <p className="text-xs text-charcoal/70">Connects to nearest CPCB ground stations or local model</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close location dialog"
              className="text-charcoal/40 hover:text-charcoal text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-ivory transition cursor-pointer"
            >
              ×
            </button>
          </div>

          {statusMsg && (
            <div
              className={`mt-4 p-3 rounded-xl flex flex-col gap-1.5 text-xs leading-relaxed ${
                statusMsg.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : statusMsg.type === 'info'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
                ) : statusMsg.type === 'info' ? (
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                )}
                <span className="font-semibold">{statusMsg.text}</span>
              </div>
              {statusMsg.details && (
                <p className="text-[11px] text-charcoal/80 pl-6 leading-normal">
                  {statusMsg.details}
                </p>
              )}
            </div>
          )}

          <div className="mt-5 space-y-4">
            {/* Option 1: Browser GPS */}
            <div>
              <button
                onClick={handleDetectGPS}
                disabled={detectingGps}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-forest text-ivory font-medium hover:bg-forest-light transition shadow-sm disabled:opacity-50 text-sm cursor-pointer"
              >
                <Navigation className={`w-4 h-4 ${detectingGps ? 'animate-spin' : ''}`} />
                {detectingGps ? 'Detecting coordinates (high-precision)...' : 'Auto-Detect via GPS'}
              </button>

              <p className="text-[10px] text-charcoal/50 text-center mt-1.5 flex items-center justify-center gap-1">
                <span>💡 Note: Desktop Wi-Fi maps to your regional ISP hub. Click below or search to change location.</span>
              </p>
            </div>

            {/* Quick Pick Chips (Specifically for rural/town users without GPS hardware) */}
            <div className="bg-ivory/50 p-3 rounded-2xl border border-sage/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-forest uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber" /> Direct Town & Village Selection
                </span>
                <span className="text-[10px] text-charcoal/50">1-click switch</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_LOCATIONS.map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => handleLocationConfirmed(loc.city, loc.state, loc.lat, loc.lon, true)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                      activeLocation.city.toLowerCase() === loc.city.toLowerCase()
                        ? 'bg-forest text-ivory border-forest font-semibold shadow-xs'
                        : 'bg-white hover:bg-ivory border-sage/30 text-charcoal/80 hover:border-forest/40'
                    }`}
                  >
                    <span>{loc.name}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                        activeLocation.city.toLowerCase() === loc.city.toLowerCase()
                          ? 'bg-white/20 text-ivory'
                          : 'bg-forest/10 text-forest'
                      }`}
                    >
                      {loc.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <hr className="w-full border-sage/30" />
              <span className="absolute bg-white px-2 text-xs text-charcoal/50">or search any village / city</span>
            </div>

            {/* Option 2: Search Input */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Click here to search location (e.g. Peteru, Repalle, Guntur, Delhi...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-ivory rounded-xl border border-sage/30 focus:outline-none focus:border-forest text-charcoal placeholder:text-charcoal/40"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-4 py-2 bg-sage hover:bg-sage-dark text-white text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                {searching ? '...' : 'Search'}
              </button>
            </form>

            {/* Search Result List */}
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pt-1 border-t border-sage/20">
                <p className="text-[11px] font-semibold text-charcoal/60 px-1">Search Results:</p>
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectCity(item)}
                    className="w-full text-left p-2.5 rounded-xl bg-ivory/40 hover:bg-ivory border border-sage/20 hover:border-forest/40 transition text-xs flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-forest flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-sage" />
                        {item.name || item.display_name.split(',')[0]}
                      </p>
                      <p className="text-charcoal/60 truncate max-w-[280px] text-[11px] mt-0.5">
                        {item.display_name}
                      </p>
                    </div>
                    <span className="text-[10px] bg-forest text-ivory px-2 py-1 rounded-md font-bold shrink-0">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="pt-2 text-center text-xs text-charcoal/60 flex items-center justify-center gap-1.5">
              <span>Current Active:</span>
              <strong className="text-forest font-semibold">{activeLocation.city}</strong>
              {activeLocation.state ? <span className="text-charcoal/50">({activeLocation.state})</span> : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Post-Detection Auth Prompt Modal */}
      {showAuthPrompt && (
        <AuthPromptModal
          isOpen={showAuthPrompt}
          onClose={() => {
            setShowAuthPrompt(false);
            onClose();
          }}
          detectedCity={detectedCityName}
          detectedState={detectedStateName}
        />
      )}
    </>
  );
};
