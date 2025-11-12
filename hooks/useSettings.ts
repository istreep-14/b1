import { useState, useEffect, useCallback } from 'react';

const DEFAULT_POSITIONS = ['Bartender', 'Server', 'Door', 'Expo', 'Hostess', 'Busser'];
const DEFAULT_LOCATIONS = ['deck', 'main', 'upstairs'];

const SETTINGS_STORAGE_KEY = 'bartender-shift-tracker-settings';

interface AppSettings {
  positions: string[];
  locations: string[];
}

const loadSettingsFromStorage = (): AppSettings => {
  try {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      // Basic validation to ensure the loaded settings have the correct structure
      if (Array.isArray(parsed.positions) && Array.isArray(parsed.locations)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage", error);
  }
  // Return defaults if nothing is stored or if loading fails
  return {
    positions: DEFAULT_POSITIONS,
    locations: DEFAULT_LOCATIONS,
  };
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(loadSettingsFromStorage);

  const saveSettings = useCallback((newSettings: AppSettings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, []);
  
  const updatePositions = (newPositions: string[]) => {
      saveSettings({ ...settings, positions: newPositions });
  };
  
  const updateLocations = (newLocations: string[]) => {
      saveSettings({ ...settings, locations: newLocations });
  };

  return {
    positions: settings.positions,
    locations: settings.locations,
    updatePositions,
    updateLocations,
  };
};
