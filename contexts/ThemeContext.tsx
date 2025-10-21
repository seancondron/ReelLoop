import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
  card: string;
  shadow: string;
}

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
  darknessLevel: 'light' | 'medium' | 'dark' | 'black';
}

interface ThemeContextType {
  theme: Theme;
  toggleDarkMode: () => void;
  setDarknessLevel: (level: 'light' | 'medium' | 'dark' | 'black') => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Light theme colors
const lightColors: ThemeColors = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
  accent: '#007AFF',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  card: '#FFFFFF',
  shadow: '#000000',
};

// Dark theme colors based on darkness level
const getDarkColors = (level: 'light' | 'medium' | 'dark' | 'black'): ThemeColors => {
  switch (level) {
    case 'light':
      return {
        background: '#1C1C1E',
        surface: '#2C2C2E',
        text: '#FFFFFF',
        textSecondary: '#8E8E93',
        border: '#3A3A3C',
        accent: '#0A84FF',
        error: '#FF453A',
        success: '#30D158',
        warning: '#FF9F0A',
        card: '#2C2C2E',
        shadow: '#000000',
      };
    case 'medium':
      return {
        background: '#000000',
        surface: '#1C1C1E',
        text: '#FFFFFF',
        textSecondary: '#8E8E93',
        border: '#2C2C2E',
        accent: '#0A84FF',
        error: '#FF453A',
        success: '#30D158',
        warning: '#FF9F0A',
        card: '#1C1C1E',
        shadow: '#000000',
      };
    case 'dark':
      return {
        background: '#000000',
        surface: '#0A0A0A',
        text: '#FFFFFF',
        textSecondary: '#6D6D70',
        border: '#1C1C1E',
        accent: '#0A84FF',
        error: '#FF453A',
        success: '#30D158',
        warning: '#FF9F0A',
        card: '#0A0A0A',
        shadow: '#000000',
      };
    case 'black':
      return {
        background: '#000000',
        surface: '#000000',
        text: '#FFFFFF',
        textSecondary: '#6D6D70',
        border: '#1C1C1E',
        accent: '#0A84FF',
        error: '#FF453A',
        success: '#30D158',
        warning: '#FF9F0A',
        card: '#000000',
        shadow: '#000000',
      };
  }
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [darknessLevel, setDarknessLevelState] = useState<'light' | 'medium' | 'dark' | 'black'>('medium');
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadThemeSettings();
    
    // Cleanup timeout on unmount
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const loadThemeSettings = async () => {
    try {
      const darkModeValue = await AsyncStorage.getItem('darkMode');
      const darknessValue = await AsyncStorage.getItem('darknessLevel');
      
      setIsDarkMode(darkModeValue === 'true');
      setDarknessLevelState((darknessValue as any) || 'medium');
    } catch (error) {
      console.error('Error loading theme settings:', error);
    }
  };

  const toggleDarkMode = useCallback(async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      
      // Clear any existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Debounce the storage update
      updateTimeoutRef.current = setTimeout(async () => {
        await AsyncStorage.setItem('darkMode', newValue.toString());
      }, 100);
    } catch (error) {
      console.error('Error saving dark mode setting:', error);
    }
  }, [isDarkMode]);

  const setDarknessLevel = useCallback(async (level: 'light' | 'medium' | 'dark' | 'black') => {
    try {
      setDarknessLevelState(level);
      await AsyncStorage.setItem('darknessLevel', level);
    } catch (error) {
      console.error('Error saving darkness level setting:', error);
    }
  }, []);

  const theme: Theme = useMemo(() => ({
    colors: isDarkMode ? getDarkColors(darknessLevel) : lightColors,
    isDark: isDarkMode,
    darknessLevel,
  }), [isDarkMode, darknessLevel]);

  return (
    <ThemeContext.Provider value={{ theme, toggleDarkMode, setDarknessLevel, isDarkMode }}>
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
