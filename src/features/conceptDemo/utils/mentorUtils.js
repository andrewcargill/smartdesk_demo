export const mentorStorageKey = 'smartdesk_demo_mentor_students';

export const workflowStatusLabels = {
  'no-current-follow-up': 'No current follow-up',
  'check-in-planned': 'Check-in planned',
  'follow-up-in-view': 'Follow-up in view',
  'waiting-for-response': 'Waiting for response',
  'discuss-with-team': 'Discuss with team',
  'documentation-in-prorenata': 'Documentation in Prorenata',
};

const workflowOrder = [
  'follow-up-in-view',
  'check-in-planned',
  'waiting-for-response',
  'discuss-with-team',
  'documentation-in-prorenata',
  'no-current-follow-up',
];

export function getMergedMentorStudents(baseStudents, storedOverrides = {}) {
  return baseStudents.map((student) => ({
    ...student,
    ...(storedOverrides[student.id] || {}),
  }));
}

export function getStudentById(students, studentId) {
  return students.find((student) => student.id === studentId) || students[0];
}

export function getMentorFollowUps(students) {
  return students.filter((student) => student.nextFollowUp);
}

export function sortStudentsByWorkflowState(students) {
  return [...students].sort((first, second) => {
    const firstOrder = workflowOrder.indexOf(first.workflowStatus);
    const secondOrder = workflowOrder.indexOf(second.workflowStatus);

    if (firstOrder === secondOrder) {
      return first.displayName.localeCompare(second.displayName);
    }

    return firstOrder - secondOrder;
  });
}

export function formatMentorDate(date) {
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
}

export function countActiveFollowUps(students) {
  return students.filter((student) => student.workflowStatus !== 'no-current-follow-up').length;
}
