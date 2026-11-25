import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserPreferences } from '../context/AuthContext';
import { Settings, Save, MapPin, CheckCircle2 } from 'lucide-react';
import { LocationModal } from '../components/location/LocationModal';

export const ProfilePage: React.FC = () => {
  const { user, preferences, updatePreferences } = useAuth();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Lifestyle form states
  const [commuteMode, setCommuteMode] = useState<UserPreferences['lifestyle']['commuteMode']>(
    preferences?.lifestyle?.commuteMode || 'metro-bus'
  );
  const [outdoorActivity, setOutdoorActivity] = useState<UserPreferences['lifestyle']['outdoorActivity']>(
    preferences?.lifestyle?.outdoorActivity || 'light-walk'
  );
  const [cookingFuel, setCookingFuel] = useState<UserPreferences['lifestyle']['cookingFuel']>(
    preferences?.lifestyle?.cookingFuel || 'lpg'
  );
  const [budget, setBudget] = useState<UserPreferences['budget']>(
    preferences?.budget || 'moderate'
  );
  const [notificationEnabled, setNotificationEnabled] = useState(
    preferences?.notificationEnabled ?? true
  );
  const [healthSensitivity, setHealthSensitivity] = useState<UserPreferences['healthSensitivity']>(
    preferences?.healthSensitivity || 'normal'
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updatePreferences({
        lifestyle: {
          commuteMode,
          outdoorActivity,
          cookingFuel,
        },
        budget,
        notificationEnabled,
        healthSensitivity,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      <div className="flex items-center justify-between pb-6 border-b border-sage/20 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-forest">Profile & Preferences</h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Gemini AI uses these parameters to customize your daily briefings and pollution avoidance plans.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-sage/20 shadow-sm text-center">
            <div className="w-20 h-20 rounded-full bg-forest text-ivory mx-auto flex items-center justify-center font-heading font-bold text-2xl shadow-inner mb-4">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h3 className="font-heading font-bold text-lg text-forest">{user?.name}</h3>
            <p className="text-xs text-charcoal/60 truncate">{user?.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-forest/10 text-forest uppercase tracking-wider">
              {user?.role} Account
            </span>

            <div className="mt-6 pt-6 border-t border-sage/20 text-left">
              <span className="text-xs font-semibold text-charcoal/70 uppercase tracking-wider block mb-2">
                Active Location
              </span>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-ivory border border-sage/20">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-forest" />
                  <div>
                    <p className="text-xs font-bold text-forest">{user?.location?.city || 'No Location Set'}</p>
                    <p className="text-[10px] text-charcoal/60">{user?.location?.state || 'Tap to update'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-xs text-amber-dark font-semibold hover:underline cursor-pointer"
                  title="Click here to change location"
                >
                  Click to change
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-sage/20 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-sage/20">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-forest" />
                <h2 className="font-heading font-bold text-lg text-forest">Lifestyle Context for Gemini</h2>
              </div>
              {savedSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Preferences saved</span>
                </div>
              )}
            </div>

            {/* Commute Mode */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                Primary Commute Method
              </label>
              <select
                value={commuteMode}
                onChange={(e: any) => setCommuteMode(e.target.value)}
                className="w-full p-3 bg-ivory rounded-xl border border-sage/30 text-sm focus:outline-none focus:border-forest text-charcoal"
              >
                <option value="metro-bus">Public Transit (Metro / Bus)</option>
                <option value="two-wheeler">Two-Wheeler (Motorcycle / Scooter)</option>
                <option value="car">Car / Cab</option>
                <option value="cycling">Cycling</option>
                <option value="walking">Walking</option>
                <option value="wfh">Work from Home / Remote</option>
              </select>
            </div>

            {/* Outdoor Activity */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                Outdoor Activity Level
              </label>
              <select
                value={outdoorActivity}
                onChange={(e: any) => setOutdoorActivity(e.target.value)}
                className="w-full p-3 bg-ivory rounded-xl border border-sage/30 text-sm focus:outline-none focus:border-forest text-charcoal"
              >
                <option value="none">Minimal / Indoor-only</option>
                <option value="light-walk">Light Walking</option>
                <option value="jogging">Morning Jogging / Running</option>
                <option value="cycling">Outdoor Cycling</option>
                <option value="outdoor-sports">Active Outdoor Sports</option>
              </select>
            </div>

            {/* Cooking Fuel */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                Primary Household Cooking Fuel
              </label>
              <select
                value={cookingFuel}
                onChange={(e: any) => setCookingFuel(e.target.value)}
                className="w-full p-3 bg-ivory rounded-xl border border-sage/30 text-sm focus:outline-none focus:border-forest text-charcoal"
              >
                <option value="lpg">LPG (Piped / Cylinder)</option>
                <option value="induction">Induction / Electric</option>
                <option value="biomass">Traditional Biomass / Chulha</option>
                <option value="kerosene">Kerosene</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                Action Budget Preference
              </label>
              <select
                value={budget}
                onChange={(e: any) => setBudget(e.target.value)}
                className="w-full p-3 bg-ivory rounded-xl border border-sage/30 text-sm focus:outline-none focus:border-forest text-charcoal"
              >
                <option value="low-cost">Low-Cost / Free DIY Solutions Only</option>
                <option value="moderate">Moderate (Standard Masks, Plants, Basic Filters)</option>
                <option value="premium">Premium (HEPA Purifiers, Advanced Sensors)</option>
              </select>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-3 bg-ivory rounded-xl border border-sage/20">
              <div>
                <span className="text-xs font-bold text-forest">Air Quality Alert Reminders</span>
                <p className="text-[10px] text-charcoal/70">Receive warnings when AQI crosses Severe/Poor</p>
              </div>
              <input
                type="checkbox"
                checked={notificationEnabled}
                onChange={(e) => setNotificationEnabled(e.target.checked)}
                className="w-4 h-4 accent-forest cursor-pointer"
              />
            </div>

            {/* Health Sensitivity */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                Health Sensitivity Profile
              </label>
              <p className="text-[10px] text-charcoal/60 mb-2">
                Gemini AI tailors pollution thresholds and advice based on your health condition.
              </p>
              <select
                value={healthSensitivity}
                onChange={(e: any) => setHealthSensitivity(e.target.value)}
                className="w-full p-3 bg-ivory rounded-xl border border-sage/30 text-sm focus:outline-none focus:border-forest text-charcoal"
              >
                <option value="normal">🟢 Standard — No Known Sensitivity</option>
                <option value="mild-allergy">🟡 Mild Allergies / Rhinitis</option>
                <option value="asthmatic">🟠 Asthmatic / Reactive Airways</option>
                <option value="copd">🔴 COPD / Emphysema</option>
                <option value="senior">🔵 Senior Citizen (60+ yrs)</option>
                <option value="pediatric">🟣 Child / Pediatric</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-forest hover:bg-forest-light text-ivory font-semibold text-sm transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Updating...' : 'Save AI Preferences'}
            </button>
          </form>
        </div>
      </div>

      <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
    </div>
  );
};
