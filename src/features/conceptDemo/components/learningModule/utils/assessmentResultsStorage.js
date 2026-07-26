export const LEARNING_MODULE_ASSESSMENT_RESULTS_STORAGE_EVENT = 'smartdesk-learning-module-assessment-results-change';

export function getLearningModuleAssessmentResultsStorageKey(moduleId) {
  return `smartdesk_demo_${moduleId || 'learning-module'}_assessment_results`;
}

function createId(prefix = 'assessment') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizePayload(payload) {
  return {
    assessments: Array.isArray(payload?.assessments) ? payload.assessments : [],
  };
}

export function readLearningModuleAssessmentResults(moduleId) {
  if (typeof window === 'undefined') {
    return { assessments: [] };
  }

  try {
    return normalizePayload(JSON.parse(window.localStorage.getItem(getLearningModuleAssessmentResultsStorageKey(moduleId)) || '{}'));
  } catch {
    return { assessments: [] };
  }
}

export function writeLearningModuleAssessmentResults(moduleId, payload) {
  const normalizedPayload = normalizePayload(payload);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(getLearningModuleAssessmentResultsStorageKey(moduleId), JSON.stringify(normalizedPayload));
    window.dispatchEvent(new CustomEvent(LEARNING_MODULE_ASSESSMENT_RESULTS_STORAGE_EVENT, {
      detail: { moduleId, payload: normalizedPayload },
    }));
  }

  return normalizedPayload;
}

export function upsertLearningModuleAssessmentResult(moduleId, assessmentInput) {
  const payload = readLearningModuleAssessmentResults(moduleId);
  const now = new Date().toISOString();
  const recordId = assessmentInput.id || createId(`${moduleId || 'learning-module'}-assessment`);
  const studentResults = Array.isArray(assessmentInput.studentResults) ? assessmentInput.studentResults : [];
  const record = {
    id: recordId,
    assessmentId: assessmentInput.assessmentId || 'enter-results',
    title: assessmentInput.title || 'Untitled assessment',
    date: assessmentInput.date || now.slice(0, 10),
    createdAt: assessmentInput.createdAt || now,
    updatedAt: now,
    teachingUnitId: assessmentInput.teachingUnitId || '',
    teachingUnitTitle: assessmentInput.teachingUnitTitle || '',
    resultMode: assessmentInput.resultMode || 'number',
    maxScore: assessmentInput.maxScore ?? null,
    passScore: assessmentInput.passScore ?? null,
    studentResults,
    results: studentResults.map((result) => ({
      studentId: result.studentId,
      score: result.actualValue,
      rawResult: result.rawResult,
      percentage: result.percentage,
      passed: result.absent ? false : !result.warning,
      absent: Boolean(result.absent),
      warning: Boolean(result.warning),
    })),
  };
  const nextAssessments = [
    record,
    ...payload.assessments.filter((assessment) => assessment.id !== recordId),
  ];
  const nextPayload = writeLearningModuleAssessmentResults(moduleId, { assessments: nextAssessments });

  return {
    persisted: true,
    payload: nextPayload,
    record,
  };
}
