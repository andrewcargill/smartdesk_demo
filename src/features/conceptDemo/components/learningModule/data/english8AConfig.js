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
  planning: {
    periods: [
      {
        id: 'may-2026',
        label: { en: 'May', sv: 'Maj' },
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        order: 1,
      },
      {
        id: 'june-2026',
        label: { en: 'June', sv: 'Juni' },
        startDate: '2026-06-01',
        endDate: '2026-06-19',
        order: 2,
      },
    ],
    blocks: [
      {
        id: 'english-8a-reading-inference',
        subjectId: 'english',
        classId: '8a',
        title: {
          en: 'Reading inference',
          sv: 'L\u00e4sinferens',
        },
        description: {
          en: 'Use quotations to support inference and explain writer choices.',
          sv: 'Anv\u00e4nd citat f\u00f6r att st\u00f6dja inferenser och f\u00f6rklara f\u00f6rfattarens val.',
        },
        teachingUnitId: 'reading',
        sourceTemplateId: 'reading',
        periodId: 'may-2026',
        startDate: '2026-05-05',
        endDate: '2026-05-21',
        status: 'current',
        curriculumAreaIds: ['reading'],
        evidenceTopicIds: ['reading'],
        abilityIds: ['understanding-detail', 'understanding-purpose', 'response-to-text'],
        blockType: 'teaching',
        assessmentAnchor: null,
        quickCaptureOptions: [
          {
            id: 'precise-quotation',
            label: {
              en: 'Precise quotation',
              sv: 'Precist citat',
            },
          },
          {
            id: 'valid-inference',
            label: {
              en: 'Valid inference',
              sv: 'Rimlig inferens',
            },
          },
          {
            id: 'writer-choice',
            label: {
              en: 'Writer choice explained',
              sv: 'F\u00f6rfattarens val f\u00f6rklarat',
            },
          },
        ],
        groupAdaptations: [],
        notes: null,
        createdAt: '2026-04-28',
        updatedAt: '2026-05-18',
        createdBy: 'teacher',
      },
      {
        id: 'english-8a-speaking-discussion',
        subjectId: 'english',
        classId: '8a',
        title: {
          en: 'Speaking discussion',
          sv: 'Muntlig diskussion',
        },
        description: {
          en: 'Build confidence in interaction, presentation and response to classmates.',
          sv: 'Bygg trygghet i interaktion, presentation och respons till klasskamrater.',
        },
        teachingUnitId: 'speaking',
        sourceTemplateId: 'speaking',
        periodId: 'may-2026',
        startDate: '2026-05-22',
        endDate: '2026-05-29',
        status: 'planned',
        curriculumAreaIds: ['speaking'],
        evidenceTopicIds: ['speaking'],
        abilityIds: ['interaction', 'presentation', 'vocabulary'],
        blockType: 'teaching',
        assessmentAnchor: null,
        quickCaptureOptions: [
          {
            id: 'built-on-response',
            label: {
              en: 'Built on another response',
              sv: 'Byggde vidare p\u00e5 ett annat svar',
            },
          },
          {
            id: 'clear-speaking',
            label: {
              en: 'Clear spoken contribution',
              sv: 'Tydligt muntligt bidrag',
            },
          },
        ],
        groupAdaptations: [],
        notes: null,
        createdAt: '2026-04-28',
        updatedAt: '2026-05-18',
        createdBy: 'teacher',
      },
      {
        id: 'english-8a-reading-checkpoint',
        subjectId: 'english',
        classId: '8a',
        title: {
          en: 'Reading checkpoint',
          sv: 'L\u00e4skontroll',
        },
        description: {
          en: 'Short checkpoint on inference and use of textual evidence.',
          sv: 'Kort kontroll av inferens och anv\u00e4ndning av textbel\u00e4gg.',
        },
        teachingUnitId: 'reading',
        sourceTemplateId: 'reading',
        periodId: 'may-2026',
        startDate: '2026-05-30',
        endDate: '2026-05-30',
        status: 'planned',
        curriculumAreaIds: ['reading'],
        evidenceTopicIds: ['reading'],
        abilityIds: ['understanding-purpose', 'response-to-text'],
        blockType: 'assessment',
        assessmentAnchor: null,
        quickCaptureOptions: [],
        groupAdaptations: [],
        notes: null,
        createdAt: '2026-04-28',
        updatedAt: '2026-05-18',
        createdBy: 'teacher',
      },
      {
        id: 'english-8a-argument-writing',
        subjectId: 'english',
        classId: '8a',
        title: {
          en: 'Argument writing',
          sv: 'Argumenterande skrivande',
        },
        description: {
          en: 'Develop clear opinion paragraphs with reasons, structure and vocabulary.',
          sv: 'Utveckla tydliga \u00e5siktsstycken med sk\u00e4l, struktur och ordf\u00f6rr\u00e5d.',
        },
        teachingUnitId: 'writing',
        sourceTemplateId: 'writing',
        periodId: 'june-2026',
        startDate: '2026-06-01',
        endDate: '2026-06-12',
        status: 'planned',
        curriculumAreaIds: ['writing'],
        evidenceTopicIds: ['writing'],
        abilityIds: ['structure', 'vocabulary', 'accuracy'],
        blockType: 'teaching',
        assessmentAnchor: null,
        quickCaptureOptions: [
          {
            id: 'clear-opinion',
            label: {
              en: 'Clear opinion',
              sv: 'Tydlig \u00e5sikt',
            },
          },
          {
            id: 'sequenced-reasons',
            label: {
              en: 'Sequenced reasons',
              sv: 'Ordnade sk\u00e4l',
            },
          },
        ],
        groupAdaptations: [],
        notes: null,
        createdAt: '2026-04-28',
        updatedAt: '2026-05-18',
        createdBy: 'teacher',
      },
    ],
    tools: [
      {
        id: 'blank-block',
        title: {
          en: 'Blank block',
          sv: 'Tomt block',
        },
        blockType: 'teaching',
        description: '',
        curriculumAreaIds: [],
        evidenceTopicIds: [],
        abilityIds: [],
        quickCaptureOptions: [],
      },
      {
        id: 'revision-consolidation',
        title: {
          en: 'Revision and consolidation',
          sv: 'Repetition och bef\u00e4stande',
        },
        blockType: 'consolidation',
        description: {
          en: 'Create time to revisit and secure earlier learning.',
          sv: 'Skapa tid f\u00f6r att repetera och bef\u00e4sta tidigare l\u00e4rande.',
        },
        curriculumAreaIds: [],
        evidenceTopicIds: [],
        abilityIds: [],
        quickCaptureOptions: [],
      },
      {
        id: 'assessment-point',
        title: {
          en: 'Assessment point',
          sv: 'Bed\u00f6mningspunkt',
        },
        blockType: 'assessment',
        description: {
          en: 'Add a planned assessment or checkpoint.',
          sv: 'L\u00e4gg till en planerad bed\u00f6mning eller kontrollpunkt.',
        },
        curriculumAreaIds: [],
        evidenceTopicIds: [],
        abilityIds: [],
        quickCaptureOptions: [],
      },
    ],
    curriculumAreaTypeLabels: {
      content: {
        en: 'Content',
        sv: 'Inneh\u00e5ll',
      },
      ability: {
        en: 'Skills',
        sv: 'F\u00e4rdigheter',
      },
    },
    curriculumNotes: [],
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
