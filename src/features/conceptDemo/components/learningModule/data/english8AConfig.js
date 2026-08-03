import {
  class8AProfile,
  class8AStudents,
  english8AEvidence,
  english8ALearningObservations,
  english8ALessonSequence,
  englishCurriculumAreas,
  englishObservationLevels,
  englishSkills,
  englishTeachingUnits,
  getEnglish8ACurrentLesson,
} from '../../../data/english8A/index.js';

const currentLesson = getEnglish8ACurrentLesson();

export const english8AConfig = {
  id: 'english-8a',
  subjectId: 'english',
  classId: '8a',
  title: {
    en: 'English 8A',
    sv: 'Engelska 8A',
  },
  subtitle: {
    en: 'Reusable module prototype',
    sv: '\u00c5teranv\u00e4ndbar modulprototyp',
  },
  className: '8A',
  headerSubtitle: {
    en: 'Reusable module prototype',
    sv: '\u00c5teranv\u00e4ndbar modulprototyp',
  },
  contextLine: currentLesson
    ? {
      en: `Tuesday \u00b7 ${currentLesson.startTime}-${currentLesson.endTime}`,
      sv: `Tisdag \u00b7 ${currentLesson.startTime}-${currentLesson.endTime}`,
    }
    : {
      en: 'English 8A lesson',
      sv: 'Engelska 8A-lektion',
    },
  classData: {
    profile: class8AProfile,
    students: class8AStudents,
  },
  curriculum: {
    areas: englishCurriculumAreas,
    skills: englishSkills,
    observationLevels: englishObservationLevels,
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
      { id: 'class-picture', label: { en: 'Class picture', sv: 'Klassbild' } },
      { id: 'plan', label: { en: 'Plan', sv: 'Planering' } },
      { id: 'now', label: { en: 'Now', sv: 'Nu' } },
      { id: 'assessment', label: { en: 'Assessment', sv: 'Bed\u00f6mning' } },
    ],
  },
  screens: {
    'class-picture': {
      title: {
        en: 'Class picture',
        sv: 'Klassbild',
      },
      description: {
        en: 'Reusable class overview for English 8A.',
        sv: '\u00c5teranv\u00e4ndbar klass\u00f6versikt f\u00f6r Engelska 8A.',
      },
    },
    plan: {
      title: {
        en: 'Plan',
        sv: 'Planering',
      },
      description: {
        en: 'Reusable planning space for English 8A.',
        sv: '\u00c5teranv\u00e4ndbar planeringsyta f\u00f6r Engelska 8A.',
      },
    },
    now: {
      title: {
        en: 'Now',
        sv: 'Nu',
      },
      description: {
        en: 'Reusable lesson capture for English 8A.',
        sv: '\u00c5teranv\u00e4ndbar lektionsinsamling f\u00f6r Engelska 8A.',
      },
    },
    assessment: {
      title: {
        en: 'Assessment',
        sv: 'Bed\u00f6mning',
      },
      description: {
        en: 'Reusable assessment space for English 8A.',
        sv: '\u00c5teranv\u00e4ndbar bed\u00f6mningsyta f\u00f6r Engelska 8A.',
      },
    },
  },
};
