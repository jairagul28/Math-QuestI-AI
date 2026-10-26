import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'mathquest-theme';
const ThemeContext = createContext(null);

function setDocumentTheme(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

function getInitialTheme() {
  if (typeof document !== 'undefined') {
    const appliedTheme = document.documentElement.dataset.theme;
    if (appliedTheme === 'dark' || appliedTheme === 'light') return appliedTheme;
  }

  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
  } catch (error) {
    console.warn('[Theme] Could not read saved theme preference:', error);
    return 'dark';
  }
}

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  const setTheme = useCallback((nextTheme) => {
    if (nextTheme !== 'dark' && nextTheme !== 'light') return;
    setDocumentTheme(nextTheme);
    setThemeState(nextTheme);

    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch (error) {
      console.warn('[Theme] Could not save theme preference:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }
  return context;
};
