import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const storageKey = 'smartdesk_demo_teacher_name';
const defaultTeacherName = 'Anna';
const ConceptDemoTeacherContext = createContext(null);

function normalizeTeacherName(value) {
  const teacherName = String(value || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  return teacherName || defaultTeacherName;
}

function getInitialTeacherName() {
  if (typeof window === 'undefined') {
    return defaultTeacherName;
  }

  try {
    return normalizeTeacherName(window.localStorage.getItem(storageKey));
  } catch {
    return defaultTeacherName;
  }
}

export function ConceptDemoTeacherProvider({ children }) {
  const [teacherName, setTeacherNameState] = useState(getInitialTeacherName);

  const setTeacherName = useCallback((nextTeacherName) => {
    setTeacherNameState(normalizeTeacherName(nextTeacherName));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, teacherName);
    } catch {
      // Persistence is a convenience; the in-memory teacher name still works.
    }
  }, [teacherName]);

  const value = useMemo(() => ({
    defaultTeacherName,
    teacherName,
    setTeacherName,
  }), [setTeacherName, teacherName]);

  return (
    <ConceptDemoTeacherContext.Provider value={value}>
      {children}
    </ConceptDemoTeacherContext.Provider>
  );
}

export function useConceptDemoTeacher() {
  const context = useContext(ConceptDemoTeacherContext);

  if (!context) {
    throw new Error('useConceptDemoTeacher must be used within ConceptDemoTeacherProvider');
  }

  return context;
}
