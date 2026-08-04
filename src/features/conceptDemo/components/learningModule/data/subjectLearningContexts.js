import { musicLearningContexts } from './musicLearningContexts.js';
import { physicalEducationLearningContexts } from './physicalEducationLearningContexts.js';

export const learningContextsBySubjectId = {
  'physical-education': physicalEducationLearningContexts,
  music: musicLearningContexts,
};

export function getLearningContextsForSubject(subjectId) {
  return learningContextsBySubjectId[subjectId] || [];
}
