import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createAppTheme } from './theme/appTheme.js';

const storageKey = 'smartdesk-color-mode';
const ColorModeContext = createContext(null);

function readPreference() {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Private/restricted storage must not prevent the app from opening.
  }
  return null;
}

export function AppThemeProvider({ children }) {
  const [preference, setPreference] = useState(readPreference);
  const [systemMode, setSystemMode] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'
  ));
  const colorMode = preference || systemMode;
  const theme = useMemo(() => createAppTheme(colorMode), [colorMode]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return undefined;
    const update = () => setSystemMode(media.matches ? 'dark' : 'light');
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const sync = (event) => {
      if (event.key === storageKey || event.key === null) setPreference(readPreference());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    if (!preference) return;
    try {
      window.localStorage.setItem(storageKey, preference);
    } catch {
      // Switching still works in memory when storage is unavailable.
    }
  }, [preference]);

  const value = useMemo(() => ({
    colorMode,
    toggleColorMode: () => setPreference((current) => (current || systemMode) === 'light' ? 'dark' : 'light'),
  }), [colorMode, systemMode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const value = useContext(ColorModeContext);
  if (!value) throw new Error('useColorMode requires AppThemeProvider');
  return value;
}
