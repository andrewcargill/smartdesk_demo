import {
  class8AProfile,
  class8AStudents,
  english8AEvidence,
  english8ALearningObservations,
  english8ALessonSequence,
  englishCurriculumAreas,
  englishSkills,
  englishTeachingUnits,
  getEnglish8ACurrentLesson,
} from '../../../data/english8A/index.js';

const currentLesson = getEnglish8ACurrentLesson();

export const english8AConfig = {
  id: 'english-8a',
  subjectId: 'english',
  classId: '8a',
  title: 'English 8A',
  subtitle: 'Reusable module prototype',
  className: '8A',
  headerSubtitle: 'Reusable module prototype',
  contextLine: currentLesson
    ? `${currentLesson.dayLabel} · ${currentLesson.startTime}-${currentLesson.endTime}`
    : 'English 8A lesson',
  classData: {
    profile: class8AProfile,
    students: class8AStudents,
  },
  curriculum: {
    areas: englishCurriculumAreas,
    skills: englishSkills,
    teachingUnits: englishTeachingUnits,
  },
  lessons: {
    current: currentLesson,
    sequence: english8ALessonSequence,
  },
  evidence: {
    items: english8AEvidence,
    learningObservations: english8ALearningObservations,
  },
  navigation: {
    defaultScreen: 'class-picture',
    items: [
      { id: 'class-picture', label: 'Class picture' },
      { id: 'plan', label: 'Plan' },
      { id: 'now', label: 'Now' },
      { id: 'assessment', label: 'Assessment' },
    ],
  },
  screens: {
    'class-picture': {
      title: 'Class picture',
      description: 'Reusable class overview for English 8A.',
    },
    plan: {
      title: 'Plan',
      description: 'Reusable planning space for English 8A.',
    },
    now: {
      title: 'Now',
      description: 'Reusable lesson capture for English 8A.',
    },
    assessment: {
      title: 'Assessment',
      description: 'Reusable assessment space for English 8A.',
    },
  },
};
