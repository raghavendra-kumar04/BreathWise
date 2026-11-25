import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  location?: {
    city: string;
    state?: string;
    latitude: number;
    longitude: number;
  };
}

export interface UserPreferences {
  lifestyle: {
    commuteMode: 'walking' | 'cycling' | 'two-wheeler' | 'metro-bus' | 'car' | 'wfh';
    outdoorActivity: 'none' | 'light-walk' | 'jogging' | 'cycling' | 'outdoor-sports';
    cookingFuel: 'lpg' | 'induction' | 'biomass' | 'kerosene' | 'mixed';
    dailyRoutine?: {
      wakeUpTime?: string;
      commuteStart?: string;
      commuteEnd?: string;
    };
  };
  healthSensitivity: 'normal' | 'mild-allergy' | 'asthmatic' | 'copd' | 'senior' | 'pediatric';
  budget: 'low-cost' | 'moderate' | 'premium';
  interests: string[];
  notificationEnabled: boolean;
}

export interface LocationData {
  city: string;
  state?: string;
  latitude: number;
  longitude: number;
}

interface AuthContextType {
  user: User | null;
  guestLocation: LocationData;
  activeLocation: LocationData;
  preferences: UserPreferences | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateLocation: (loc: LocationData) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_LOCATION: LocationData = {
  city: 'New Delhi',
  state: 'Delhi',
  latitude: 28.6139,
  longitude: 77.2090,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bw_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [guestLocation, setGuestLocation] = useState<LocationData>(() => {
    const saved = localStorage.getItem('bw_guest_location');
    return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
  });

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bw_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    const savedToken = localStorage.getItem('bw_token');
    if (!savedToken) {
      setUser(null);
      setPreferences(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setPreferences(res.data.preferences);
      localStorage.setItem('bw_user', JSON.stringify(res.data.user));
    } catch (err) {
      console.warn('Session expired or server unavailable');
      localStorage.removeItem('bw_token');
      localStorage.removeItem('bw_user');
      setUser(null);
      setPreferences(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.post('/auth/login', credentials);
    const { token: receivedToken, user: receivedUser, preferences: receivedPrefs } = res.data;
    localStorage.setItem('bw_token', receivedToken);
    setToken(receivedToken);
    setPreferences(receivedPrefs);

    // Sync cached guest location into user profile on the server
    const cachedLocRaw = localStorage.getItem('bw_guest_location');
    if (cachedLocRaw) {
      try {
        const cachedLoc: LocationData = JSON.parse(cachedLocRaw);
        const locRes = await api.patch('/auth/location', cachedLoc, {
          headers: { Authorization: `Bearer ${receivedToken}` },
        });
        const updatedUser = { ...receivedUser, location: locRes.data.location };
        setUser(updatedUser);
        localStorage.setItem('bw_user', JSON.stringify(updatedUser));
        return;
      } catch (e) {
        console.warn('Could not sync local location to db on login:', e);
      }
    }

    setUser(receivedUser);
    localStorage.setItem('bw_user', JSON.stringify(receivedUser));
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    // Read the cached location from localStorage to pass directly at signup
    let initialLocation = guestLocation;
    const cachedLocRaw = localStorage.getItem('bw_guest_location');
    if (cachedLocRaw) {
      try {
        initialLocation = JSON.parse(cachedLocRaw);
      } catch (e) {}
    }

    const res = await api.post('/auth/register', {
      ...data,
      location: initialLocation,
    });

    const { token: receivedToken, user: receivedUser, preferences: receivedPrefs } = res.data;
    localStorage.setItem('bw_token', receivedToken);
    localStorage.setItem('bw_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    setPreferences(receivedPrefs);
  };

  const logout = () => {
    localStorage.removeItem('bw_token');
    localStorage.removeItem('bw_user');
    setToken(null);
    setUser(null);
    setPreferences(null);
  };

  const updateLocation = async (loc: LocationData) => {
    const savedToken = localStorage.getItem('bw_token');

    // Always update local guest state & localStorage for immediate responsive feedback
    setGuestLocation(loc);
    localStorage.setItem('bw_guest_location', JSON.stringify(loc));

    // If user is already authenticated, update the server profile
    if (savedToken) {
      try {
        const res = await api.patch('/auth/location', loc);
        setUser((prev) => {
          if (!prev) return null;
          const updated = { ...prev, location: res.data.location };
          localStorage.setItem('bw_user', JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.warn('Failed to sync location to profile on server:', err);
      }
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    const res = await api.patch('/auth/preferences', updates);
    setPreferences(res.data.preferences);
  };

  const activeLocation: LocationData = user?.location?.latitude !== undefined
    ? {
        city: user.location.city,
        state: user.location.state,
        latitude: user.location.latitude,
        longitude: user.location.longitude,
      }
    : guestLocation;

  return (
    <AuthContext.Provider
      value={{
        user,
        guestLocation,
        activeLocation,
        preferences,
        token,
        isLoading,
        login,
        register,
        logout,
        updateLocation,
        updatePreferences,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
