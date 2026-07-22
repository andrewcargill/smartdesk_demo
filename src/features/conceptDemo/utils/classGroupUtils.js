export function getActiveGroups(groups) {
  return (groups || []).filter((group) => group?.status !== 'archived');
}

export function getGroupsByType(groups, typeId) {
  return getActiveGroups(groups).filter((group) => group.typeId === typeId);
}

export function getGroupsForStudent(groups, studentId) {
  return getActiveGroups(groups).filter((group) => (group.studentIds || []).includes(studentId));
}

export function getGroupedStudentIds(groups) {
  return new Set(getActiveGroups(groups).flatMap((group) => group.studentIds || []));
}

export function getUngroupedStudents(students, groups) {
  const groupedStudentIds = getGroupedStudentIds(groups);
  return (students || []).filter((student) => !groupedStudentIds.has(student.id));
}

export function getStudentsForGroup(group, students) {
  const studentIds = new Set(group?.studentIds || []);
  return (students || []).filter((student) => studentIds.has(student.id));
}

export function getGroupStudentCount(group) {
  return group?.studentIds?.length || 0;
}
