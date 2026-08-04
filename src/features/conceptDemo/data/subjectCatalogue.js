import { defaultConceptDemoLanguage, resolveLocalizedValue } from '../i18n/conceptDemoTranslations.js';

export const defaultSelectedSubjectIds = ['mathematics', 'english', 'physical-education'];
export const maxSelectedSubjectCount = 3;

export const subjectCatalogue = [
  {
    id: 'mathematics',
    title: { en: 'Mathematics', sv: 'Matematik' },
    shortTitle: { en: 'Maths', sv: 'Matematik' },
    code: { en: 'Ma', sv: 'Ma' },
    color: '#9c28af',
  },
  {
    id: 'english',
    title: { en: 'English', sv: 'Engelska' },
    shortTitle: { en: 'English', sv: 'Engelska' },
    code: { en: 'En', sv: 'En' },
    color: '#1f7a8c',
  },
  {
    id: 'physical-education',
    title: { en: 'Physical Education', sv: 'Idrott och h\u00e4lsa' },
    shortTitle: { en: 'PE', sv: 'Idrott' },
    code: { en: 'PE', sv: 'Id' },
    color: '#2f7d32',
  },
  {
    id: 'science',
    title: { en: 'Science', sv: 'Naturorientering' },
    shortTitle: { en: 'Science', sv: 'NO' },
    code: { en: 'Sci', sv: 'NO' },
    color: '#2364aa',
  },
  {
    id: 'swedish',
    title: { en: 'Swedish', sv: 'Svenska' },
    shortTitle: { en: 'Swedish', sv: 'Svenska' },
    code: { en: 'Sv', sv: 'Sv' },
    color: '#c2410c',
  },
  {
    id: 'history',
    title: { en: 'History', sv: 'Historia' },
    shortTitle: { en: 'History', sv: 'Historia' },
    code: { en: 'Hi', sv: 'Hi' },
    color: '#8a5a44',
  },
  {
    id: 'sloyd',
    title: { en: 'Crafts', sv: 'Sl\u00f6jd' },
    shortTitle: { en: 'Crafts', sv: 'Sl\u00f6jd' },
    code: { en: 'Sl', sv: 'Sl' },
    color: '#7c3f16',
  },
  {
    id: 'music',
    title: { en: 'Music', sv: 'Musik' },
    shortTitle: { en: 'Music', sv: 'Musik' },
    code: { en: 'Mu', sv: 'Mu' },
    color: '#7e3af2',
  },
];

export function getSubjectDefinition(subjectId) {
  return subjectCatalogue.find((subject) => subject.id === subjectId) || null;
}

export function normalizeSelectedSubjectIds(subjectIds, {
  fallbackSubjectIds = defaultSelectedSubjectIds,
  maxCount = maxSelectedSubjectCount,
} = {}) {
  const validSubjectIds = new Set(subjectCatalogue.map((subject) => subject.id));
  const normalizedIds = Array.from(new Set((Array.isArray(subjectIds) ? subjectIds : [])
    .filter((subjectId) => validSubjectIds.has(subjectId))));

  if (!normalizedIds.length) {
    return fallbackSubjectIds.slice(0, maxCount);
  }

  return normalizedIds.slice(0, maxCount);
}

export function getSelectedSubjects(subjectIds, language = defaultConceptDemoLanguage) {
  return normalizeSelectedSubjectIds(subjectIds)
    .map((subjectId) => getSubjectDefinition(subjectId))
    .filter(Boolean)
    .map((subject) => ({
      ...subject,
      title: resolveLocalizedValue(subject.title, language, subject.id),
      shortTitle: resolveLocalizedValue(subject.shortTitle, language, subject.id),
      code: resolveLocalizedValue(subject.code, language, subject.id),
    }));
}
