import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AppThemeProvider } from './ColorModeContext.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </React.StrictMode>
);
