export const annaReminders = [
  {
    id: 'task-speak-oskar',
    type: 'reminder',
    source: 'smartdesk',
    date: '2026-05-18',
    title: 'Speak privately with Oskar',
    note: '',
    preferredWindowEventId: 'mon-break-followup',
    status: 'open',
    createdBy: 'teacher',
    studentId: 'oskar-p',
    classId: '7a',
    moduleId: 'mentor',
    linkedContexts: [
      {
        moduleId: 'mentor',
        classId: '7a',
        studentId: 'oskar-p',
      },
    ],
  },
  {
    id: 'task-english-writing',
    type: 'reminder',
    source: 'smartdesk',
    date: '2026-05-19',
    title: 'Prepare a short written task for English 8B',
    note: '',
    status: 'open',
    createdBy: 'teacher',
    classId: '8b',
    moduleId: 'english',
    linkedContexts: [
      {
        moduleId: 'english',
        classId: '8b',
      },
    ],
  },
];
