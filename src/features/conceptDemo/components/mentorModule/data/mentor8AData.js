export const mentorSeed = {
  'elias-nilsson': {
    mentorStatus: 'green',
    supportStatus: 'orange',
    supportHistory: [
      { id: 'elias-support-1', status: 'orange', comment: 'Needs visible routines during independent work.', date: '2026-05-14' },
      { id: 'elias-support-2', status: 'green', comment: 'Settled well after mentor check-in.', date: '2026-04-16' },
    ],
    prorenata: { status: 'Ongoing', updated: '2026-05-14' },
    checkIns: [
      { id: 'elias-check-1', date: '2026-01-15', status: 'positive', comment: 'Settled return after winter break.' },
      { id: 'elias-check-2', date: '2026-01-29', status: 'positive', comment: 'Elias said the new desk routine helped him start faster.' },
      { id: 'elias-check-3', date: '2026-02-12', status: 'neutral', comment: 'Some reminders needed for transitions.' },
      { id: 'elias-check-4', date: '2026-02-26', status: 'neutral', comment: 'He felt okay in English but unsure before maths.' },
      { id: 'elias-check-5', date: '2026-03-12', status: 'negative', comment: 'Review routines next month.' },
      { id: 'elias-check-6', date: '2026-03-26', status: 'neutral', comment: 'Written prompts helped.' },
      { id: 'elias-check-7', date: '2026-04-09', status: 'positive', comment: 'Reported that short written steps made the lesson easier.' },
      { id: 'elias-check-8', date: '2026-04-23', status: 'positive', comment: 'Good response to movement break plan.' },
      { id: 'elias-check-9', date: '2026-05-07', status: 'neutral', comment: 'Asked for reminders before longer independent tasks.' },
      { id: 'elias-check-10', date: '2026-05-14', status: 'negative', comment: 'Follow up next week.' },
    ],
    subjectStatuses: { english: 'green', mathematics: 'orange', swedish: 'green', 'physical-education': 'green', music: 'orange' },
    teachingInfo: [
      { id: 'elias-teach-1', text: 'Written instructions recommended', updatedDate: '2026-05-14' },
      { id: 'elias-teach-2', text: 'Short movement breaks okay', updatedDate: '2026-05-14' },
      { id: 'elias-teach-3', text: 'Monitor during week 21', updatedDate: '2026-05-07' },
    ],
    followUps: [
      { id: 'elias-follow-1', date: '2026-05-21', label: 'Mentor meeting', completed: false },
      { id: 'elias-follow-2', date: '2026-05-24', label: 'Call home', completed: false },
    ],
  },
  'freya-wilson': {
    mentorStatus: 'orange',
    supportStatus: 'orange',
    supportHistory: [
      { id: 'freya-support-1', status: 'orange', comment: 'Check task-start confidence in practical lessons.', date: '2026-04-23' },
    ],
    prorenata: null,
    checkIns: [
      { id: 'freya-check-1', date: '2026-01-29', status: 'neutral', comment: '' },
      { id: 'freya-check-2', date: '2026-03-05', status: 'positive', comment: '' },
      { id: 'freya-check-3', date: '2026-04-23', status: 'neutral', comment: 'Agree light follow-up.' },
    ],
    subjectStatuses: { english: 'orange', mathematics: 'green', swedish: 'green', 'physical-education': 'green', music: 'green' },
    teachingInfo: [
      { id: 'freya-teach-1', text: 'Prefer written + verbal instructions', updatedDate: '2026-04-23' },
    ],
    followUps: [{ id: 'freya-follow-1', week: 'Week 21', label: 'General follow-up', completed: false }],
  },
  'omar-hassan': {
    mentorStatus: 'green',
    supportStatus: 'green',
    supportHistory: [
      { id: 'omar-support-1', status: 'green', comment: 'No additional support needed this month.', date: '2026-05-07' },
    ],
    prorenata: null,
    checkIns: [
      { id: 'omar-check-1', date: '2026-02-05', status: 'positive', comment: '' },
      { id: 'omar-check-2', date: '2026-04-09', status: 'positive', comment: '' },
      { id: 'omar-check-3', date: '2026-05-07', status: 'positive', comment: '' },
    ],
    subjectStatuses: { english: 'green', mathematics: 'green', swedish: 'green', 'physical-education': 'green', music: 'green' },
    teachingInfo: [{ id: 'omar-teach-1', text: 'Check understanding before independent work', updatedDate: '2026-05-07' }],
    followUps: [],
  },
  'noor-ahmed': {
    mentorStatus: 'red',
    supportStatus: 'orange',
    supportHistory: [
      { id: 'noor-support-1', status: 'orange', comment: 'Teaching team meeting planned; keep classroom routines consistent.', date: '2026-05-10' },
      { id: 'noor-support-2', status: 'red', comment: 'Escalated after repeated unsettled starts.', date: '2026-04-30' },
    ],
    prorenata: { status: 'Ongoing', updated: '2026-05-10' },
    checkIns: [
      { id: 'noor-check-1', date: '2026-01-18', status: 'neutral', comment: '' },
      { id: 'noor-check-2', date: '2026-02-26', status: 'negative', comment: '' },
      { id: 'noor-check-3', date: '2026-04-30', status: 'negative', comment: 'Team meeting planned.' },
    ],
    subjectStatuses: { english: 'orange', mathematics: 'orange', swedish: 'green', 'physical-education': 'green', music: 'green' },
    teachingInfo: [
      { id: 'noor-teach-1', text: 'Monitor participation over the next week', updatedDate: '2026-05-10' },
      { id: 'noor-teach-2', text: 'Seat near clear board sightline', updatedDate: '2026-05-10' },
    ],
    followUps: [{ id: 'noor-follow-1', date: '2026-05-22', label: 'Teaching team meeting', completed: false }],
  },
};

export const fallbackMentorPicture = {
  mentorStatus: 'green',
  supportStatus: 'green',
  supportHistory: [],
  prorenata: null,
  checkIns: [
    { id: 'check-1', date: '2026-02-12', status: 'neutral', comment: '' },
    { id: 'check-2', date: '2026-04-16', status: 'neutral', comment: '' },
  ],
  subjectStatuses: { english: 'green', mathematics: 'green', swedish: 'green', 'physical-education': 'green', music: 'green' },
  teachingInfo: [],
  followUps: [],
};
