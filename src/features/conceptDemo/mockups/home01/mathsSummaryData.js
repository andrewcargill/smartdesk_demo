// Fictional, self-contained presentation data. Never used for real assessment.
export const mathsSummary = {
  className: '8A',
  subject: 'Maths',
  students: 26,
  passed: 23,
  module: { materialId: 'favorit-matematik-8', chapterId: 'algebra', title: 'Algebra & equations', lesson: 6, lessons: 10, next: 'Equations with brackets' },
  scores: [61, 66, 69, 73],
  highlights: [
    { name: 'Amira', note: 'Explaining her reasoning more clearly.' },
    { name: 'Leo', note: 'Up 18 points on the last check-in.' },
    { name: 'Elsa', note: 'Ready for a little more challenge.' },
    { name: 'Noah', note: 'More confident working independently.' },
  ],
  followUps: [
    { name: 'Maja Lind', status: 'Not yet passed', score: 42, note: 'Revisit two-step equations.' },
    { name: 'Oscar Berg', status: 'Not yet passed', score: 46, note: 'Practise checking a solution.' },
    { name: 'Alva Nilsson', status: 'Absent', score: null, note: 'Arrange a catch-up opportunity.' },
  ],
};

export function isMathsSummaryRequest(text) {
  return /\b8\s*a\b/i.test(text) && /\bmath(?:s|ematics)?\b/i.test(text);
}

export function getMockReportRequest(text) {
  // Explicit planning intent takes priority over student/class context.
  if (/\bplanning\b/i.test(text)) return 'planning';
  // A named student takes priority over a class mentioned in the same request.
  if (/\bamira\b/i.test(text)) return 'amira';
  return isMathsSummaryRequest(text) ? 'class' : null;
}
