import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useConceptDemoLanguage } from './ConceptDemoLanguageContext.jsx';
import {
  defaultSelectedSubjectIds,
  getSelectedSubjects,
  maxSelectedSubjectCount,
  normalizeSelectedSubjectIds,
  subjectCatalogue,
} from './data/subjectCatalogue.js';

const storageKey = 'smartdesk_demo_selected_subjects';
const ConceptDemoSubjectContext = createContext(null);

function getInitialSelectedSubjectIds() {
  if (typeof window === 'undefined') {
    return defaultSelectedSubjectIds;
  }

  try {
    const savedValue = window.localStorage.getItem(storageKey);
    const savedIds = savedValue ? JSON.parse(savedValue) : defaultSelectedSubjectIds;
    return normalizeSelectedSubjectIds(savedIds);
  } catch {
    return defaultSelectedSubjectIds;
  }
}

export function ConceptDemoSubjectProvider({ children }) {
  const { language } = useConceptDemoLanguage();
  const [selectedSubjectIds, setSelectedSubjectIdsState] = useState(getInitialSelectedSubjectIds);

  const setSelectedSubjectIds = useCallback((nextSubjectIds) => {
    setSelectedSubjectIdsState((currentSubjectIds) => {
      const rawSubjectIds = typeof nextSubjectIds === 'function'
        ? nextSubjectIds(currentSubjectIds)
        : nextSubjectIds;

      return normalizeSelectedSubjectIds(rawSubjectIds);
    });
  }, []);

  const toggleSubject = useCallback((subjectId) => {
    setSelectedSubjectIdsState((currentSubjectIds) => {
      const selected = currentSubjectIds.includes(subjectId);
      const nextSubjectIds = selected
        ? currentSubjectIds.filter((currentSubjectId) => currentSubjectId !== subjectId)
        : [...currentSubjectIds, subjectId];

      return normalizeSelectedSubjectIds(nextSubjectIds, {
        fallbackSubjectIds: currentSubjectIds,
        maxCount: maxSelectedSubjectCount,
      });
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(selectedSubjectIds));
    } catch {
      // Persistence is a convenience; the in-memory subject selection still works.
    }
  }, [selectedSubjectIds]);

  const value = useMemo(() => ({
    availableSubjects: subjectCatalogue,
    maxSelectedSubjectCount,
    selectedSubjectIds,
    selectedSubjects: getSelectedSubjects(selectedSubjectIds, language),
    setSelectedSubjectIds,
    toggleSubject,
  }), [language, selectedSubjectIds, setSelectedSubjectIds, toggleSubject]);

  return (
    <ConceptDemoSubjectContext.Provider value={value}>
      {children}
    </ConceptDemoSubjectContext.Provider>
  );
}

export function useConceptDemoSubjects() {
  const context = useContext(ConceptDemoSubjectContext);

  if (!context) {
    throw new Error('useConceptDemoSubjects must be used within ConceptDemoSubjectProvider');
  }

  return context;
}
