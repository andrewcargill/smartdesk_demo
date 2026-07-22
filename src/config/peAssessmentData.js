// Mock PE assessment templates live here so activities can be swapped quickly.
// In a real system this would likely come from curriculum settings or teacher-created templates.
export const activityTemplates = {
  Swimming: ['Water confidence', 'Technique', 'Breathing control', 'Distance completed', 'Safety awareness'],
  Volleyball: ['Serving', 'Passing', 'Movement', 'Team communication', 'Rule understanding'],
  Football: ['Ball control', 'Passing', 'Positioning', 'Teamwork', 'Decision making'],
  Athletics: ['Effort', 'Technique', 'Speed / endurance', 'Measurement result', 'Personal improvement'],
  Dance: ['Rhythm', 'Coordination', 'Creativity', 'Group participation', 'Performance confidence'],
};

export const students = [
  { id: 'maya', name: 'Maya Johnson', group: 'Year 8A' },
  { id: 'alex', name: 'Alex Turner', group: 'Year 8A' },
  { id: 'samira', name: 'Samira Ali', group: 'Year 8A' },
  { id: 'leo', name: 'Leo Martin', group: 'Year 8A' },
  { id: 'ella', name: 'Ella Wilson', group: 'Year 8A' },
  { id: 'noah', name: 'Noah Brown', group: 'Year 8A' },
];

export const levels = ['Emerging', 'Developing', 'Secure', 'Advanced'];

export const evidenceTags = ['Observed', 'Practiced', 'Needs support', 'Strong evidence'];

export const quickNotes = [
  'Confident today',
  'Needs another observation',
  'Improved from last lesson',
  'Good peer support',
  'Technique needs focus',
];

export const termAreas = ['Movement skills', 'Team games', 'Fitness', 'Technique', 'Safety', 'Reflection'];

export const passThreshold = 65;

// Mock term overview data shows the grading evidence layer teachers would use after several lessons.
// Scores are intentionally separate from one-off lesson observations: the real app could calculate
// these from collected evidence, teacher judgement, curriculum standards, and term weighting.
export const termProgress = {
  maya: {
    'Movement skills': 78,
    'Team games': 82,
    Fitness: 68,
    Technique: 71,
    Safety: 76,
    Reflection: 64,
  },
  alex: {
    'Movement skills': 58,
    'Team games': 62,
    Fitness: 67,
    Technique: 54,
    Safety: 70,
    Reflection: 59,
  },
  samira: {
    'Movement skills': 84,
    'Team games': 88,
    Fitness: 74,
    Technique: 80,
    Safety: 78,
    Reflection: 72,
  },
  leo: {
    'Movement skills': 52,
    'Team games': 57,
    Fitness: 61,
    Technique: 55,
    Safety: 63,
    Reflection: 50,
  },
  ella: {
    'Movement skills': 70,
    'Team games': 73,
    Fitness: 69,
    Technique: 66,
    Safety: 81,
    Reflection: 75,
  },
  noah: {
    'Movement skills': 64,
    'Team games': 66,
    Fitness: 72,
    Technique: 60,
    Safety: 68,
    Reflection: 62,
  },
};

export const activityProgressByStudent = {
  maya: {
    Swimming: {
      'Water confidence': 82,
      Technique: 70,
      'Breathing control': 68,
      'Distance completed': 74,
      'Safety awareness': 78,
    },
    Volleyball: { Serving: 72, Passing: 84, Movement: 76, 'Team communication': 86, 'Rule understanding': 80 },
    Football: { 'Ball control': 69, Passing: 75, Positioning: 72, Teamwork: 82, 'Decision making': 70 },
    Athletics: { Effort: 80, Technique: 68, 'Speed / endurance': 66, 'Measurement result': 64, 'Personal improvement': 78 },
    Dance: { Rhythm: 66, Coordination: 70, Creativity: 72, 'Group participation': 82, 'Performance confidence': 68 },
  },
  alex: {
    Swimming: {
      'Water confidence': 62,
      Technique: 52,
      'Breathing control': 55,
      'Distance completed': 66,
      'Safety awareness': 70,
    },
    Volleyball: { Serving: 58, Passing: 63, Movement: 61, 'Team communication': 65, 'Rule understanding': 68 },
    Football: { 'Ball control': 57, Passing: 60, Positioning: 54, Teamwork: 66, 'Decision making': 56 },
    Athletics: { Effort: 72, Technique: 58, 'Speed / endurance': 67, 'Measurement result': 64, 'Personal improvement': 69 },
    Dance: { Rhythm: 59, Coordination: 55, Creativity: 62, 'Group participation': 66, 'Performance confidence': 57 },
  },
  samira: {
    Swimming: {
      'Water confidence': 84,
      Technique: 80,
      'Breathing control': 76,
      'Distance completed': 78,
      'Safety awareness': 82,
    },
    Volleyball: { Serving: 82, Passing: 88, Movement: 84, 'Team communication': 90, 'Rule understanding': 86 },
    Football: { 'Ball control': 80, Passing: 84, Positioning: 82, Teamwork: 92, 'Decision making': 86 },
    Athletics: { Effort: 86, Technique: 78, 'Speed / endurance': 74, 'Measurement result': 72, 'Personal improvement': 84 },
    Dance: { Rhythm: 76, Coordination: 80, Creativity: 84, 'Group participation': 86, 'Performance confidence': 78 },
  },
  leo: {
    Swimming: {
      'Water confidence': 55,
      Technique: 50,
      'Breathing control': 52,
      'Distance completed': 58,
      'Safety awareness': 63,
    },
    Volleyball: { Serving: 54, Passing: 57, Movement: 56, 'Team communication': 60, 'Rule understanding': 62 },
    Football: { 'Ball control': 50, Passing: 55, Positioning: 52, Teamwork: 59, 'Decision making': 51 },
    Athletics: { Effort: 68, Technique: 55, 'Speed / endurance': 61, 'Measurement result': 57, 'Personal improvement': 63 },
    Dance: { Rhythm: 52, Coordination: 50, Creativity: 56, 'Group participation': 58, 'Performance confidence': 48 },
  },
  ella: {
    Swimming: {
      'Water confidence': 78,
      Technique: 66,
      'Breathing control': 69,
      'Distance completed': 72,
      'Safety awareness': 84,
    },
    Volleyball: { Serving: 70, Passing: 76, Movement: 74, 'Team communication': 78, 'Rule understanding': 80 },
    Football: { 'Ball control': 68, Passing: 72, Positioning: 66, Teamwork: 78, 'Decision making': 70 },
    Athletics: { Effort: 82, Technique: 66, 'Speed / endurance': 69, 'Measurement result': 70, 'Personal improvement': 76 },
    Dance: { Rhythm: 72, Coordination: 74, Creativity: 78, 'Group participation': 80, 'Performance confidence': 76 },
  },
  noah: {
    Swimming: {
      'Water confidence': 68,
      Technique: 60,
      'Breathing control': 62,
      'Distance completed': 70,
      'Safety awareness': 72,
    },
    Volleyball: { Serving: 64, Passing: 68, Movement: 66, 'Team communication': 70, 'Rule understanding': 66 },
    Football: { 'Ball control': 60, Passing: 66, Positioning: 62, Teamwork: 69, 'Decision making': 61 },
    Athletics: { Effort: 76, Technique: 62, 'Speed / endurance': 72, 'Measurement result': 68, 'Personal improvement': 74 },
    Dance: { Rhythm: 62, Coordination: 60, Creativity: 66, 'Group participation': 68, 'Performance confidence': 59 },
  },
};

export function createMockProgressReport(student, termScores, activityScores) {
  const allActivities = Object.entries(activityScores);
  const activityAverages = allActivities.map(([activity, scores]) => {
    const values = Object.values(scores);
    const average = Math.round(values.reduce((sum, score) => sum + score, 0) / values.length);

    return { activity, average };
  });

  const strongestActivity = activityAverages.reduce((best, current) =>
    current.average > best.average ? current : best
  );
  const supportActivity = activityAverages.reduce((lowest, current) =>
    current.average < lowest.average ? current : lowest
  );

  const strongestTermArea = Object.entries(termScores).reduce((best, current) =>
    current[1] > best[1] ? current : best
  );
  const supportTermArea = Object.entries(termScores).reduce((lowest, current) =>
    current[1] < lowest[1] ? current : lowest
  );

  return {
    title: `${student.name} PE Progress Summary`,
    audience: 'Student / parent feedback draft',
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    summary: `${student.name} is currently showing strongest evidence in ${strongestTermArea[0].toLowerCase()}, with particularly positive progress in ${strongestActivity.activity}. The main area to keep developing is ${supportTermArea[0].toLowerCase()}, especially through focused work in ${supportActivity.activity}.`,
    strengths: [
      `Strongest curriculum area: ${strongestTermArea[0]} (${strongestTermArea[1]})`,
      `Most secure activity evidence: ${strongestActivity.activity} (${strongestActivity.average})`,
      'Evidence suggests consistent participation across several activity areas.',
    ],
    nextSteps: [
      `Target ${supportTermArea[0].toLowerCase()} with one clear practice goal next lesson.`,
      `Collect another observation in ${supportActivity.activity} to confirm progress.`,
      'Ask the student to reflect on what helped them improve and what they want to focus on next.',
    ],
    teacherNote:
      'This is a mocked AI-style draft. In a real system the teacher would review, edit, and approve before sharing.',
  };
}

// Mock assessment records demonstrate how evidence can accumulate across lessons.
export const initialObservations = [
  {
    id: 1,
    studentId: 'maya',
    studentName: 'Maya Johnson',
    activity: 'Volleyball',
    skill: 'Passing',
    level: 'Secure',
    note: 'Improved from last lesson',
    tag: 'Strong evidence',
    timestamp: '09:18',
  },
  {
    id: 2,
    studentId: 'alex',
    studentName: 'Alex Turner',
    activity: 'Swimming',
    skill: 'Breathing control',
    level: 'Developing',
    note: 'Technique needs focus',
    tag: 'Needs support',
    timestamp: '09:24',
  },
  {
    id: 3,
    studentId: 'samira',
    studentName: 'Samira Ali',
    activity: 'Football',
    skill: 'Teamwork',
    level: 'Advanced',
    note: 'Good peer support',
    tag: 'Strong evidence',
    timestamp: '09:31',
  },
];

export const progressByStudent = {
  maya: [
    { area: 'Technique', level: 74 },
    { area: 'Team communication', level: 82 },
    { area: 'Safety awareness', level: 68 },
    { area: 'Personal improvement', level: 78 },
  ],
  alex: [
    { area: 'Technique', level: 56 },
    { area: 'Team communication', level: 62 },
    { area: 'Safety awareness', level: 70 },
    { area: 'Personal improvement', level: 64 },
  ],
  samira: [
    { area: 'Technique', level: 80 },
    { area: 'Team communication', level: 88 },
    { area: 'Safety awareness', level: 76 },
    { area: 'Personal improvement', level: 84 },
  ],
  leo: [
    { area: 'Technique', level: 52 },
    { area: 'Team communication', level: 58 },
    { area: 'Safety awareness', level: 66 },
    { area: 'Personal improvement', level: 60 },
  ],
  ella: [
    { area: 'Technique', level: 68 },
    { area: 'Team communication', level: 72 },
    { area: 'Safety awareness', level: 80 },
    { area: 'Personal improvement', level: 75 },
  ],
  noah: [
    { area: 'Technique', level: 61 },
    { area: 'Team communication', level: 65 },
    { area: 'Safety awareness', level: 63 },
    { area: 'Personal improvement', level: 70 },
  ],
};
