import { createContext, useContext, useState } from 'react';

// Create theme context
const ThemeContext = createContext();

// Define theme colors
const themes = {
  light: {
    primary: {
      main: '#2563eb', // blue-600
      light: '#3b82f6', // blue-500
      dark: '#1d4ed8', // blue-700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0ea5e9', // sky-500
      light: '#38bdf8', // sky-400
      dark: '#0284c7', // sky-600
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981', // emerald-500
      light: '#34d399', // emerald-400
      dark: '#059669', // emerald-600
    },
    error: {
      main: '#ef4444', // red-500
      light: '#f87171', // red-400
      dark: '#dc2626', // red-600
    },
    warning: {
      main: '#f59e0b', // amber-500
      light: '#fbbf24', // amber-400
      dark: '#d97706', // amber-600
    },
    info: {
      main: '#3b82f6', // blue-500
      light: '#60a5fa', // blue-400
      dark: '#2563eb', // blue-600
    },
    background: {
      default: '#f8fafc', // slate-50
      paper: '#ffffff',
      card: '#ffffff',
    },
    text: {
      primary: '#1e293b', // slate-800
      secondary: '#64748b', // slate-500
      disabled: '#94a3b8', // slate-400
    },
    border: {
      main: '#e2e8f0', // slate-200
      light: '#f1f5f9', // slate-100
      dark: '#cbd5e1', // slate-300
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
  },
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  
  const theme = themes[currentTheme];
  
  // CSS variables injection
  const injectThemeVars = () => {
    document.documentElement.style.setProperty('--color-primary', theme.primary.main);
    document.documentElement.style.setProperty('--color-primary-light', theme.primary.light);
    document.documentElement.style.setProperty('--color-primary-dark', theme.primary.dark);
    document.documentElement.style.setProperty('--color-secondary', theme.secondary.main);
    document.documentElement.style.setProperty('--color-success', theme.success.main);
    document.documentElement.style.setProperty('--color-error', theme.error.main);
    document.documentElement.style.setProperty('--color-warning', theme.warning.main);
    document.documentElement.style.setProperty('--color-info', theme.info.main);
    document.documentElement.style.setProperty('--color-text-primary', theme.text.primary);
    document.documentElement.style.setProperty('--color-text-secondary', theme.text.secondary);
    document.documentElement.style.setProperty('--color-background', theme.background.default);
    document.documentElement.style.setProperty('--color-paper', theme.background.paper);
    document.documentElement.style.setProperty('--color-border', theme.border.main);
  };

  // Apply theme vars on theme change
  useState(() => {
    injectThemeVars();
  }, [currentTheme]);
  
  return (
    <ThemeContext.Provider value={{ theme, currentTheme, setCurrentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext; 