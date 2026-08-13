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
      { id: 'elias-check-1', date: '2026-01-15', status: 'positive', comment: 'School is ok at the moment. It feels better than before the break.' },
      { id: 'elias-check-2', date: '2026-01-29', status: 'positive', comment: 'I have had a good couple of weeks. Nothing feels too stressful right now.' },
      { id: 'elias-check-3', date: '2026-02-12', status: 'neutral', comment: 'School is fine, but I feel tired by the end of the day.' },
      { id: 'elias-check-4', date: '2026-02-26', status: 'neutral', comment: 'Some lessons are ok and some are harder. I am just trying to keep up.' },
      { id: 'elias-check-5', date: '2026-03-12', status: 'negative', comment: 'There are too many tests coming up. It feels like a lot.' },
      { id: 'elias-check-6', date: '2026-03-26', status: 'neutral', comment: 'School is not bad, but I am tired and want a quieter week.' },
      { id: 'elias-check-7', date: '2026-04-09', status: 'positive', comment: 'This week has been better. I feel more caught up.' },
      { id: 'elias-check-8', date: '2026-04-23', status: 'positive', comment: 'I am feeling ok about school. It helps when lessons are not too rushed.' },
      { id: 'elias-check-9', date: '2026-05-07', status: 'neutral', comment: 'I am waiting for summer now. I can still work, but I feel tired.' },
      { id: 'elias-check-10', date: '2026-05-14', status: 'negative', comment: 'I feel done with school this week. There is too much to think about.' },
    ],
    subjectStatuses: { english: 'green', mathematics: 'orange', swedish: 'green', 'physical-education': 'green', music: 'orange' },
    subjectCheckIns: {
      english: [
        { id: 'elias-english-subject-check-1', date: '2026-02-12', status: 'neutral', comment: 'English is ok, but I find it hard to keep up when there is lots of writing.' },
        { id: 'elias-english-subject-check-2', date: '2026-03-26', status: 'positive', comment: 'All ok. I enjoyed the lesson more than usual today.' },
        { id: 'elias-english-subject-check-3', date: '2026-05-07', status: 'positive', comment: 'I think I am doing alright in English. I am aiming for a C.' },
      ],
      mathematics: [
        { id: 'elias-math-subject-check-1', date: '2026-02-26', status: 'neutral', comment: 'Maths is sometimes hard to keep up with, especially when it moves fast.' },
        { id: 'elias-math-subject-check-2', date: '2026-04-09', status: 'positive', comment: 'Today was ok. I understood more than I thought I would.' },
        { id: 'elias-math-subject-check-3', date: '2026-05-14', status: 'negative', comment: 'I do not like this topic. It feels confusing and I get behind quickly.' },
      ],
      swedish: [
        { id: 'elias-swedish-subject-check-1', date: '2026-01-29', status: 'positive', comment: 'I enjoy this lesson most weeks. It feels calmer than some others.' },
        { id: 'elias-swedish-subject-check-2', date: '2026-03-12', status: 'neutral', comment: 'It is ok, but I do not always know what to write at first.' },
        { id: 'elias-swedish-subject-check-3', date: '2026-04-23', status: 'positive', comment: 'All ok. I feel like I am keeping up in Swedish.' },
      ],
      'physical-education': [
        { id: 'elias-pe-subject-check-1', date: '2026-02-12', status: 'positive', comment: 'PE is good. I like lessons where we are moving around.' },
        { id: 'elias-pe-subject-check-2', date: '2026-03-26', status: 'positive', comment: 'I enjoyed this lesson. It was easy to get involved.' },
        { id: 'elias-pe-subject-check-3', date: '2026-05-07', status: 'neutral', comment: 'It was ok, but I did not really feel like joining in today.' },
      ],
      music: [
        { id: 'elias-music-subject-check-1', date: '2026-02-26', status: 'neutral', comment: 'Music is ok, but I do not like performing in front of people.' },
        { id: 'elias-music-subject-check-2', date: '2026-04-23', status: 'positive', comment: 'I enjoyed this lesson because we could practise in pairs.' },
        { id: 'elias-music-subject-check-3', date: '2026-05-14', status: 'neutral', comment: 'I am aiming to pass this unit, but I am not that confident yet.' },
      ],
    },
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
    subjectCheckIns: {},
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
    subjectCheckIns: {},
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
    subjectCheckIns: {},
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
  subjectCheckIns: {},
  teachingInfo: [],
  followUps: [],
};
