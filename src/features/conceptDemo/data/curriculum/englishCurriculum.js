export const englishCurriculumAreas = [
  {
    id: 'speaking',
    title: { en: 'Speaking', sv: 'Tala' },
    label: { en: 'Speaking', sv: 'Tala' },
    order: 1,
  },
  {
    id: 'listening',
    title: { en: 'Listening', sv: 'Lyssna' },
    label: { en: 'Listening', sv: 'Lyssna' },
    order: 2,
  },
  {
    id: 'writing',
    title: { en: 'Writing', sv: 'Skriva' },
    label: { en: 'Writing', sv: 'Skriva' },
    order: 3,
  },
  {
    id: 'reading',
    title: { en: 'Reading', sv: 'L\u00e4sa' },
    label: { en: 'Reading', sv: 'L\u00e4sa' },
    order: 4,
  },
];

export const englishSkills = [
  { id: 'interaction', title: { en: 'Interaction', sv: 'Interaktion' }, label: { en: 'Interaction', sv: 'Interaktion' }, order: 1 },
  { id: 'presentation', title: { en: 'Presentation', sv: 'Presentation' }, label: { en: 'Presentation', sv: 'Presentation' }, order: 2 },
  { id: 'understanding-detail', title: { en: 'Understanding detail', sv: 'F\u00f6rst\u00e5 detaljer' }, label: { en: 'Understanding detail', sv: 'F\u00f6rst\u00e5 detaljer' }, order: 3 },
  { id: 'understanding-purpose', title: { en: 'Understanding purpose', sv: 'F\u00f6rst\u00e5 syfte' }, label: { en: 'Understanding purpose', sv: 'F\u00f6rst\u00e5 syfte' }, order: 4 },
  { id: 'structure', title: { en: 'Structure', sv: 'Struktur' }, label: { en: 'Structure', sv: 'Struktur' }, order: 5 },
  { id: 'vocabulary', title: { en: 'Vocabulary', sv: 'Ordf\u00f6rr\u00e5d' }, label: { en: 'Vocabulary', sv: 'Ordf\u00f6rr\u00e5d' }, order: 6 },
  { id: 'accuracy', title: { en: 'Accuracy', sv: 'Korrekthet' }, label: { en: 'Accuracy', sv: 'Korrekthet' }, order: 7 },
  { id: 'response-to-text', title: { en: 'Response to text', sv: 'Textrespons' }, label: { en: 'Response to text', sv: 'Textrespons' }, order: 8 },
];

export const englishObservationLevels = [
  { id: 'emerging', label: { en: 'Emerging', sv: 'P\u00e5 v\u00e4g' }, order: 1 },
  { id: 'developing', label: { en: 'Developing', sv: 'Utvecklas' }, order: 2 },
  { id: 'secure', label: { en: 'Secure', sv: 'S\u00e4ker' }, order: 3 },
  { id: 'advanced', label: { en: 'Advanced', sv: 'Avancerad' }, order: 4 },
];

export const englishTeachingUnits = [
  {
    id: 'speaking',
    title: { en: 'Speaking', sv: 'Tala' },
    label: { en: 'Speaking', sv: 'Tala' },
    curriculumAreaId: 'speaking',
    skillIds: ['interaction', 'presentation', 'vocabulary'],
    order: 1,
  },
  {
    id: 'listening',
    title: { en: 'Listening', sv: 'Lyssna' },
    label: { en: 'Listening', sv: 'Lyssna' },
    curriculumAreaId: 'listening',
    skillIds: ['understanding-detail', 'understanding-purpose', 'response-to-text'],
    order: 2,
  },
  {
    id: 'writing',
    title: { en: 'Writing', sv: 'Skriva' },
    label: { en: 'Writing', sv: 'Skriva' },
    curriculumAreaId: 'writing',
    skillIds: ['structure', 'vocabulary', 'accuracy'],
    order: 3,
  },
  {
    id: 'reading',
    title: { en: 'Reading', sv: 'L\u00e4sa' },
    label: { en: 'Reading', sv: 'L\u00e4sa' },
    curriculumAreaId: 'reading',
    skillIds: ['understanding-detail', 'understanding-purpose', 'response-to-text'],
    order: 4,
  },
];

export function getEnglishTeachingUnitById(unitId) {
  return englishTeachingUnits.find((unit) => unit.id === unitId) || null;
}
