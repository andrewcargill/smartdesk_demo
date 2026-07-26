export const englishCurriculumAreas = [
  {
    id: 'speaking',
    title: 'Speaking',
    label: 'Speaking',
    order: 1,
  },
  {
    id: 'listening',
    title: 'Listening',
    label: 'Listening',
    order: 2,
  },
  {
    id: 'writing',
    title: 'Writing',
    label: 'Writing',
    order: 3,
  },
  {
    id: 'reading',
    title: 'Reading',
    label: 'Reading',
    order: 4,
  },
];

export const englishSkills = [
  { id: 'interaction', title: 'Interaction', label: 'Interaction', order: 1 },
  { id: 'presentation', title: 'Presentation', label: 'Presentation', order: 2 },
  { id: 'understanding-detail', title: 'Understanding detail', label: 'Understanding detail', order: 3 },
  { id: 'understanding-purpose', title: 'Understanding purpose', label: 'Understanding purpose', order: 4 },
  { id: 'structure', title: 'Structure', label: 'Structure', order: 5 },
  { id: 'vocabulary', title: 'Vocabulary', label: 'Vocabulary', order: 6 },
  { id: 'accuracy', title: 'Accuracy', label: 'Accuracy', order: 7 },
  { id: 'response-to-text', title: 'Response to text', label: 'Response to text', order: 8 },
];

export const englishObservationLevels = [
  { id: 'emerging', label: 'Emerging', order: 1 },
  { id: 'developing', label: 'Developing', order: 2 },
  { id: 'secure', label: 'Secure', order: 3 },
  { id: 'advanced', label: 'Advanced', order: 4 },
];

export const englishTeachingUnits = [
  {
    id: 'speaking',
    title: 'Speaking',
    label: 'Speaking',
    curriculumAreaId: 'speaking',
    skillIds: ['interaction', 'presentation', 'vocabulary'],
    order: 1,
  },
  {
    id: 'listening',
    title: 'Listening',
    label: 'Listening',
    curriculumAreaId: 'listening',
    skillIds: ['understanding-detail', 'understanding-purpose', 'response-to-text'],
    order: 2,
  },
  {
    id: 'writing',
    title: 'Writing',
    label: 'Writing',
    curriculumAreaId: 'writing',
    skillIds: ['structure', 'vocabulary', 'accuracy'],
    order: 3,
  },
  {
    id: 'reading',
    title: 'Reading',
    label: 'Reading',
    curriculumAreaId: 'reading',
    skillIds: ['understanding-detail', 'understanding-purpose', 'response-to-text'],
    order: 4,
  },
];

export function getEnglishTeachingUnitById(unitId) {
  return englishTeachingUnits.find((unit) => unit.id === unitId) || null;
}
