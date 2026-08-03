export const conceptDemoLanguages = {
  en: {
    code: 'en',
    shortLabel: 'EN',
    label: 'English',
  },
  sv: {
    code: 'sv',
    shortLabel: 'SV',
    label: 'Svenska',
  },
};

export const defaultConceptDemoLanguage = 'en';

export const conceptDemoTranslations = {
  en: {
    common: {
      language: 'Language',
      english: 'English',
      swedish: 'Swedish',
    },
  },
  sv: {
    common: {
      language: 'Spr\u00e5k',
      english: 'Engelska',
      swedish: 'Svenska',
    },
  },
};

export function getTranslationValue(translations, key) {
  return key.split('.').reduce((currentValue, keyPart) => currentValue?.[keyPart], translations);
}

export function interpolateTranslation(template, values = {}) {
  if (typeof template !== 'string') {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (match, name) => {
    const value = values[name];
    return value == null ? match : String(value);
  });
}

export function resolveLocalizedValue(value, language, fallbackLanguage = defaultConceptDemoLanguage) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[language] ?? value[fallbackLanguage] ?? '';
  }

  return value;
}
