import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Theme, Preferences } from '@/types';

interface ThemeContextType {
  theme: Theme;
  preferences: Preferences;
  setTheme: (theme: Theme) => void;
  setDisplayFormat: (format: Preferences['displayFormat']) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const PREFERENCES_STORAGE_KEY = 'arcus-preferences';

/**
 * Loads preferences from localStorage
 */
function loadPreferences(): Preferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
  return {
    theme: 'light',
    displayFormat: 'table',
  };
}

/**
 * Saves preferences to localStorage
 */
function savePreferences(preferences: Preferences) {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<Preferences>(loadPreferences);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', preferences.theme);
    
    // Update favicon based on theme
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      const baseUrl = import.meta.env.BASE_URL;
      favicon.href = preferences.theme === 'dark' 
        ? `${baseUrl}favicon-dark.ico` 
        : `${baseUrl}favicon-light.ico`;
    }
  }, [preferences.theme]);

  const setTheme = (theme: Theme) => {
    const newPreferences = { ...preferences, theme };
    setPreferencesState(newPreferences);
    savePreferences(newPreferences);
  };

  const setDisplayFormat = (displayFormat: Preferences['displayFormat']) => {
    const newPreferences = { ...preferences, displayFormat };
    setPreferencesState(newPreferences);
    savePreferences(newPreferences);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: preferences.theme,
        preferences,
        setTheme,
        setDisplayFormat,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

