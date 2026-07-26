export const english8ALessonSequence = [
  {
    id: 'english-8a-lesson-1',
    date: '2026-05-19',
    dayLabel: 'Tuesday',
    startTime: '10:15',
    endTime: '11:05',
    teachingUnitId: 'reading',
    title: 'Reading',
    focus: 'Using quotations to support inference',
  },
  {
    id: 'english-8a-lesson-2',
    date: '2026-05-21',
    dayLabel: 'Thursday',
    startTime: '13:05',
    endTime: '13:55',
    teachingUnitId: 'reading',
    title: 'Reading',
    focus: 'Explaining how a writer creates tension',
  },
  {
    id: 'english-8a-lesson-3',
    date: '2026-05-26',
    dayLabel: 'Tuesday',
    startTime: '10:15',
    endTime: '11:05',
    teachingUnitId: 'writing',
    title: 'Writing',
    focus: 'Building a clear argument paragraph',
  },
];

export const english8ADemoLessonIndex = 0;

export function getEnglish8ACurrentLesson() {
  return english8ALessonSequence[english8ADemoLessonIndex] || english8ALessonSequence[0] || null;
}
