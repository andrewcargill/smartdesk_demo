import { mathsAbilities, mathsEvidenceTopics } from './mathsCurriculum.js';

export const maths7AClassData = {
  id: 'maths-7a',
  classId: '7a',
  subjectId: 'mathematics',
  title: 'Mathematics 7A',
  shortTitle: '7A · Ma',
  currentTopicId: 'fractions',

  topics: mathsEvidenceTopics,

  assessmentDimensions: mathsAbilities,

  quickCaptureTemplates: [
    {
      id: 'clear-improvement',
      label: 'Clear improvement',
      category: 'progress',
    },
    {
      id: 'strong-explanation',
      label: 'Strong explanation',
      category: 'reasoning',
    },
    {
      id: 'needed-prompting',
      label: 'Needed prompting',
      category: 'support',
    },
    {
      id: 'written-question-difficult',
      label: 'Written question difficult',
      category: 'understanding',
    },
    {
      id: 'misconception-noticed',
      label: 'Misconception noticed',
      category: 'misconception',
    },
    {
      id: 'follow-up-later',
      label: 'Worth following up',
      category: 'follow-up',
    },
  ],

  assessmentTypes: [
    { id: 'test', label: 'Test' },
    { id: 'quiz', label: 'Quiz' },
    { id: 'exit-ticket', label: 'Exit ticket' },
    { id: 'assignment', label: 'Assignment' },
  ],

  classSignals: [
    {
      id: 'fractions-language-pattern',
      date: '2026-05-08',
      topicId: 'fractions',
      label: 'Equivalent-fraction language appeared repeatedly',
      note: 'Anna kept this after paired explanations surfaced similar wording across several groups.',
    },
    {
      id: 'percentages-visual-model',
      date: '2026-05-13',
      topicId: 'percentages',
      label: 'Visual models helped several students explain percentages',
      note: 'A bar model seemed to make verbal explanations easier to follow.',
    },
    {
      id: 'geometry-diagrams',
      date: '2026-05-16',
      topicId: 'geometry',
      label: 'Diagrams supported geometry strategy choices',
      note: 'Students who sketched first tended to explain their strategy more clearly.',
    },
  ],
};
