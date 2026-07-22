export const classGroupDefinitions = [
  {
    id: 'trajectory',
    label: 'Current working picture',
    description:
      'A teacher-confirmed view of how a student is currently progressing towards a grading goal.',
    allowMultiplePerStudent: false,
  },
  {
    id: 'teaching-response',
    label: 'Teaching response',
    description:
      'A temporary focus describing how teaching or support may be adapted.',
    allowMultiplePerStudent: true,
  },
  {
    id: 'documentation',
    label: 'Documentation focus',
    description:
      'A focus describing where more frequent or detailed documentation may be useful.',
    allowMultiplePerStudent: true,
  },
];
