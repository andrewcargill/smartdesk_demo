import { createTheme } from '@mui/material';
import { getSurfaceVariables } from './surfaceVariables.js';

export function createAppTheme(mode) {
  const isDarkMode = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      background: {
        default: isDarkMode ? '#121214' : '#fbf7fc',
        paper: isDarkMode ? '#202024' : '#ffffff',
      },
      primary: {
        main: '#9c28af',
        dark: '#7b1f8a',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDarkMode ? '#a463c5' : '#6b5b95',
      },
      warning: {
        main: isDarkMode ? '#e2b45e' : '#a97713',
      },
      error: {
        main: isDarkMode ? '#f5664a' : '#b64231',
      },
      text: {
        primary: isDarkMode ? '#f5f5f5' : '#17202a',
        secondary: isDarkMode ? '#c9c9ce' : '#566474',
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: {
        fontWeight: 850,
        letterSpacing: 0,
      },
      h2: {
        fontWeight: 800,
        letterSpacing: 0,
      },
      h3: {
        fontWeight: 800,
        letterSpacing: 0,
      },
      button: {
        fontWeight: 800,
        textTransform: 'none',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({ ':root': getSurfaceVariables(theme) }),
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: ({ ownerState, theme }) => (
            theme.palette.mode === 'dark' && ownerState.variant !== 'contained'
              && (!ownerState.color || ownerState.color === 'primary')
              ? { '&:not(.Mui-disabled)': { color: theme.palette.text.primary } }
              : {}
          ),
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: ({ ownerState, theme }) => (
            theme.palette.mode === 'dark' && ownerState.color === 'primary'
              ? { color: theme.palette.text.primary }
              : {}
          ),
        },
      },
    },
  });
}
