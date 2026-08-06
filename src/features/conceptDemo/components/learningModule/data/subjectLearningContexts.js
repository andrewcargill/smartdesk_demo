import { mathsLearningContexts } from './mathsLearningContexts.js';
import { musicLearningContexts } from './musicLearningContexts.js';
import { physicalEducationLearningContexts } from './physicalEducationLearningContexts.js';

export const learningContextsBySubjectId = {
  mathematics: mathsLearningContexts,
  'physical-education': physicalEducationLearningContexts,
  music: musicLearningContexts,
};

export function getLearningContextsForSubject(subjectId) {
  return learningContextsBySubjectId[subjectId] || [];
}
