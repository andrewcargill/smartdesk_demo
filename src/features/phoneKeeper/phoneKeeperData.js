export const schoolDate = 'Onsdag 12 augusti';

export const staffMembers = ['Anna Jones', 'Mikael Sand', 'Sara Lind'];

export const classes = ['7A', '7B', '8A', '8B', '9A', '9B'];

const namesByClass = {
  '7A': ['Alva Nyberg', 'Benjamin Berg', 'Clara Dahl', 'David Eriksson', 'Elsa Forsberg', 'Filip Lund', 'Greta Holm', 'Hugo Pettersson'],
  '7B': ['Adam Berg', 'Bianca Wallin', 'Casper Ek', 'Dina Saleh', 'Ebbe Lindgren', 'Fatima Noor', 'Gabriel Sjolin', 'Hanna Vik'],
  '8A': ['Alice Andersson', 'Elias Nilsson', 'Freya Wilson', 'Leo Martin', 'Maja Holm', 'Noah Brown', 'Omar Hassan', 'Sara Holm'],
  '8B': ['Amir Khalil', 'Astrid Falk', 'Elin Bergstrom', 'Iris Lundqvist', 'Joel Mattsson', 'Klara Sund', 'Liam Strand', 'Nora Ekman'],
  '9A': ['Amina Yusuf', 'Anton Blom', 'Ebba Nordin', 'Isak Dahl', 'Jasmin Ali', 'Linus Ek', 'Mira Jonsson', 'Theo Wall'],
  '9B': ['Agnes Soder', 'Charlie Eng', 'Emil Holm', 'Ida Karlsson', 'Leo Nilsson', 'Malte Wik', 'Selma Berg', 'Vera Lind'],
};

export const students = classes.flatMap((classId) => namesByClass[classId].map((name, index) => {
  const [firstName, ...lastNameParts] = name.split(' ');
  const suffix = String(index + 1).padStart(3, '0');
  return {
    id: `${classId.toLowerCase()}-${suffix}`,
    firstName,
    lastName: lastNameParts.join(' '),
    name,
    classId,
    hasException: ['Elsa Forsberg', 'Hanna Vik', 'Maja Holm', 'Joel Mattsson', 'Jasmin Ali', 'Vera Lind'].includes(name),
  };
}));

const statusSeeds = {
  '7A': ['collected', 'collected', 'no_phone', 'missing', 'exception', 'collected', 'collected', 'collected'],
  '7B': ['incident', 'collected', 'collected', 'no_phone', 'collected', 'collected', 'exception', 'collected'],
  '8A': ['collected', 'incident', 'collected', 'missing', 'exception', 'collected', 'collected', 'no_phone'],
  '8B': ['collected', 'collected', 'missing', 'collected', 'exception', 'collected', 'no_phone', 'collected'],
  '9A': ['exception', 'collected', 'collected', 'collected', 'incident', 'missing', 'collected', 'collected'],
  '9B': ['collected', 'collected', 'collected', 'no_phone', 'incident', 'collected', 'collected', 'exception'],
};

const collectedTimes = ['07:48', '07:50', '07:51', '07:53', '07:54', '07:56', '07:58', '08:01'];

export const initialDailyStatus = students.map((student, index) => {
  const classIndex = classes.indexOf(student.classId);
  const slot = String((classIndex * 8) + (index % 8) + 1).padStart(2, '0');
  const status = statusSeeds[student.classId][index % 8];
  const hasPhoneInStorage = ['collected', 'incident'].includes(status);

  return {
    studentId: student.id,
    date: '2026-08-12',
    status,
    collectedAt: hasPhoneInStorage ? collectedTimes[index % collectedTimes.length] : null,
    collectedBy: hasPhoneInStorage ? staffMembers[index % staffMembers.length] : null,
    storage: hasPhoneInStorage ? { cabinet: String.fromCharCode(65 + classIndex), slot } : null,
    returnedAt: ['7a-001', '7b-002', '8a-003', '8b-001', '9a-004', '9b-002'].includes(student.id) ? '15:04' : null,
    returnedBy: ['7a-001', '7b-002', '8a-003', '8b-001', '9a-004', '9b-002'].includes(student.id) ? 'Sara Lind' : null,
  };
});

export const initialIncidents = [
  {
    id: 'incident-101',
    studentId: '8a-002',
    date: '2026-08-12',
    time: '10:42',
    type: 'phone_use',
    location: 'Matematik',
    reportedBy: 'Anna Jones',
    action: 'phone_collected',
    note: 'Telefon inlämnad efter kort samtal.',
  },
  {
    id: 'incident-102',
    studentId: '9b-005',
    date: '2026-08-12',
    time: '11:18',
    type: 'has_phone',
    location: 'Rast',
    reportedBy: 'Mikael Sand',
    action: 'mentor_informed',
    note: '',
  },
  {
    id: 'incident-103',
    studentId: '7b-001',
    date: '2026-08-12',
    time: '12:06',
    type: 'refuses',
    location: 'Korridor',
    reportedBy: 'Sara Lind',
    action: 'guardian_contacted',
    note: 'Mentor tar upp vid eftermiddagens avstämning.',
  },
  {
    id: 'incident-104',
    studentId: '9a-005',
    date: '2026-08-12',
    time: '13:25',
    type: 'phone_use',
    location: 'Matsal',
    reportedBy: 'Anna Jones',
    action: 'phone_collected',
    note: '',
  },
];

export const historyByStudent = {
  '8a-002': [
    { date: '12 aug', label: 'Telefon använd 10:42', tone: 'incident' },
    { date: '11 aug', label: 'Normal dag', tone: 'ok' },
    { date: '10 aug', label: 'Normal dag', tone: 'ok' },
    { date: '9 aug', label: 'Telefon ej inlämnad', tone: 'missing' },
    { date: '8 aug', label: 'Telefon upptäckt på rast', tone: 'incident' },
    { date: '7 aug', label: 'Normal dag', tone: 'ok' },
  ],
  '9b-005': [
    { date: '12 aug', label: 'Telefon upptäckt på rast', tone: 'incident' },
    { date: '11 aug', label: 'Telefon använd på lektion', tone: 'incident' },
    { date: '10 aug', label: 'Normal dag', tone: 'ok' },
    { date: '9 aug', label: 'Vägrade lämna in', tone: 'incident' },
    { date: '8 aug', label: 'Normal dag', tone: 'ok' },
  ],
  '7b-001': [
    { date: '12 aug', label: 'Vägrade lämna in', tone: 'incident' },
    { date: '11 aug', label: 'Telefon ej inlämnad', tone: 'missing' },
    { date: '10 aug', label: 'Telefon använd på rast', tone: 'incident' },
    { date: '9 aug', label: 'Normal dag', tone: 'ok' },
    { date: '8 aug', label: 'Normal dag', tone: 'ok' },
  ],
};

export const repeatIncidentStudents = [
  { studentId: '9b-005', incidents: 6, window: '20 skoldagar', action: 'Mentor informerad' },
  { studentId: '8a-002', incidents: 4, window: '20 skoldagar', action: 'Uppföljning planerad' },
  { studentId: '7b-001', incidents: 3, window: '20 skoldagar', action: 'Vårdnadshavare kontaktad' },
];

export const incidentTypeLabels = {
  has_phone: 'Har telefon',
  phone_use: 'Använder telefon',
  refuses: 'Vägrar lämna in',
};

export const actionLabels = {
  phone_collected: 'Telefon inlämnad',
  mentor_informed: 'Mentor informerad',
  guardian_contacted: 'Vårdnadshavare kontaktad',
  follow_up: 'Uppföljning planerad',
  other: 'Annan åtgärd',
};
