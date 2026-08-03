import { class8AProfile, class8AStudents } from '../../../data/classes/class8AStudents.js';
import { getSubjectDefinition } from '../../../data/subjectCatalogue.js';
import { resolveLocalizedValue } from '../../../i18n/conceptDemoTranslations.js';

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
  english: {
    areas: [
      ['reading', 'Reading', 'L\u00e4sa'],
      ['writing', 'Writing', 'Skriva'],
      ['speaking', 'Speaking', 'Tala'],
      ['listening', 'Listening', 'Lyssna'],
    ],
    skills: [
      ['understanding-detail', 'Understanding detail', 'F\u00f6rst\u00e5 detaljer'],
      ['understanding-purpose', 'Understanding purpose', 'F\u00f6rst\u00e5 syfte'],
      ['response-to-text', 'Response to text', 'Textrespons'],
      ['structure', 'Structure', 'Struktur'],
      ['vocabulary', 'Vocabulary', 'Ordf\u00f6rr\u00e5d'],
      ['accuracy', 'Accuracy', 'Korrekthet'],
      ['interaction', 'Interaction', 'Interaktion'],
      ['presentation', 'Presentation', 'Presentation'],
    ],
    unitTitles: [
      ['Reading inference', 'L\u00e4sinferens'],
      ['Argument writing', 'Argumenterande skrivande'],
      ['Speaking discussion', 'Muntlig diskussion'],
    ],
  },
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
  sloyd: {
    areas: [
      ['materials-tools-techniques', 'Materials, tools and craft techniques', 'Sl\u00f6jdens material, verktyg och hantverkstekniker'],
      ['work-processes', 'Craft work processes', 'Sl\u00f6jdens arbetsprocesser'],
      ['expression-sustainability', 'Expression and sustainable development', 'Sl\u00f6jdens uttryck och betydelse f\u00f6r h\u00e5llbar utveckling'],
    ],
    skills: [
      ['design-and-make', 'Design and make objects', 'Formge och framst\u00e4lla f\u00f6rem\u00e5l'],
      ['safe-tool-use', 'Use tools safely and appropriately', 'Anv\u00e4nda verktyg s\u00e4kert och \u00e4ndam\u00e5lsenligt'],
      ['develop-ideas', 'Develop ideas from inspiration', 'Utveckla id\u00e9er utifr\u00e5n inspirationsk\u00e4llor'],
      ['test-material-technique', 'Try and rethink material and technique combinations', 'Pr\u00f6va och ompr\u00f6va material- och teknikkombinationer'],
      ['justify-approach', 'Choose and justify approaches', 'V\u00e4lja och motivera tillv\u00e4gag\u00e5ngss\u00e4tt'],
      ['reflect-quality-expression-environment', 'Reflect on quality, expression and environment', 'Reflektera \u00f6ver kvalitet, uttryck och milj\u00f6'],
    ],
    unitTitles: [
      ['Textile: pattern, construction and function', 'Textilsl\u00f6jd: m\u00f6nster, konstruktion och funktion'],
      ['Wood and metal: form, joining and precision', 'Tr\u00e4- och metallsl\u00f6jd: form, sammanfogning och precision'],
      ['Design process: expression, repair and reuse', 'Designprocess: uttryck, reparation och \u00e5terbruk'],
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

const studentProfiles = {
  'elias-nilsson': { pattern: 'improving', previousGrade: 'C', assessmentScores: [8, 12, 15], learningPattern: ['-', '0', '0', '+', '+'] },
  'freya-wilson': { pattern: 'high', previousGrade: 'B', assessmentScores: [17, 18, 19], learningPattern: ['+', '+', '+', '+', '+'] },
  'omar-hassan': { pattern: 'struggling', previousGrade: 'C', assessmentScores: [6, 7, 9], learningPattern: ['-', '-', '0', '-', '0'] },
  'alice-bergstrom': { pattern: 'secure', previousGrade: 'B', assessmentScores: [14, 15, 16], learningPattern: ['0', '+', '+', '+', '+'] },
  'noor-ahmed': { pattern: 'fragile', previousGrade: 'D', assessmentScores: [4, 8, 10], learningPattern: ['-', '-', '0', '0', '+'] },
  'william-dahl': { pattern: 'steady', previousGrade: 'C', assessmentScores: [11, 12, 13], learningPattern: ['0', '0', '0', '+', '0'] },
  'isabella-rossi': { pattern: 'high', previousGrade: 'A', assessmentScores: [18, 19, 20], learningPattern: ['+', '+', '+', '+', '+'] },
  'benjamin-larsson': { pattern: 'inconsistent', previousGrade: 'C', assessmentScores: [10, 8, 13], learningPattern: ['0', '-', '0', '+', '0'] },
  'sofia-eriksson': { pattern: 'secure', previousGrade: 'B', assessmentScores: [15, 16, 17], learningPattern: ['+', '+', '0', '+', '+'] },
  'lucas-martin': { pattern: 'struggling', previousGrade: 'D', assessmentScores: [5, 6, 8], learningPattern: ['-', '-', '-', '0', '0'] },
};

const evidenceDates = ['2026-01-22', '2026-02-12', '2026-03-12', '2026-04-16', '2026-05-14'];
const assessmentDates = ['2026-02-27', '2026-04-10', '2026-05-16'];

const levelProgressions = {
  high: ['secure', 'advanced', 'advanced', 'advanced', 'advanced'],
  secure: ['developing', 'secure', 'secure', 'secure', 'advanced'],
  steady: ['developing', 'developing', 'secure', 'secure', 'secure'],
  improving: ['emerging', 'developing', 'developing', 'secure', 'secure'],
  fragile: ['emerging', 'emerging', 'developing', 'developing', 'secure'],
  inconsistent: ['developing', 'emerging', 'developing', 'secure', 'developing'],
  struggling: ['emerging', 'emerging', 'emerging', 'developing', 'developing'],
};

const sloydObservationText = {
  high: {
    en: ['combined material and technique with precision', 'used tools safely and efficiently', 'developed the idea from inspiration independently', 'reworked a construction choice after testing', 'explained quality, expression and environmental impact clearly'],
    sv: ['kombinerade material och teknik med precision', 'anv\u00e4nde verktyg s\u00e4kert och effektivt', 'utvecklade id\u00e9n sj\u00e4lvst\u00e4ndigt utifr\u00e5n inspiration', 'omarbetade ett konstruktionsval efter pr\u00f6vning', 'f\u00f6rklarade kvalitet, uttryck och milj\u00f6p\u00e5verkan tydligt'],
  },
  secure: {
    en: ['made a functional object with appropriate technique', 'used tools safely and purposefully', 'developed the sketch into a workable plan', 'adjusted material choices after feedback', 'reflected on quality and sustainability in a developed way'],
    sv: ['framst\u00e4llde ett funktionellt f\u00f6rem\u00e5l med l\u00e4mplig teknik', 'anv\u00e4nde verktyg s\u00e4kert och \u00e4ndam\u00e5lsenligt', 'utvecklade skissen till en fungerande plan', 'justerade materialval efter feedback', 'reflekterade utvecklat \u00f6ver kvalitet och h\u00e5llbarhet'],
  },
  steady: {
    en: ['followed the work plan with some reminders', 'handled tools safely after a check-in', 'made a clear but simple design choice', 'tested a join or seam before continuing', 'described how the process affected the result'],
    sv: ['f\u00f6ljde arbetsplanen med n\u00e5gra p\u00e5minnelser', 'hanterade verktyg s\u00e4kert efter avst\u00e4mning', 'gjorde ett tydligt men enkelt formgivningsval', 'pr\u00f6vade en sammanfogning eller s\u00f6m innan arbetet fortsatte', 'beskrev hur processen p\u00e5verkade resultatet'],
  },
  improving: {
    en: ['needed support to choose technique at first', 'became more secure with tools over time', 'used feedback to improve the pattern or model', 'started testing alternatives before deciding', 'showed stronger reflection than earlier in the term'],
    sv: ['beh\u00f6vde f\u00f6rst st\u00f6d f\u00f6r att v\u00e4lja teknik', 'blev s\u00e4krare med verktygen \u00f6ver tid', 'anv\u00e4nde feedback f\u00f6r att f\u00f6rb\u00e4ttra m\u00f6nstret eller modellen', 'b\u00f6rjade pr\u00f6va alternativ innan beslut', 'visade starkare reflektion \u00e4n tidigare under terminen'],
  },
  fragile: {
    en: ['needed close scaffolding to begin making', 'used tools safely with adult proximity', 'kept the design idea simple to make progress', 'completed part of the object with support', 'began to connect material choice with function'],
    sv: ['beh\u00f6vde n\u00e4ra st\u00f6ttning f\u00f6r att komma ig\u00e5ng med framst\u00e4llningen', 'anv\u00e4nde verktyg s\u00e4kert med vuxen n\u00e4ra', 'h\u00f6ll formid\u00e9n enkel f\u00f6r att komma vidare', 'genomf\u00f6rde delar av f\u00f6rem\u00e5let med st\u00f6d', 'b\u00f6rjade koppla materialval till funktion'],
  },
  inconsistent: {
    en: ['started the practical work well but lost process focus', 'missed a measurement or safety routine', 'recovered after revisiting the work plan', 'made a stronger material decision after testing', 'needs more consistent reflection during the process'],
    sv: ['startade det praktiska arbetet bra men tappade processfokus', 'missade ett m\u00e5tt eller en s\u00e4kerhetsrutin', '\u00e5terh\u00e4mtade arbetet efter att ha g\u00e5tt tillbaka till arbetsplanen', 'gjorde ett starkare materialval efter pr\u00f6vning', 'beh\u00f6ver mer kontinuerlig reflektion under processen'],
  },
  struggling: {
    en: ['needed close support with the practical sequence', 'found safe and purposeful tool use difficult', 'needed help turning the idea into a workable plan', 'completed a reduced construction task', 'needs guided practice to reflect on quality and environment'],
    sv: ['beh\u00f6vde n\u00e4ra st\u00f6d med den praktiska arbetsg\u00e5ngen', 'hade sv\u00e5rt med s\u00e4ker och \u00e4ndam\u00e5lsenlig verktygsanv\u00e4ndning', 'beh\u00f6vde hj\u00e4lp att g\u00f6ra id\u00e9n till en fungerande plan', 'genomf\u00f6rde en avgr\u00e4nsad konstruktionsuppgift', 'beh\u00f6ver guidad \u00f6vning i att reflektera \u00f6ver kvalitet och milj\u00f6'],
  },
};

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

function buildEvidence(subjectId, curriculum) {
  const [firstUnit] = curriculum.teachingUnits;
  const students = class8AStudents;
  const observations = students.flatMap((student, studentIndex) => {
    const profile = studentProfiles[student.id] || studentProfiles['william-dahl'];
    const levelProgression = levelProgressions[profile.pattern] || levelProgressions.steady;

    return evidenceDates.map((date, evidenceIndex) => {
      const unit = curriculum.teachingUnits[(studentIndex + evidenceIndex) % curriculum.teachingUnits.length];
      const skillId = (unit.skillIds || [])[evidenceIndex % (unit.skillIds || []).length] || curriculum.skills[evidenceIndex % curriculum.skills.length]?.id;
      const skill = curriculum.skills.find((item) => item.id === skillId) || curriculum.skills[0];
      const levelId = levelProgression[evidenceIndex] || levelProgression[levelProgression.length - 1];
      const trendText = subjectId === 'sloyd' ? sloydObservationText[profile.pattern]?.en || [] : {
        high: ['worked confidently', 'extended the task independently', 'made precise links', 'supported peers', 'is ready for greater challenge'],
        secure: ['met the expected focus', 'used feedback well', 'worked with steady accuracy', 'secured the main idea', 'is consolidating well'],
        steady: ['needed a short reminder', 'completed the core task', 'showed reliable progress', 'used the model successfully', 'is broadly on track'],
        improving: ['needed significant scaffolding', 'started to connect ideas', 'used feedback to revise', 'showed clearer independence', 'has improved noticeably'],
        fragile: ['found the starting point difficult', 'needed repeated checks', 'completed part of the task with support', 'showed a more secure attempt', 'is beginning to stabilise'],
        inconsistent: ['started well but lost focus', 'missed a key step', 'recovered with prompting', 'showed a stronger lesson', 'needs consistency across tasks'],
        struggling: ['needed close support', 'found the concept difficult', 'completed a reduced task', 'showed a small step forward', 'still needs guided practice'],
      }[profile.pattern] || [];
      const trendTextSv = subjectId === 'sloyd' ? sloydObservationText[profile.pattern]?.sv || [] : {
        high: ['arbetade s\u00e4kert', 'utvecklade uppgiften sj\u00e4lvst\u00e4ndigt', 'gjorde precisa kopplingar', 'st\u00f6ttade klasskamrater', '\u00e4r redo f\u00f6r st\u00f6rre utmaning'],
        secure: ['n\u00e5dde det f\u00f6rv\u00e4ntade fokuset', 'anv\u00e4nde feedback v\u00e4l', 'arbetade med stabil s\u00e4kerhet', 'bef\u00e4ste huvudid\u00e9n', 'bef\u00e4ster arbetet v\u00e4l'],
        steady: ['beh\u00f6vde en kort p\u00e5minnelse', 'genomf\u00f6rde k\u00e4rnuppgiften', 'visade tillf\u00f6rlitlig progression', 'anv\u00e4nde modellen framg\u00e5ngsrikt', '\u00e4r i stort sett p\u00e5 r\u00e4tt v\u00e4g'],
        improving: ['beh\u00f6vde tydlig st\u00f6ttning', 'b\u00f6rjade koppla ihop id\u00e9er', 'anv\u00e4nde feedback f\u00f6r att bearbeta', 'visade tydligare sj\u00e4lvst\u00e4ndighet', 'har utvecklats tydligt'],
        fragile: ['hade sv\u00e5rt att komma ig\u00e5ng', 'beh\u00f6vde upprepade avst\u00e4mningar', 'genomf\u00f6rde delar av uppgiften med st\u00f6d', 'visade ett s\u00e4krare f\u00f6rs\u00f6k', 'b\u00f6rjar stabiliseras'],
        inconsistent: ['startade bra men tappade fokus', 'missade ett viktigt steg', '\u00e5terh\u00e4mtade sig med st\u00f6d', 'visade en starkare lektion', 'beh\u00f6ver j\u00e4mnhet mellan uppgifter'],
        struggling: ['beh\u00f6vde n\u00e4ra st\u00f6d', 'hade sv\u00e5rt med begreppet', 'genomf\u00f6rde en avgr\u00e4nsad uppgift', 'visade ett litet steg fram\u00e5t', 'beh\u00f6ver fortsatt guidad \u00f6vning'],
      }[profile.pattern] || [];

      return {
        id: `${subjectId}-8a-evidence-${student.id}-${evidenceIndex + 1}`,
        type: 'observation',
        studentId: student.id,
        date,
        teachingUnitId: unit.id,
        skillId: skill.id,
        levelId,
        note: localized(
          `${student.firstName} ${trendText[evidenceIndex]} in ${resolveLocalizedValue(unit.title, 'en').toLowerCase()} (${resolveLocalizedValue(skill.title, 'en').toLowerCase()}).`,
          `${student.firstName} ${trendTextSv[evidenceIndex]} i ${resolveLocalizedValue(unit.title, 'sv').toLowerCase()} (${resolveLocalizedValue(skill.title, 'sv').toLowerCase()}).`,
        ),
      };
    });
  });
  const assessments = assessmentDates.map((date, assessmentIndex) => {
    const unit = curriculum.teachingUnits[assessmentIndex % curriculum.teachingUnits.length] || firstUnit;

    return {
      id: `${subjectId}-8a-assessment-${assessmentIndex + 1}`,
      type: 'assessment',
      title: localized(
        `${resolveLocalizedValue(unit.title, 'en')} checkpoint ${assessmentIndex + 1}`,
        `Kontroll ${assessmentIndex + 1} i ${resolveLocalizedValue(unit.title, 'sv')}`,
      ),
      date,
      teachingUnitId: unit.id,
      max: 20,
      pass: 10,
      results: students.map((student) => {
        const profile = studentProfiles[student.id] || studentProfiles['william-dahl'];
        const score = profile.assessmentScores[assessmentIndex] || 12;

        return {
          studentId: student.id,
          score,
          percentage: Math.round((score / 20) * 100),
          passed: score >= 10,
          absent: false,
          warning: score < 10,
        };
      }),
    };
  });
  const learningObservations = students.flatMap((student, studentIndex) => {
    const profile = studentProfiles[student.id] || studentProfiles['william-dahl'];

    return evidenceDates.map((date, observationIndex) => {
      const choice = profile.learningPattern[observationIndex] || '0';

      return {
        id: `${subjectId}-8a-learning-${student.id}-${observationIndex + 1}`,
        studentId: student.id,
        date,
        focus: choice,
        participation: profile.pattern === 'high' || profile.pattern === 'secure' ? '+' : choice,
        independence: profile.pattern === 'struggling' || profile.pattern === 'fragile' ? (observationIndex >= 3 ? '0' : '-') : choice,
        comment: localized(
          `${student.firstName}: ${profile.pattern.replace(/-/g, ' ')} learning pattern across the spring term.`,
          `${student.firstName}: ${profile.pattern.replace(/-/g, ' ')} l\u00e4rm\u00f6nster under v\u00e5rterminen.`,
        ),
      };
    });
  });

  return {
    items: [
      ...observations,
      ...assessments,
    ],
    learningObservations,
  };
}

function buildPlanning(subjectId, curriculum) {
  return {
    periods: [
      { id: 'jan-2026', label: localized('January', 'Januari'), startDate: '2026-01-08', endDate: '2026-01-31', order: 1 },
      { id: 'feb-2026', label: localized('February', 'Februari'), startDate: '2026-02-01', endDate: '2026-02-28', order: 2 },
      { id: 'mar-2026', label: localized('March', 'Mars'), startDate: '2026-03-01', endDate: '2026-03-31', order: 3 },
      { id: 'apr-2026', label: localized('April', 'April'), startDate: '2026-04-01', endDate: '2026-04-30', order: 4 },
      { id: 'may-2026', label: localized('May', 'Maj'), startDate: '2026-05-01', endDate: '2026-05-31', order: 5 },
      { id: 'june-2026', label: localized('June', 'Juni'), startDate: '2026-06-01', endDate: '2026-06-19', order: 6 },
    ],
    blocks: [
      ['jan-2026', '2026-01-12', '2026-01-30', 0, 'completed'],
      ['feb-2026', '2026-02-02', '2026-02-27', 1, 'completed'],
      ['mar-2026', '2026-03-02', '2026-03-27', 2, 'completed'],
      ['apr-2026', '2026-04-07', '2026-04-30', 0, 'completed'],
      ['may-2026', '2026-05-04', '2026-05-22', 1, 'current'],
      ['june-2026', '2026-06-01', '2026-06-12', 2, 'planned'],
    ].map(([periodId, startDate, endDate, unitIndex, status], index) => {
      const unit = curriculum.teachingUnits[unitIndex % curriculum.teachingUnits.length];

      return {
        id: `${subjectId}-8a-${unit.id}-${index + 1}`,
        subjectId,
        classId: '8a',
        title: unit.title,
        description: localized(
          `Build evidence for ${resolveLocalizedValue(unit.title, 'en').toLowerCase()}.`,
          `Bygg underlag f\u00f6r ${resolveLocalizedValue(unit.title, 'sv').toLowerCase()}.`,
        ),
        teachingUnitId: unit.id,
        sourceTemplateId: unit.id,
        periodId,
        startDate,
        endDate,
        status,
        curriculumAreaIds: [unit.curriculumAreaId],
        evidenceTopicIds: [unit.id],
        abilityIds: unit.skillIds || [],
        blockType: index === 2 ? 'assessment' : 'teaching',
        assessmentAnchor: null,
        quickCaptureOptions: (unit.skillIds || []).slice(0, 2).map((skillId) => {
          const skill = curriculum.skills.find((item) => item.id === skillId);
          return { id: skillId, label: skill?.title || localized(skillId, skillId) };
        }),
        groupAdaptations: [],
        notes: null,
        createdAt: '2026-01-08',
        updatedAt: status === 'current' ? '2026-05-18' : endDate,
        createdBy: 'teacher',
      };
    }),
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
  const subjectTitle = getSubjectTitle(subjectId);
  const curriculum = buildCurriculum(subjectId);
  const lessons = buildLessonSequence(subjectId, schedule, curriculum);
  const evidence = buildEvidence(subjectId, curriculum);

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
