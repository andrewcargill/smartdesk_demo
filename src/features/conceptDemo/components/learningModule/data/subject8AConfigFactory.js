import { class8AProfile, class8AStudents } from '../../../data/classes/class8AStudents.js';
import { getSubjectDefinition } from '../../../data/subjectCatalogue.js';
import { resolveLocalizedValue } from '../../../i18n/conceptDemoTranslations.js';
import { english8AConfig } from './english8AConfig.js';

const navigation = {
  defaultScreen: 'class-picture',
  items: [
    { id: 'class-picture', label: { en: 'Class picture', sv: 'Klassbild' } },
    { id: 'plan', label: { en: 'Plan', sv: 'Planering' } },
    { id: 'now', label: { en: 'Now', sv: 'Nu' } },
    { id: 'assessment', label: { en: 'Assessment', sv: 'Bed\u00f6mning' } },
  ],
};

const subjectBlueprints = {
  mathematics: {
    areas: [
      ['number', 'Number', 'Tal'],
      ['algebra', 'Algebra', 'Algebra'],
      ['geometry', 'Geometry', 'Geometri'],
      ['problem-solving', 'Problem solving', 'Probleml\u00f6sning'],
    ],
    skills: [
      ['methods', 'Methods', 'Metoder'],
      ['reasoning', 'Reasoning', 'Resonemang'],
      ['communication', 'Communication', 'Kommunikation'],
      ['concepts', 'Concepts', 'Begrepp'],
    ],
    unitTitles: [
      ['Fractions and percentages', 'Br\u00e5k och procent'],
      ['Algebra patterns', 'Algebraiska m\u00f6nster'],
      ['Geometry reasoning', 'Geometriska resonemang'],
    ],
  },
  science: {
    areas: [
      ['forces', 'Forces', 'Krafter'],
      ['energy', 'Energy', 'Energi'],
      ['investigation', 'Investigation', 'Unders\u00f6kning'],
      ['ecosystems', 'Ecosystems', 'Ekosystem'],
    ],
    skills: [
      ['hypothesis', 'Hypothesis', 'Hypotes'],
      ['method', 'Method', 'Metod'],
      ['analysis', 'Analysis', 'Analys'],
      ['explanation', 'Explanation', 'F\u00f6rklaring'],
    ],
    unitTitles: [
      ['Forces in motion', 'Krafter i r\u00f6relse'],
      ['Energy transfer', 'Energiomvandling'],
      ['Ecosystem investigation', 'Ekosystemunders\u00f6kning'],
    ],
  },
  swedish: {
    areas: [
      ['reading', 'Reading', 'L\u00e4sa'],
      ['writing', 'Writing', 'Skriva'],
      ['speaking', 'Speaking', 'Tala'],
      ['language', 'Language', 'Spr\u00e5k'],
    ],
    skills: [
      ['interpretation', 'Interpretation', 'Tolkning'],
      ['structure', 'Structure', 'Struktur'],
      ['argument', 'Argument', 'Argument'],
      ['presentation', 'Presentation', 'Presentation'],
    ],
    unitTitles: [
      ['Reading strategies', 'L\u00e4sstrategier'],
      ['Argument writing', 'Argumenterande text'],
      ['Oral presentation', 'Muntlig presentation'],
    ],
  },
  history: {
    areas: [
      ['source-criticism', 'Source criticism', 'K\u00e4llkritik'],
      ['change', 'Change', 'F\u00f6r\u00e4ndring'],
      ['cause', 'Cause and consequence', 'Orsak och konsekvens'],
      ['perspective', 'Perspective', 'Perspektiv'],
    ],
    skills: [
      ['evidence-use', 'Use evidence', 'Anv\u00e4nda k\u00e4llor'],
      ['chronology', 'Chronology', 'Kronologi'],
      ['comparison', 'Comparison', 'J\u00e4mf\u00f6relse'],
      ['explanation', 'Explanation', 'F\u00f6rklaring'],
    ],
    unitTitles: [
      ['Source criticism', 'K\u00e4llkritik'],
      ['Industrialisation', 'Industrialiseringen'],
      ['Democracy development', 'Demokratins utveckling'],
    ],
  },
  'physical-education': {
    areas: [
      ['movement', 'Movement', 'R\u00f6relse'],
      ['health', 'Health', 'H\u00e4lsa'],
      ['training', 'Training', 'Tr\u00e4ning'],
      ['collaboration', 'Collaboration', 'Samarbete'],
    ],
    skills: [
      ['coordination', 'Coordination', 'Koordination'],
      ['planning', 'Planning', 'Planering'],
      ['evaluation', 'Evaluation', 'Utv\u00e4rdering'],
      ['participation', 'Participation', 'Deltagande'],
    ],
    unitTitles: [
      ['Movement and coordination', 'R\u00f6relse och koordination'],
      ['Training methods', 'Tr\u00e4ningsmetoder'],
      ['Health evaluation', 'H\u00e4lsoutv\u00e4rdering'],
    ],
  },
};

const fallbackBlueprint = subjectBlueprints.science;

function localized(en, sv) {
  return { en, sv };
}

function getSubjectTitle(subjectId) {
  const subject = getSubjectDefinition(subjectId);
  return {
    en: resolveLocalizedValue(subject?.title, 'en', subjectId),
    sv: resolveLocalizedValue(subject?.title, 'sv', subjectId),
  };
}

function getBlueprint(subjectId) {
  return subjectBlueprints[subjectId] || fallbackBlueprint;
}

function buildCurriculum(subjectId) {
  const blueprint = getBlueprint(subjectId);
  const areas = blueprint.areas.map(([id, en, sv], index) => ({
    id,
    title: localized(en, sv),
    label: localized(en, sv),
    order: index + 1,
  }));
  const skills = blueprint.skills.map(([id, en, sv], index) => ({
    id,
    title: localized(en, sv),
    label: localized(en, sv),
    order: index + 1,
  }));
  const teachingUnits = blueprint.unitTitles.map(([en, sv], index) => {
    const area = areas[index % areas.length];
    const unitSkills = skills.slice(index, index + 3);

    return {
      id: area.id,
      title: localized(en, sv),
      label: localized(en, sv),
      curriculumAreaId: area.id,
      skillIds: unitSkills.length ? unitSkills.map((skill) => skill.id) : skills.slice(0, 3).map((skill) => skill.id),
      order: index + 1,
    };
  });

  return {
    areas,
    skills,
    observationLevels: [
      { id: 'emerging', label: localized('Emerging', 'P\u00e5 v\u00e4g'), order: 1 },
      { id: 'developing', label: localized('Developing', 'Utvecklas'), order: 2 },
      { id: 'secure', label: localized('Secure', 'S\u00e4ker'), order: 3 },
      { id: 'advanced', label: localized('Advanced', 'Avancerad'), order: 4 },
    ],
    teachingUnits,
  };
}

function buildLessonSequence(subjectId, schedule, curriculum) {
  const matchingLessons = (schedule?.scheduleEntries || [])
    .filter((event) => event.type === 'lesson' && event.classId === '8a' && event.subjectId === subjectId)
    .slice(0, 3);
  const fallbackLessons = [
    { id: 'fallback-1', date: '2026-05-19', dayLabel: localized('Tuesday', 'Tisdag'), startTime: '09:15', endTime: '10:05' },
    { id: 'fallback-2', date: '2026-05-21', dayLabel: localized('Thursday', 'Torsdag'), startTime: '09:15', endTime: '10:05' },
    { id: 'fallback-3', date: '2026-05-26', dayLabel: localized('Tuesday', 'Tisdag'), startTime: '09:15', endTime: '10:05' },
  ];
  const sourceLessons = matchingLessons.length ? matchingLessons : fallbackLessons;

  return sourceLessons.map((event, index) => {
    const teachingUnit = curriculum.teachingUnits[index % curriculum.teachingUnits.length];

    return {
      id: `${subjectId}-8a-lesson-${index + 1}`,
      date: event.date || fallbackLessons[index]?.date,
      dayLabel: event.dayLabel || localized(event.dayLabel || 'Lesson day', event.dayLabel || 'Lektionsdag'),
      startTime: event.startTime || event.start || fallbackLessons[index]?.startTime,
      endTime: event.endTime || event.end || fallbackLessons[index]?.endTime,
      teachingUnitId: teachingUnit.id,
      title: teachingUnit.title,
      focus: localized(
        `${resolveLocalizedValue(teachingUnit.title, 'en')} focus lesson`,
        `Fokuslektion i ${resolveLocalizedValue(teachingUnit.title, 'sv')}`,
      ),
    };
  });
}

function buildEvidence(subjectId, curriculum, lessons) {
  const [firstUnit, secondUnit, thirdUnit] = curriculum.teachingUnits;
  const [firstSkill, secondSkill, thirdSkill] = curriculum.skills;
  const students = class8AStudents.slice(0, 8);
  const dates = ['2026-05-05', '2026-05-07', '2026-05-12', '2026-05-14'];
  const levels = ['developing', 'secure', 'emerging', 'advanced'];
  const observations = students.map((student, index) => {
    const unit = [firstUnit, secondUnit, thirdUnit][index % 3] || firstUnit;
    const skill = [firstSkill, secondSkill, thirdSkill][index % 3] || firstSkill;

    return {
      id: `${subjectId}-8a-evidence-${index + 1}`,
      type: 'observation',
      studentId: student.id,
      date: dates[index % dates.length],
      teachingUnitId: unit.id,
      skillId: skill.id,
      levelId: levels[index % levels.length],
      note: localized(
        `${student.firstName} showed ${resolveLocalizedValue(skill.title, 'en').toLowerCase()} during ${resolveLocalizedValue(unit.title, 'en').toLowerCase()}.`,
        `${student.firstName} visade ${resolveLocalizedValue(skill.title, 'sv').toLowerCase()} under ${resolveLocalizedValue(unit.title, 'sv').toLowerCase()}.`,
      ),
    };
  });

  return {
    items: [
      ...observations,
      {
        id: `${subjectId}-8a-assessment-1`,
        type: 'assessment',
        title: localized(`${resolveLocalizedValue(firstUnit.title, 'en')} checkpoint`, `Kontroll i ${resolveLocalizedValue(firstUnit.title, 'sv')}`),
        date: lessons[0]?.date || '2026-05-15',
        teachingUnitId: firstUnit.id,
        max: 20,
        pass: 10,
        results: students.map((student, index) => ({
          studentId: student.id,
          score: [11, 17, 8, 16, 0, 12, 18, 10][index] || 12,
          percentage: [55, 85, 40, 80, 0, 60, 90, 50][index] || 60,
          passed: ![2, 4].includes(index),
          absent: index === 4,
          warning: index === 2,
        })),
      },
    ],
    learningObservations: students.slice(0, 3).map((student, index) => ({
      id: `${subjectId}-8a-learning-${index + 1}`,
      studentId: student.id,
      date: dates[index],
      focus: ['0', '+', '-'][index],
      participation: ['+', '+', '0'][index],
      independence: ['0', '+', '-'][index],
      comment: localized(
        `${student.firstName} has a useful learning habit signal for this subject.`,
        `${student.firstName} har en anv\u00e4ndbar signal om l\u00e4rvanor i detta \u00e4mne.`,
      ),
    })),
  };
}

function buildPlanning(subjectId, curriculum) {
  return {
    periods: [
      { id: 'may-2026', label: localized('May', 'Maj'), startDate: '2026-05-01', endDate: '2026-05-31', order: 1 },
      { id: 'june-2026', label: localized('June', 'Juni'), startDate: '2026-06-01', endDate: '2026-06-19', order: 2 },
    ],
    blocks: curriculum.teachingUnits.map((unit, index) => ({
      id: `${subjectId}-8a-${unit.id}`,
      subjectId,
      classId: '8a',
      title: unit.title,
      description: localized(
        `Build evidence for ${resolveLocalizedValue(unit.title, 'en').toLowerCase()}.`,
        `Bygg underlag f\u00f6r ${resolveLocalizedValue(unit.title, 'sv').toLowerCase()}.`,
      ),
      teachingUnitId: unit.id,
      sourceTemplateId: unit.id,
      periodId: index < 2 ? 'may-2026' : 'june-2026',
      startDate: index === 0 ? '2026-05-05' : index === 1 ? '2026-05-22' : '2026-06-01',
      endDate: index === 0 ? '2026-05-21' : index === 1 ? '2026-05-29' : '2026-06-12',
      status: index === 0 ? 'current' : 'planned',
      curriculumAreaIds: [unit.curriculumAreaId],
      evidenceTopicIds: [unit.id],
      abilityIds: unit.skillIds || [],
      blockType: 'teaching',
      assessmentAnchor: null,
      quickCaptureOptions: (unit.skillIds || []).slice(0, 2).map((skillId) => {
        const skill = curriculum.skills.find((item) => item.id === skillId);
        return { id: skillId, label: skill?.title || localized(skillId, skillId) };
      }),
      groupAdaptations: [],
      notes: null,
      createdAt: '2026-04-28',
      updatedAt: '2026-05-18',
      createdBy: 'teacher',
    })),
    tools: [
      { id: 'blank-block', title: localized('Blank block', 'Tomt block'), blockType: 'teaching', description: '', curriculumAreaIds: [], evidenceTopicIds: [], abilityIds: [], quickCaptureOptions: [] },
      { id: 'revision-consolidation', title: localized('Revision and consolidation', 'Repetition och bef\u00e4stande'), blockType: 'consolidation', description: localized('Create time to revisit and secure earlier learning.', 'Skapa tid f\u00f6r att repetera och bef\u00e4sta tidigare l\u00e4rande.'), curriculumAreaIds: [], evidenceTopicIds: [], abilityIds: [], quickCaptureOptions: [] },
      { id: 'assessment-point', title: localized('Assessment point', 'Bed\u00f6mningspunkt'), blockType: 'assessment', description: localized('Add a planned assessment or checkpoint.', 'L\u00e4gg till en planerad bed\u00f6mning eller kontrollpunkt.'), curriculumAreaIds: [], evidenceTopicIds: [], abilityIds: [], quickCaptureOptions: [] },
    ],
    curriculumAreaTypeLabels: {
      content: localized('Content', 'Inneh\u00e5ll'),
      ability: localized('Skills', 'F\u00e4rdigheter'),
    },
    curriculumNotes: [],
  };
}

function normalizeStudentPreviousResults(subjectId) {
  return class8AStudents.map((student) => ({
    ...student,
    previousResults: [
      ...(student.previousResults || []),
      {
        id: `${student.id}-${subjectId}-previous`,
        subjectId,
        schoolYear: 'Year 7',
        term: 'Spring',
        date: '2025-06-10',
        grade: student.previousResults?.[0]?.grade || 'C',
        source: 'previous-year-record',
      },
    ],
  }));
}

export function buildSubject8AConfig({ subjectId, schedule } = {}) {
  if (subjectId === 'english') {
    return {
      ...english8AConfig,
      source: {
        ...(english8AConfig.source || {}),
        generatedBy: 'subject8AConfigFactory',
      },
    };
  }

  const subjectTitle = getSubjectTitle(subjectId);
  const curriculum = buildCurriculum(subjectId);
  const lessons = buildLessonSequence(subjectId, schedule, curriculum);
  const evidence = buildEvidence(subjectId, curriculum, lessons);

  return {
    id: `${subjectId}-8a`,
    subjectId,
    classId: '8a',
    title: {
      en: `${subjectTitle.en} 8A`,
      sv: `${subjectTitle.sv} 8A`,
    },
    subtitle: localized('Reusable module prototype', '\u00c5teranv\u00e4ndbar modulprototyp'),
    className: '8A',
    subjectTitle,
    headerSubtitle: localized('Reusable module prototype', '\u00c5teranv\u00e4ndbar modulprototyp'),
    classData: {
      profile: class8AProfile,
      students: normalizeStudentPreviousResults(subjectId),
    },
    curriculum,
    lessons: {
      current: lessons[0] || null,
      sequence: lessons,
    },
    evidence,
    planning: buildPlanning(subjectId, curriculum),
    navigation,
    screens: {
      'class-picture': {
        title: localized('Class picture', 'Klassbild'),
        description: localized(`Reusable class overview for ${subjectTitle.en} 8A.`, `\u00c5teranv\u00e4ndbar klass\u00f6versikt f\u00f6r ${subjectTitle.sv} 8A.`),
      },
      plan: {
        title: localized('Plan', 'Planering'),
        description: localized(`Reusable planning space for ${subjectTitle.en} 8A.`, `\u00c5teranv\u00e4ndbar planeringsyta f\u00f6r ${subjectTitle.sv} 8A.`),
      },
      now: {
        title: localized('Now', 'Nu'),
        description: localized(`Reusable lesson capture for ${subjectTitle.en} 8A.`, `\u00c5teranv\u00e4ndbar lektionsinsamling f\u00f6r ${subjectTitle.sv} 8A.`),
      },
      assessment: {
        title: localized('Assessment', 'Bed\u00f6mning'),
        description: localized(`Reusable assessment space for ${subjectTitle.en} 8A.`, `\u00c5teranv\u00e4ndbar bed\u00f6mningsyta f\u00f6r ${subjectTitle.sv} 8A.`),
      },
    },
  };
}

export function getLearningModuleConfig({ subjectId, classId = '8a', schedule } = {}) {
  if (classId === '8a') {
    return buildSubject8AConfig({ subjectId, schedule });
  }

  return buildSubject8AConfig({ subjectId, schedule });
}
