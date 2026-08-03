import { annaSchedule } from './annaSchedule.js';
import { defaultConceptDemoLanguage, resolveLocalizedValue } from '../i18n/conceptDemoTranslations.js';
import {
  defaultSelectedSubjectIds,
  getSubjectDefinition,
  normalizeSelectedSubjectIds,
} from './subjectCatalogue.js';

const subjectRoleOrder = ['mathematics', 'english', 'physical-education'];

const localizedDayDefinitions = {
  en: [
    { id: 'monday', dayOfWeek: 1, label: 'Monday', shortLabel: 'Mon' },
    { id: 'tuesday', dayOfWeek: 2, label: 'Tuesday', shortLabel: 'Tue' },
    { id: 'wednesday', dayOfWeek: 3, label: 'Wednesday', shortLabel: 'Wed' },
    { id: 'thursday', dayOfWeek: 4, label: 'Thursday', shortLabel: 'Thu' },
    { id: 'friday', dayOfWeek: 5, label: 'Friday', shortLabel: 'Fri' },
  ],
  sv: [
    { id: 'monday', dayOfWeek: 1, label: 'M\u00e5ndag', shortLabel: 'M\u00e5n' },
    { id: 'tuesday', dayOfWeek: 2, label: 'Tisdag', shortLabel: 'Tis' },
    { id: 'wednesday', dayOfWeek: 3, label: 'Onsdag', shortLabel: 'Ons' },
    { id: 'thursday', dayOfWeek: 4, label: 'Torsdag', shortLabel: 'Tor' },
    { id: 'friday', dayOfWeek: 5, label: 'Fredag', shortLabel: 'Fre' },
  ],
};

const localizedCurrentContext = {
  en: {
    dateLabel: 'Monday 18 May',
  },
  sv: {
    dateLabel: 'M\u00e5ndag 18 maj',
  },
};

const localizedFixedEventText = {
  en: {
    mentorTime: 'Mentor time',
    weeklyCheckIn: 'Weekly check-in and study planning',
    breakFollowUp: 'Break / follow-up',
    break: 'Break',
    staffRoom: 'Staff room',
    planningTime: 'Planning time',
    planningSubject8A: 'Plan {{subject}} 8A and review evidence',
    planningAdministration: 'Planning and administration',
    planningDocumentation: 'Preparation and documentation',
    planningStudentFollowUp: 'Planning and student follow-up',
    prepareParentConversation: 'Prepare parent conversation and Wednesday lessons',
    followUpPreparation: 'Follow-up and preparation',
    reviewMonday: 'Review Monday observations',
    lunch: 'Lunch',
    workroom: 'Workroom',
    teamMeeting: 'Team meeting',
    meetingRoom: 'Meeting room',
    departmentPlanning: 'Department planning and preparation',
  },
  sv: {
    mentorTime: 'Mentorstid',
    weeklyCheckIn: 'Veckoavst\u00e4mning och studieplanering',
    breakFollowUp: 'Rast / uppf\u00f6ljning',
    break: 'Rast',
    staffRoom: 'Personalrum',
    planningTime: 'Planeringstid',
    planningSubject8A: 'Planera {{subject}} 8A och g\u00e5 igenom underlag',
    planningAdministration: 'Planering och administration',
    planningDocumentation: 'F\u00f6rberedelse och dokumentation',
    planningStudentFollowUp: 'Planering och elevuppf\u00f6ljning',
    prepareParentConversation: 'F\u00f6rbered v\u00e5rdnadshavarsamtal och onsdagens lektioner',
    followUpPreparation: 'Uppf\u00f6ljning och f\u00f6rberedelse',
    reviewMonday: 'G\u00e5 igenom m\u00e5ndagens observationer',
    lunch: 'Lunch',
    workroom: 'Arbetsrum',
    teamMeeting: 'Arbetslagsm\u00f6te',
    meetingRoom: 'M\u00f6tesrum',
    departmentPlanning: '\u00c4mnesplanering och f\u00f6rberedelse',
  },
};

const subjectTopicTemplates = {
  mathematics: {
    en: ['Fractions and percentages', 'Algebraic expressions', 'Functions and graphs', 'Percentage problem-solving'],
    sv: ['Br\u00e5k och procent', 'Algebraiska uttryck', 'Funktioner och grafer', 'Probleml\u00f6sning med procent'],
  },
  english: {
    en: ['Persuasive writing', 'Speaking and group discussion', 'Reading inference', 'Writing response'],
    sv: ['Argumenterande skrivande', 'Muntlig diskussion i grupp', 'L\u00e4sinferens', 'Skriftlig respons'],
  },
  'physical-education': {
    en: ['Movement and coordination', 'Training methods', 'Planning and evaluating training', 'Team strategy'],
    sv: ['R\u00f6relse och koordination', 'Tr\u00e4ningsmetoder', 'Planera och utv\u00e4rdera tr\u00e4ning', 'Lagstrategi'],
  },
  science: {
    en: ['Forces and motion', 'Energy transfer', 'Scientific investigation', 'Ecosystems'],
    sv: ['Krafter och r\u00f6relse', 'Energiomvandling', 'Naturvetenskaplig unders\u00f6kning', 'Ekosystem'],
  },
  swedish: {
    en: ['Reading strategies', 'Argument writing', 'Oral presentation', 'Text analysis'],
    sv: ['L\u00e4sstrategier', 'Argumenterande text', 'Muntlig presentation', 'Textanalys'],
  },
  history: {
    en: ['Source criticism', 'Industrialisation', 'Historical cause and consequence', 'Democracy development'],
    sv: ['K\u00e4llkritik', 'Industrialiseringen', 'Historiska orsaker och konsekvenser', 'Demokratins utveckling'],
  },
};

const fixedEventTextById = {
  'mon-mentor-7a': { title: 'mentorTime', topic: 'weeklyCheckIn' },
  'mon-break-followup': { title: 'breakFollowUp', topic: 'reviewMonday', location: 'staffRoom' },
  'mon-planning': { title: 'planningTime', topic: 'planningSubject8A', location: 'workroom' },
  'mon-lunch': { title: 'lunch' },
  'mon-followup-prep': { title: 'followUpPreparation', topic: 'reviewMonday', location: 'workroom' },
  'tue-break': { title: 'break', location: 'staffRoom' },
  'tue-lunch': { title: 'lunch' },
  'tue-planning-followup': { title: 'planningStudentFollowUp', topic: 'prepareParentConversation', location: 'workroom' },
  'wed-break': { title: 'break', location: 'staffRoom' },
  'wed-planning-admin': { title: 'planningAdministration', location: 'workroom' },
  'wed-lunch': { title: 'lunch' },
  'wed-student-followup': { title: 'followUpPreparation', location: 'workroom' },
  'thu-break': { title: 'break', location: 'staffRoom' },
  'thu-team-meeting': { title: 'teamMeeting', location: 'meetingRoom' },
  'thu-lunch': { title: 'lunch' },
  'thu-prep-docs': { title: 'planningDocumentation', location: 'workroom' },
  'fri-break': { title: 'break', location: 'staffRoom' },
  'fri-lunch': { title: 'lunch' },
  'fri-department-planning': { title: 'departmentPlanning', location: 'workroom' },
};

function getLanguageBucket(language) {
  return language === 'sv' ? 'sv' : defaultConceptDemoLanguage;
}

function getLocalizedFixedText(key, language) {
  return localizedFixedEventText[getLanguageBucket(language)]?.[key]
    || localizedFixedEventText.en[key]
    || '';
}

function interpolateText(value, values = {}) {
  return String(value || '').replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? '');
}

function getSubjectForRole(subjectRole, selectedSubjectIds) {
  const roleIndex = subjectRoleOrder.indexOf(subjectRole);
  return selectedSubjectIds[roleIndex] || selectedSubjectIds[0] || defaultSelectedSubjectIds[0];
}

function getLessonSubject(event, selectedSubjectIds, language) {
  const subjectId = getSubjectForRole(event.subjectId, selectedSubjectIds);
  const subjectDefinition = getSubjectDefinition(subjectId) || getSubjectDefinition(defaultSelectedSubjectIds[0]);
  const title = resolveLocalizedValue(subjectDefinition?.title, language, subjectId);
  const shortTitle = resolveLocalizedValue(subjectDefinition?.shortTitle, language, title);
  const code = resolveLocalizedValue(subjectDefinition?.code, language, shortTitle);

  return {
    subjectId,
    title,
    shortTitle,
    code,
  };
}

function getLessonTopic(subjectId, event, language) {
  const topics = subjectTopicTemplates[subjectId]?.[getLanguageBucket(language)]
    || subjectTopicTemplates[subjectId]?.en
    || [];

  if (!topics.length) {
    return event.topic || '';
  }

  const topicIndex = Math.abs(String(event.id || '').split('').reduce((total, character) => total + character.charCodeAt(0), 0)) % topics.length;
  return topics[topicIndex];
}

function localizeFixedEvent(event, selectedSubjectIds, language) {
  const textMapping = fixedEventTextById[event.id];

  if (!textMapping) {
    return event;
  }

  const planningSubject = getLessonSubject({ subjectId: 'english' }, selectedSubjectIds, language).title;

  return {
    ...event,
    title: textMapping.title ? getLocalizedFixedText(textMapping.title, language) : event.title,
    topic: textMapping.topic
      ? interpolateText(getLocalizedFixedText(textMapping.topic, language), { subject: planningSubject })
      : event.topic,
    location: textMapping.location ? getLocalizedFixedText(textMapping.location, language) : event.location,
  };
}

function localizeLessonEvent(event, selectedSubjectIds, language) {
  const lessonSubject = getLessonSubject(event, selectedSubjectIds, language);

  return {
    ...event,
    id: `${event.id}--${lessonSubject.subjectId}`,
    originalId: event.originalId || event.id,
    subjectRoleId: event.subjectId,
    title: lessonSubject.title,
    subject: lessonSubject.title,
    subjectTitle: lessonSubject.title,
    subjectShortTitle: lessonSubject.shortTitle,
    subjectCode: lessonSubject.code,
    subjectId: lessonSubject.subjectId,
    topic: getLessonTopic(lessonSubject.subjectId, event, language),
  };
}

export function buildDemoSchedule({
  selectedSubjectIds = defaultSelectedSubjectIds,
  language = defaultConceptDemoLanguage,
} = {}) {
  const safeSubjectIds = normalizeSelectedSubjectIds(selectedSubjectIds);
  const teacherSubjects = safeSubjectIds
    .map((subjectId) => getSubjectDefinition(subjectId))
    .filter(Boolean)
    .map((subject) => resolveLocalizedValue(subject.title, language, subject.id));

  return {
    ...annaSchedule,
    teacher: {
      ...annaSchedule.teacher,
      subjects: teacherSubjects,
    },
    currentContext: {
      ...annaSchedule.currentContext,
      ...(localizedCurrentContext[getLanguageBucket(language)] || localizedCurrentContext.en),
    },
    dayDefinitions: localizedDayDefinitions[getLanguageBucket(language)] || localizedDayDefinitions.en,
    scheduleEntries: annaSchedule.scheduleEntries.map((event) => (
      event.type === 'lesson'
        ? localizeLessonEvent(event, safeSubjectIds, language)
        : localizeFixedEvent(event, safeSubjectIds, language)
    )),
    selectedSubjectIds: safeSubjectIds,
  };
}
