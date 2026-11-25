import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Navigation, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { AuthPromptModal } from '../auth/AuthPromptModal';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { updateLocation, activeLocation, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dedicated Auth Prompt Modal trigger for guests
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [detectedCityName, setDetectedCityName] = useState('');
  const [detectedStateName, setDetectedStateName] = useState('');

  if (!isOpen) return null;

  const handleLocationConfirmed = async (city: string, state: string, latitude: number, longitude: number) => {
    await updateLocation({ city, state, latitude, longitude });

    // If user is already logged in, close modal immediately (they already see dashboard)
    if (user) {
      setStatusMsg({ type: 'success', text: `Saved: ${city}, ${state}` });
      setTimeout(onClose, 600);
    } else {
      // If user is a guest, prompt them in the dedicated form to signup/login to view AQI & save data
      setDetectedCityName(city);
      setDetectedStateName(state);
      setShowAuthPrompt(true);
    }
  };

  // 1. Browser Geolocation API
  const handleDetectGPS = () => {
    setDetectingGps(true);
    setStatusMsg(null);

    if (!navigator.geolocation) {
      setStatusMsg({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      setDetectingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );

          const address = res.data.address;
          const city = address.city || address.town || address.county || address.state_district || 'Current Location';
          const state = address.state || '';

          await handleLocationConfirmed(city, state, latitude, longitude);
        } catch (err) {
          await handleLocationConfirmed('Detected Location', '', latitude, longitude);
        } finally {
          setDetectingGps(false);
        }
      },
      (err) => {
        let msg = 'Failed to get GPS location.';
        if (err.code === 1) msg = 'Location permission was denied. Please search your city below.';
        else if (err.code === 2) msg = 'Position unavailable. Please search manually.';
        else if (err.code === 3) msg = 'GPS detection timed out.';
        setStatusMsg({ type: 'error', text: msg });
        setDetectingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // 2. City Search via Nominatim Geocoding
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setStatusMsg(null);
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery + ', India'
        )}&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      setSearchResults(res.data);
      if (res.data.length === 0) {
        setStatusMsg({ type: 'error', text: 'No matching cities found in India. Try another spelling.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Geocoding service error. Try again shortly.' });
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCity = async (item: any) => {
    try {
      const city = item.address.city || item.address.town || item.address.county || item.name;
      const state = item.address.state || '';
      const latitude = parseFloat(item.lat);
      const longitude = parseFloat(item.lon);

      await handleLocationConfirmed(city, state, latitude, longitude);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to update location.' });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sage/30">
          <div className="flex items-center justify-between pb-4 border-b border-sage/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-forest">Set Your Location</h3>
                <p className="text-xs text-charcoal/70">Connects to nearest CPCB ground stations</p>
              </div>
            </div>
            <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal text-lg font-bold">×</button>
          </div>

          {statusMsg && (
            <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-xs ${
              statusMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="mt-5 space-y-4">
            {/* Option 1: Browser GPS */}
            <button
              onClick={handleDetectGPS}
              disabled={detectingGps}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-forest text-ivory font-medium hover:bg-forest-light transition shadow-sm disabled:opacity-50 text-sm"
            >
              <Navigation className={`w-4 h-4 ${detectingGps ? 'animate-spin' : ''}`} />
              {detectingGps ? 'Detecting GPS coordinates...' : 'Auto-Detect via GPS'}
            </button>

            <div className="relative flex items-center justify-center">
              <hr className="w-full border-sage/30" />
              <span className="absolute bg-white px-2 text-xs text-charcoal/50">or search city</span>
            </div>

            {/* Option 2: Search Input */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. New Delhi, Bengaluru, Mumbai"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-ivory rounded-xl border border-sage/30 focus:outline-none focus:border-forest text-charcoal"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-4 py-2 bg-sage hover:bg-sage-dark text-white text-sm font-semibold rounded-xl transition"
              >
                {searching ? '...' : 'Search'}
              </button>
            </form>

            {/* Search Result List */}
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pt-2">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectCity(item)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-ivory border border-transparent hover:border-sage/30 transition text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-forest">{item.display_name.split(',')[0]}</p>
                      <p className="text-charcoal/60 truncate max-w-[280px]">{item.display_name}</p>
                    </div>
                    <span className="text-[10px] bg-forest/10 text-forest px-1.5 py-0.5 rounded font-bold">Select</span>
                  </button>
                ))}
              </div>
            )}

            <div className="pt-2 text-center text-xs text-charcoal/60">
              Active: <strong className="text-forest">{activeLocation.city}</strong> {activeLocation.state ? `(${activeLocation.state})` : ''}
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
