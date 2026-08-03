import {
  LEARNING_MODULE_EVIDENCE_STORAGE_EVENT,
  LEARNING_MODULE_LEARNING_OBSERVATIONS_STORAGE_EVENT,
  getLearningModuleEvidenceStorageKey,
  getLearningModuleLearningObservationsStorageKey,
} from './learningModuleEvidenceStorage.js';
import {
  LEARNING_MODULE_ASSESSMENT_RESULTS_STORAGE_EVENT,
  getLearningModuleAssessmentResultsStorageKey,
} from './assessmentResultsStorage.js';

export function getLearningModuleLessonIndexStorageKey(moduleId) {
  return `smartdesk_demo_${moduleId || 'learning-module'}_lesson_index`;
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function clampLearningModuleLessonIndex(index, lessonCount) {
  const maxLessonIndex = Math.max(0, Number(lessonCount || 0) - 1);
  const numericIndex = Number(index);

  if (!Number.isInteger(numericIndex)) {
    return 0;
  }

  return Math.max(0, Math.min(maxLessonIndex, numericIndex));
}

export function readLearningModuleLessonIndex(moduleId, lessonCount) {
  if (!canUseLocalStorage()) {
    return 0;
  }

  try {
    const value = window.localStorage.getItem(getLearningModuleLessonIndexStorageKey(moduleId));
    return clampLearningModuleLessonIndex(value === null ? 0 : Number(value), lessonCount);
  } catch {
    return 0;
  }
}

export function writeLearningModuleLessonIndex(moduleId, index, lessonCount) {
  const safeIndex = clampLearningModuleLessonIndex(index, lessonCount);

  if (canUseLocalStorage()) {
    try {
      window.localStorage.setItem(getLearningModuleLessonIndexStorageKey(moduleId), String(safeIndex));
    } catch {
      return safeIndex;
    }
  }

  return safeIndex;
}

export function resetLearningModuleLessonIndex(moduleId) {
  if (canUseLocalStorage()) {
    try {
      window.localStorage.removeItem(getLearningModuleLessonIndexStorageKey(moduleId));
    } catch {
      return 0;
    }
  }

  return 0;
}

function removeStorageItem(key) {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Local storage is best-effort for this prototype.
  }
}

function dispatchModuleStorageEvent(eventName, moduleId) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName, { detail: { moduleId } }));
  }
}

export function resetLearningModuleDemoStorage({ moduleId, subjectId, classId }) {
  const safeModuleId = moduleId || 'learning-module';
  const safeSubjectId = subjectId || 'learning';
  const safeClassId = classId || safeModuleId;

  removeStorageItem(getLearningModuleLessonIndexStorageKey(safeModuleId));
  removeStorageItem(getLearningModuleEvidenceStorageKey(safeModuleId));
  removeStorageItem(getLearningModuleLearningObservationsStorageKey(safeModuleId));
  removeStorageItem(getLearningModuleAssessmentResultsStorageKey(safeModuleId));
  removeStorageItem(`smartdesk_demo_subject_planning_${safeSubjectId}_${safeClassId}`);
  removeStorageItem(`smartdesk_demo_planning_curriculum_notes_${safeSubjectId}_${safeClassId}`);
  removeStorageItem(`smartdesk_demo_working_groups_${safeSubjectId}_${safeClassId}`);
  removeStorageItem(`${safeModuleId}-row-notes`);
  removeStorageItem(`${safeModuleId}-cell-notes`);
  removeStorageItem(`${safeModuleId}-unit-notes`);

  dispatchModuleStorageEvent(LEARNING_MODULE_EVIDENCE_STORAGE_EVENT, safeModuleId);
  dispatchModuleStorageEvent(LEARNING_MODULE_LEARNING_OBSERVATIONS_STORAGE_EVENT, safeModuleId);
  dispatchModuleStorageEvent(LEARNING_MODULE_ASSESSMENT_RESULTS_STORAGE_EVENT, safeModuleId);
}
