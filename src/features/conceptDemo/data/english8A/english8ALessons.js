export const english8ALessonSequence = [
  {
    id: 'english-8a-lesson-1',
    date: '2026-05-19',
    dayLabel: { en: 'Tuesday', sv: 'Tisdag' },
    startTime: '10:15',
    endTime: '11:05',
    teachingUnitId: 'reading',
    title: { en: 'Reading', sv: 'L\u00e4sa' },
    focus: {
      en: 'Using quotations to support inference',
      sv: 'Anv\u00e4nda citat f\u00f6r att st\u00f6dja inferenser',
    },
  },
  {
    id: 'english-8a-lesson-2',
    date: '2026-05-21',
    dayLabel: { en: 'Thursday', sv: 'Torsdag' },
    startTime: '13:05',
    endTime: '13:55',
    teachingUnitId: 'reading',
    title: { en: 'Reading', sv: 'L\u00e4sa' },
    focus: {
      en: 'Explaining how a writer creates tension',
      sv: 'F\u00f6rklara hur en f\u00f6rfattare skapar sp\u00e4nning',
    },
  },
  {
    id: 'english-8a-lesson-3',
    date: '2026-05-26',
    dayLabel: { en: 'Tuesday', sv: 'Tisdag' },
    startTime: '10:15',
    endTime: '11:05',
    teachingUnitId: 'writing',
    title: { en: 'Writing', sv: 'Skriva' },
    focus: {
      en: 'Building a clear argument paragraph',
      sv: 'Bygga ett tydligt argumenterande stycke',
    },
  },
];

export const english8ADemoLessonIndex = 0;

export function getEnglish8ACurrentLesson() {
  return english8ALessonSequence[english8ADemoLessonIndex] || english8ALessonSequence[0] || null;
}
