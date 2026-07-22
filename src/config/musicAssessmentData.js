export const musicActivityTemplates = {
  Singing: ['Pitch accuracy', 'Rhythm/timing', 'Tone/control', 'Confidence', 'Expression'],
  'Instrumental performance': ['Technique', 'Timing', 'Accuracy', 'Practice effort', 'Performance confidence'],
  'Ensemble/group work': ['Listening to others', 'Keeping in time', 'Contribution', 'Cooperation', 'Responsiveness'],
  Composition: ['Musical ideas', 'Structure', 'Use of rhythm/melody', 'Creativity', 'Development/refinement'],
  'Listening/appraisal': [
    'Identifies instruments/sounds',
    'Describes musical features',
    'Uses musical vocabulary',
    'Compares pieces',
    'Explains opinions with evidence',
  ],
  'Rhythm and notation': ['Reads rhythms', 'Keeps pulse', 'Notation understanding', 'Performs rhythm patterns', 'Accuracy'],
};

export const musicStudents = [
  { id: 'lina', name: 'Lina Andersson', group: 'Year 8B' },
  { id: 'max', name: 'Max Berg', group: 'Year 8B' },
  { id: 'amir', name: 'Amir Khan', group: 'Year 8B' },
  { id: 'ella', name: 'Ella Svensson', group: 'Year 8B' },
  { id: 'noah', name: 'Noah Patel', group: 'Year 8B' },
  { id: 'maya', name: 'Maya Johnson', group: 'Year 8B' },
];

export const musicLevels = ['Emerging', 'Developing', 'Secure', 'Advanced'];

export const musicEvidenceTags = ['Observed', 'Practiced', 'Needs support', 'Strong evidence'];

export const musicQuickNotes = [
  'Confident performance',
  'Needs another listen',
  'Improved timing',
  'Good group contribution',
  'Use vocabulary next time',
  'Practice rhythm pattern',
];

export const musicAreas = ['Performance', 'Composition', 'Listening', 'Rhythm', 'Ensemble skills', 'Reflection'];

export const musicTermProgress = {
  lina: { Performance: 62, Composition: 68, Listening: 58, Rhythm: 54, 'Ensemble skills': 70, Reflection: 60 },
  max: { Performance: 76, Composition: 72, Listening: 66, Rhythm: 74, 'Ensemble skills': 82, Reflection: 64 },
  amir: { Performance: 58, Composition: 60, Listening: 52, Rhythm: 56, 'Ensemble skills': 64, Reflection: 50 },
  ella: { Performance: 84, Composition: 80, Listening: 76, Rhythm: 78, 'Ensemble skills': 86, Reflection: 74 },
  noah: { Performance: 70, Composition: 66, Listening: 72, Rhythm: 68, 'Ensemble skills': 74, Reflection: 62 },
  maya: { Performance: 88, Composition: 84, Listening: 82, Rhythm: 80, 'Ensemble skills': 90, Reflection: 78 },
};

export const musicActivityProgressByStudent = {
  lina: {
    Singing: { 'Pitch accuracy': 58, 'Rhythm/timing': 62, 'Tone/control': 60, Confidence: 52, Expression: 64 },
    'Instrumental performance': { Technique: 60, Timing: 58, Accuracy: 62, 'Practice effort': 70, 'Performance confidence': 55 },
    'Ensemble/group work': { 'Listening to others': 70, 'Keeping in time': 60, Contribution: 66, Cooperation: 74, Responsiveness: 68 },
    Composition: { 'Musical ideas': 68, Structure: 62, 'Use of rhythm/melody': 64, Creativity: 72, 'Development/refinement': 58 },
    'Listening/appraisal': {
      'Identifies instruments/sounds': 60,
      'Describes musical features': 56,
      'Uses musical vocabulary': 52,
      'Compares pieces': 58,
      'Explains opinions with evidence': 54,
    },
    'Rhythm and notation': {
      'Reads rhythms': 52,
      'Keeps pulse': 58,
      'Notation understanding': 50,
      'Performs rhythm patterns': 56,
      Accuracy: 54,
    },
  },
  max: {
    Singing: { 'Pitch accuracy': 74, 'Rhythm/timing': 78, 'Tone/control': 72, Confidence: 68, Expression: 70 },
    'Instrumental performance': { Technique: 78, Timing: 76, Accuracy: 74, 'Practice effort': 82, 'Performance confidence': 70 },
    'Ensemble/group work': { 'Listening to others': 84, 'Keeping in time': 78, Contribution: 80, Cooperation: 86, Responsiveness: 82 },
    Composition: { 'Musical ideas': 72, Structure: 70, 'Use of rhythm/melody': 68, Creativity: 76, 'Development/refinement': 74 },
    'Listening/appraisal': {
      'Identifies instruments/sounds': 68,
      'Describes musical features': 64,
      'Uses musical vocabulary': 62,
      'Compares pieces': 66,
      'Explains opinions with evidence': 60,
    },
    'Rhythm and notation': {
      'Reads rhythms': 74,
      'Keeps pulse': 78,
      'Notation understanding': 70,
      'Performs rhythm patterns': 76,
      Accuracy: 72,
    },
  },
  amir: {
    Singing: { 'Pitch accuracy': 52, 'Rhythm/timing': 56, 'Tone/control': 50, Confidence: 48, Expression: 54 },
    'Instrumental performance': { Technique: 58, Timing: 54, Accuracy: 56, 'Practice effort': 66, 'Performance confidence': 50 },
    'Ensemble/group work': { 'Listening to others': 64, 'Keeping in time': 58, Contribution: 60, Cooperation: 68, Responsiveness: 62 },
    Composition: { 'Musical ideas': 62, Structure: 56, 'Use of rhythm/melody': 58, Creativity: 66, 'Development/refinement': 54 },
    'Listening/appraisal': {
      'Identifies instruments/sounds': 54,
      'Describes musical features': 50,
      'Uses musical vocabulary': 48,
      'Compares pieces': 52,
      'Explains opinions with evidence': 46,
    },
    'Rhythm and notation': {
      'Reads rhythms': 55,
      'Keeps pulse': 58,
      'Notation understanding': 52,
      'Performs rhythm patterns': 56,
      Accuracy: 54,
    },
  },
  ella: {
    Singing: { 'Pitch accuracy': 84, 'Rhythm/timing': 82, 'Tone/control': 86, Confidence: 80, Expression: 88 },
    'Instrumental performance': { Technique: 82, Timing: 80, Accuracy: 84, 'Practice effort': 88, 'Performance confidence': 82 },
    'Ensemble/group work': { 'Listening to others': 88, 'Keeping in time': 84, Contribution: 86, Cooperation: 90, Responsiveness: 88 },
    Composition: { 'Musical ideas': 84, Structure: 78, 'Use of rhythm/melody': 82, Creativity: 88, 'Development/refinement': 80 },
    'Listening/appraisal': {
      'Identifies instruments/sounds': 78,
      'Describes musical features': 76,
      'Uses musical vocabulary': 74,
      'Compares pieces': 78,
      'Explains opinions with evidence': 72,
    },
    'Rhythm and notation': {
      'Reads rhythms': 78,
      'Keeps pulse': 82,
      'Notation understanding': 76,
      'Performs rhythm patterns': 80,
      Accuracy: 78,
    },
  },
  noah: {
    Singing: { 'Pitch accuracy': 68, 'Rhythm/timing': 70, 'Tone/control': 66, Confidence: 62, Expression: 64 },
    'Instrumental performance': { Technique: 70, Timing: 68, Accuracy: 66, 'Practice effort': 74, 'Performance confidence': 64 },
    'Ensemble/group work': { 'Listening to others': 76, 'Keeping in time': 72, Contribution: 74, Cooperation: 78, Responsiveness: 76 },
    Composition: { 'Musical ideas': 66, Structure: 64, 'Use of rhythm/melody': 68, Creativity: 72, 'Development/refinement': 62 },
    'Listening/appraisal': {
      'Identifies instruments/sounds': 74,
      'Describes musical features': 70,
      'Uses musical vocabulary': 66,
      'Compares pieces': 72,
      'Explains opinions with evidence': 68,
    },
    'Rhythm and notation': {
      'Reads rhythms': 66,
      'Keeps pulse': 70,
      'Notation understanding': 64,
      'Performs rhythm patterns': 68,
      Accuracy: 66,
    },
  },
  maya: {
    Singing: { 'Pitch accuracy': 88, 'Rhythm/timing': 86, 'Tone/control': 84, Confidence: 88, Expression: 90 },
    'Instrumental performance': { Technique: 86, Timing: 84, Accuracy: 88, 'Practice effort': 90, 'Performance confidence': 86 },
    'Ensemble/group work': { 'Listening to others': 90, 'Keeping in time': 88, Contribution: 92, Cooperation: 90, Responsiveness: 88 },
    Composition: { 'Musical ideas': 86, Structure: 82, 'Use of rhythm/melody': 84, Creativity: 90, 'Development/refinement': 84 },
    'Listening/appraisal': {
      'Identifies instruments/sounds': 82,
      'Describes musical features': 80,
      'Uses musical vocabulary': 78,
      'Compares pieces': 84,
      'Explains opinions with evidence': 80,
    },
    'Rhythm and notation': {
      'Reads rhythms': 80,
      'Keeps pulse': 84,
      'Notation understanding': 78,
      'Performs rhythm patterns': 82,
      Accuracy: 80,
    },
  },
};

export const initialMusicObservations = [
  {
    id: 1,
    studentId: 'lina',
    studentName: 'Lina Andersson',
    activity: 'Singing',
    skill: 'Pitch accuracy',
    level: 'Developing',
    note: 'Improved timing',
    tag: 'Practiced',
    timestamp: '10:12',
  },
  {
    id: 2,
    studentId: 'ella',
    studentName: 'Ella Svensson',
    activity: 'Composition',
    skill: 'Creativity',
    level: 'Advanced',
    note: 'Confident performance',
    tag: 'Strong evidence',
    timestamp: '10:20',
  },
  {
    id: 3,
    studentId: 'amir',
    studentName: 'Amir Khan',
    activity: 'Listening/appraisal',
    skill: 'Uses musical vocabulary',
    level: 'Emerging',
    note: 'Use vocabulary next time',
    tag: 'Needs support',
    timestamp: '10:27',
  },
];
