import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(
    (localStorage.getItem('theme_mode') as ThemeMode) || 'light'
  );
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = window.document.documentElement;
    let darkActive = false;

    if (theme === 'system') {
      darkActive = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      darkActive = theme === 'dark';
    }

    if (darkActive) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setIsDark(darkActive);
    localStorage.setItem('theme_mode', theme);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
