import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  conceptDemoLanguages,
  conceptDemoTranslations,
  defaultConceptDemoLanguage,
  getTranslationValue,
  interpolateTranslation,
} from './i18n/conceptDemoTranslations.js';

const storageKey = 'smartdesk_demo_language';
const ConceptDemoLanguageContext = createContext(null);

function normalizeLanguage(language) {
  return conceptDemoLanguages[language] ? language : defaultConceptDemoLanguage;
}

function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return defaultConceptDemoLanguage;
  }

  try {
    return normalizeLanguage(window.localStorage.getItem(storageKey));
  } catch {
    return defaultConceptDemoLanguage;
  }
}

export function ConceptDemoLanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = useCallback((nextLanguage) => {
    setLanguageState(normalizeLanguage(nextLanguage));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, language);
    } catch {
      // Persistence is a convenience; the in-memory language choice still works.
    }
  }, [language]);

  const t = useCallback((key, values) => {
    const selectedTranslation = getTranslationValue(conceptDemoTranslations[language], key);
    const fallbackTranslation = getTranslationValue(conceptDemoTranslations[defaultConceptDemoLanguage], key);
    const translation = selectedTranslation ?? fallbackTranslation ?? key;

    return interpolateTranslation(translation, values);
  }, [language]);

  const value = useMemo(() => ({
    language,
    languages: conceptDemoLanguages,
    setLanguage,
    t,
  }), [language, setLanguage, t]);

  return (
    <ConceptDemoLanguageContext.Provider value={value}>
      {children}
    </ConceptDemoLanguageContext.Provider>
  );
}

export function useConceptDemoLanguage() {
  const context = useContext(ConceptDemoLanguageContext);

  if (!context) {
    throw new Error('useConceptDemoLanguage must be used within ConceptDemoLanguageProvider');
  }

  return context;
}
