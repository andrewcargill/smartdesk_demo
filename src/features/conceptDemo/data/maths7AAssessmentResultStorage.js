import { getTeachingUnitById } from './mathsCurriculum.js';

export const MATHS_7A_ASSESSMENT_RESULTS_STORAGE_KEY = 'smartdesk_demo_maths7a_assessment_results';
export const MATHS_7A_ASSESSMENT_RESULTS_STORAGE_EVENT = 'smartdesk-demo-maths7a-assessment-results-change';

const storageVersion = 1;

function emptyPayload() {
  return {
    version: storageVersion,
    assessments: [],
  };
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function warnStorageIssue(message, error) {
  if (typeof console !== 'undefined') {
    console.warn(`[Maths 7A assessment result storage] ${message}`, error || '');
  }
}

function notifyAssessmentResultsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MATHS_7A_ASSESSMENT_RESULTS_STORAGE_EVENT));
  }
}

function createAssessmentResultId() {
  const randomId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  return `local-assessment-result-${randomId}`;
}

function getLocalDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function normaliseStudentResult(result) {
  if (!result || typeof result !== 'object' || typeof result.studentId !== 'string') {
    return null;
  }

  const percentage = result.percentage === null || result.percentage === undefined || result.percentage === ''
    ? null
    : Number(result.percentage);
  const actualValue = result.actualValue === null || result.actualValue === undefined || result.actualValue === ''
    ? null
    : Number(result.actualValue);

  return {
    studentId: result.studentId,
    rawResult: typeof result.rawResult === 'string' ? result.rawResult : '',
    actualValue: Number.isFinite(actualValue) ? actualValue : null,
    percentage: Number.isFinite(percentage) ? percentage : null,
    absent: Boolean(result.absent),
    warning: Boolean(result.warning),
  };
}

function normaliseAssessmentRecord(record) {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const title = typeof record.title === 'string' ? record.title.trim() : '';
  const studentResults = (Array.isArray(record.studentResults) ? record.studentResults : [])
    .map(normaliseStudentResult)
    .filter(Boolean);

  if (!title || studentResults.length === 0) {
    return null;
  }

  const createdAt = typeof record.createdAt === 'string' && record.createdAt
    ? record.createdAt
    : new Date().toISOString();

  const maxScore = record.maxScore === null || record.maxScore === undefined || record.maxScore === ''
    ? null
    : Number(record.maxScore);
  const passScore = record.passScore === null || record.passScore === undefined || record.passScore === ''
    ? null
    : Number(record.passScore);

  return {
    id: typeof record.id === 'string' && record.id ? record.id : createAssessmentResultId(),
    source: record.source || 'assessment-results-dialog',
    assessmentId: typeof record.assessmentId === 'string' ? record.assessmentId : '',
    teachingUnitId: typeof record.teachingUnitId === 'string' ? record.teachingUnitId : '',
    teachingUnitTitle: typeof record.teachingUnitTitle === 'string' ? record.teachingUnitTitle : '',
    title,
    date: typeof record.date === 'string' && record.date ? record.date : getLocalDateString(),
    createdAt,
    resultMode: record.resultMode === 'letter' ? 'letter' : 'number',
    maxScore: Number.isFinite(maxScore) ? maxScore : null,
    passScore: Number.isFinite(passScore) ? passScore : null,
    studentResults,
  };
}

export function normaliseMaths7AAssessmentResultsPayload(payload) {
  if (Array.isArray(payload)) {
    return {
      version: storageVersion,
      assessments: payload.map(normaliseAssessmentRecord).filter(Boolean),
    };
  }

  if (!payload || typeof payload !== 'object') {
    return emptyPayload();
  }

  return {
    version: storageVersion,
    assessments: (Array.isArray(payload.assessments) ? payload.assessments : [])
      .map(normaliseAssessmentRecord)
      .filter(Boolean)
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
  };
}

export function readMaths7AAssessmentResults() {
  if (!canUseLocalStorage()) {
    return emptyPayload();
  }

  try {
    const value = window.localStorage.getItem(MATHS_7A_ASSESSMENT_RESULTS_STORAGE_KEY);
    return value ? normaliseMaths7AAssessmentResultsPayload(JSON.parse(value)) : emptyPayload();
  } catch (error) {
    warnStorageIssue('Could not read local assessment results. Using an empty payload.', error);
    return emptyPayload();
  }
}

export function writeMaths7AAssessmentResults(payload) {
  const safePayload = normaliseMaths7AAssessmentResultsPayload(payload);

  if (!canUseLocalStorage()) {
    return { payload: safePayload, persisted: false };
  }

  try {
    window.localStorage.setItem(MATHS_7A_ASSESSMENT_RESULTS_STORAGE_KEY, JSON.stringify(safePayload));
    notifyAssessmentResultsChanged();
    return { payload: safePayload, persisted: true };
  } catch (error) {
    warnStorageIssue('Could not write local assessment results. Keeping the change for this session only.', error);
    return { payload: safePayload, persisted: false };
  }
}

export function resetMaths7AAssessmentResults() {
  if (canUseLocalStorage()) {
    try {
      window.localStorage.removeItem(MATHS_7A_ASSESSMENT_RESULTS_STORAGE_KEY);
      notifyAssessmentResultsChanged();
    } catch (error) {
      warnStorageIssue('Could not clear local assessment results.', error);
    }
  }

  return emptyPayload();
}

export function getMaths7AAssessmentResultsAsEvidence(payload, { visibleDate } = {}) {
  const safePayload = normaliseMaths7AAssessmentResultsPayload(payload);

  return safePayload.assessments.flatMap((assessment) => {
    const effectiveDate = visibleDate && assessment.date > visibleDate ? visibleDate : assessment.date;
    const teachingUnit = getTeachingUnitById(assessment.teachingUnitId);
    const evidenceTopicId = teachingUnit?.evidenceTopicIds?.[0] || '';

    return assessment.studentResults
      .filter((result) => result.absent || Number.isFinite(Number(result.percentage)))
      .map((result) => ({
        id: `${assessment.id}:${result.studentId}`,
        assessmentResultId: assessment.id,
        type: 'assessment',
        studentId: result.studentId,
        date: effectiveDate,
        teachingUnitId: assessment.teachingUnitId,
        evidenceTopicId,
        assessmentTitle: assessment.title,
        label: assessment.title,
        percentage: result.absent ? 0 : Number(result.percentage),
        value: result.absent ? 0 : Number(result.percentage),
        valueType: 'percentage',
        rawResult: result.rawResult,
        actualValue: result.actualValue,
        maxScore: assessment.maxScore,
        passScore: assessment.passScore,
        absent: Boolean(result.absent),
        warning: Boolean(result.warning),
        source: assessment.source || 'assessment-results-dialog',
      }));
  });
}

export function addMaths7AAssessmentResult(recordInput) {
  const currentPayload = readMaths7AAssessmentResults();
  const record = normaliseAssessmentRecord({
    ...recordInput,
    id: recordInput?.id || createAssessmentResultId(),
    date: recordInput?.date || getLocalDateString(),
    createdAt: recordInput?.createdAt || new Date().toISOString(),
  });

  if (!record) {
    return { payload: currentPayload, record: null, persisted: false };
  }

  const result = writeMaths7AAssessmentResults({
    version: storageVersion,
    assessments: [record, ...currentPayload.assessments],
  });

  return {
    ...result,
    record,
  };
}

export function upsertMaths7AAssessmentResult(recordInput) {
  const currentPayload = readMaths7AAssessmentResults();
  const existingRecord = currentPayload.assessments.find((item) => item.id === recordInput?.id);
  const record = normaliseAssessmentRecord({
    ...recordInput,
    id: recordInput?.id || createAssessmentResultId(),
    date: recordInput?.date || existingRecord?.date || getLocalDateString(),
    createdAt: recordInput?.createdAt || existingRecord?.createdAt || new Date().toISOString(),
  });

  if (!record) {
    return { payload: currentPayload, record: null, persisted: false };
  }

  const remainingAssessments = currentPayload.assessments.filter((item) => item.id !== record.id);
  const result = writeMaths7AAssessmentResults({
    version: storageVersion,
    assessments: [record, ...remainingAssessments],
  });

  return {
    ...result,
    record,
  };
}
