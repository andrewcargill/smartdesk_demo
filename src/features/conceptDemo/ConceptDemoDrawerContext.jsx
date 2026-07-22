import { createContext, useContext, useMemo, useState } from 'react';

const ConceptDemoDrawerContext = createContext(null);

export function ConceptDemoDrawerProvider({ children }) {
  const [weekOpen, setWeekOpen] = useState(false);
  const [todayOpen, setTodayOpen] = useState(false);
  const [smartDeskOpen, setSmartDeskOpen] = useState(false);
  const [smartDeskMode, setSmartDeskMode] = useState('text');

  const value = useMemo(() => ({
    weekOpen,
    todayOpen,
    smartDeskOpen,
    smartDeskMode,
    openWeek: () => setWeekOpen(true),
    closeWeek: () => setWeekOpen(false),
    openToday: () => setTodayOpen(true),
    closeToday: () => setTodayOpen(false),
    openSmartDesk: (mode = 'text') => {
      setSmartDeskMode(mode);
      setSmartDeskOpen(true);
    },
    closeSmartDesk: () => setSmartDeskOpen(false),
  }), [weekOpen, todayOpen, smartDeskOpen, smartDeskMode]);

  return (
    <ConceptDemoDrawerContext.Provider value={value}>
      {children}
    </ConceptDemoDrawerContext.Provider>
  );
}

export function useConceptDemoDrawers() {
  const context = useContext(ConceptDemoDrawerContext);

  if (!context) {
    throw new Error('useConceptDemoDrawers must be used within ConceptDemoDrawerProvider');
  }

  return context;
}
