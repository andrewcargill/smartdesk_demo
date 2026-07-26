export const LEARNING_MODULE_EVIDENCE_STORAGE_EVENT = 'smartdesk-learning-module-evidence-change';
export const LEARNING_MODULE_LEARNING_OBSERVATIONS_STORAGE_EVENT = 'smartdesk-learning-module-learning-observations-change';

const evidenceStorageVersion = 1;
const learningObservationStorageVersion = 1;

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function createLocalId(prefix) {
  const randomId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  return `${prefix}-${randomId}`;
}

function getTimestamp(date) {
  return date ? `${date}T12:00:00.000` : new Date().toISOString();
}

function normaliseText(value, maxLength = 100) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function warnStorageIssue(scope, message, error) {
  if (typeof console !== 'undefined') {
    console.warn(`[${scope}] ${message}`, error || '');
  }
}

export function getLearningModuleEvidenceStorageKey(moduleId) {
  return `smartdesk_demo_${moduleId || 'learning-module'}_evidence`;
}

export function getLearningModuleLearningObservationsStorageKey(moduleId) {
  return `smartdesk_demo_${moduleId || 'learning-module'}_learning_observations`;
}

function emptyEvidencePayload() {
  return {
    version: evidenceStorageVersion,
    observations: [],
  };
}

function emptyLearningObservationPayload() {
  return {
    version: learningObservationStorageVersion,
    observations: [],
  };
}

export function normalizeLearningModuleObservation(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const id = normaliseText(item.id, 140);
  const studentId = normaliseText(item.studentId, 80);
  const date = normaliseText(item.date, 20);
  const teachingUnitId = normaliseText(item.teachingUnitId, 80);
  const skillId = normaliseText(item.skillId || item.capturePointId, 80);
  const evidenceTopicId = normaliseText(item.evidenceTopicId || item.topicId || `${teachingUnitId}-observations`, 100);
  const levelId = normaliseText(item.levelId, 80);

  if (!id || !studentId || !date || !teachingUnitId || !skillId || !levelId) {
    return null;
  }

  const timestamp = item.updatedAt || item.createdAt || item.capturedAt || getTimestamp(date);

  return {
    id,
    type: 'observation',
    studentId,
    date,
    teachingUnitId,
    evidenceTopicId,
    skillId,
    capturePointId: skillId,
    levelId,
    source: item.source || 'teacher',
    observationText: normaliseText(item.observationText || item.note || 'Quick capture from Now.', 180),
    createdAt: item.createdAt || timestamp,
    updatedAt: timestamp,
  };
}

function normalizeObservationList(observations) {
  const observationsById = new Map();

  (Array.isArray(observations) ? observations : []).forEach((item) => {
    const observation = normalizeLearningModuleObservation(item);
    if (observation) {
      observationsById.set(observation.id, observation);
    }
  });

  return [...observationsById.values()].sort((first, second) => (
    (second.updatedAt || second.createdAt || second.date).localeCompare(first.updatedAt || first.createdAt || first.date)
  ));
}

export function normalizeLearningModuleEvidencePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return emptyEvidencePayload();
  }

  return {
    version: evidenceStorageVersion,
    observations: normalizeObservationList(payload.observations),
  };
}

export function readLearningModuleEvidence(moduleId) {
  if (!canUseLocalStorage()) {
    return emptyEvidencePayload();
  }

  try {
    const value = window.localStorage.getItem(getLearningModuleEvidenceStorageKey(moduleId));
    return value ? normalizeLearningModuleEvidencePayload(JSON.parse(value)) : emptyEvidencePayload();
  } catch (error) {
    warnStorageIssue('Learning module evidence storage', 'Could not read local evidence.', error);
    return emptyEvidencePayload();
  }
}

export function writeLearningModuleEvidence(moduleId, payload) {
  const safePayload = normalizeLearningModuleEvidencePayload(payload);

  if (!canUseLocalStorage()) {
    return { payload: safePayload, persisted: false };
  }

  try {
    if (safePayload.observations.length) {
      window.localStorage.setItem(getLearningModuleEvidenceStorageKey(moduleId), JSON.stringify(safePayload));
    } else {
      window.localStorage.removeItem(getLearningModuleEvidenceStorageKey(moduleId));
    }
    window.dispatchEvent(new CustomEvent(LEARNING_MODULE_EVIDENCE_STORAGE_EVENT, { detail: { moduleId } }));
    return { payload: safePayload, persisted: true };
  } catch (error) {
    warnStorageIssue('Learning module evidence storage', 'Could not write local evidence.', error);
    return { payload: safePayload, persisted: false };
  }
}

export function addLearningModuleObservation(moduleId, payload, observationInput) {
  const currentPayload = normalizeLearningModuleEvidencePayload(payload);
  const timestamp = new Date().toISOString();
  const observation = normalizeLearningModuleObservation({
    id: createLocalId('local-observation'),
    source: 'teacher',
    observationText: 'Quick capture from Now.',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...observationInput,
  });

  if (!observation) {
    return { payload: currentPayload, observation: null, persisted: false };
  }

  const result = writeLearningModuleEvidence(moduleId, {
    ...currentPayload,
    observations: [observation, ...currentPayload.observations],
  });

  return { ...result, observation };
}

export function updateLearningModuleObservation(moduleId, payload, id, changes) {
  const currentPayload = normalizeLearningModuleEvidencePayload(payload);
  let updatedObservation = null;
  const observations = currentPayload.observations.map((observation) => {
    if (observation.id !== id) {
      return observation;
    }

    updatedObservation = normalizeLearningModuleObservation({
      ...observation,
      ...changes,
      id: observation.id,
      studentId: observation.studentId,
      date: observation.date,
      teachingUnitId: observation.teachingUnitId,
      evidenceTopicId: observation.evidenceTopicId,
      skillId: observation.skillId,
      createdAt: observation.createdAt,
      updatedAt: new Date().toISOString(),
    });

    return updatedObservation || observation;
  });

  if (!updatedObservation) {
    return { payload: currentPayload, observation: null, persisted: false };
  }

  const result = writeLearningModuleEvidence(moduleId, {
    ...currentPayload,
    observations,
  });

  return { ...result, observation: updatedObservation };
}

export function removeLearningModuleObservation(moduleId, payload, id) {
  const currentPayload = normalizeLearningModuleEvidencePayload(payload);
  const observations = currentPayload.observations.filter((observation) => observation.id !== id);
  const result = writeLearningModuleEvidence(moduleId, {
    ...currentPayload,
    observations,
  });

  return { ...result, removed: observations.length !== currentPayload.observations.length };
}

function normalizeLearningChoiceId(value) {
  if (value === '+' || value === 'plus') return '+';
  if (value === '-' || value === 'minus') return '-';
  if (value === '0' || value === 'neutral') return '0';
  return '';
}

export function normalizeLearningModuleLearningObservation(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const id = normaliseText(item.id, 140);
  const studentId = normaliseText(item.studentId, 80);
  const date = normaliseText(item.date, 20);
  const areaId = normaliseText(item.areaId, 80);
  const choiceId = normalizeLearningChoiceId(item.choiceId);
  const note = normaliseText(item.note || item.comment, 100);

  if (!id || !studentId || !date || !areaId || (!choiceId && !note)) {
    return null;
  }

  const timestamp = item.updatedAt || item.createdAt || getTimestamp(date);

  return {
    id,
    studentId,
    date,
    areaId,
    choiceId,
    note,
    source: item.source || 'teacher',
    createdAt: item.createdAt || timestamp,
    updatedAt: timestamp,
  };
}

function normalizeLearningObservationList(observations) {
  const observationsById = new Map();

  (Array.isArray(observations) ? observations : []).forEach((item) => {
    const observation = normalizeLearningModuleLearningObservation(item);
    if (observation) {
      observationsById.set(observation.id, observation);
    }
  });

  return [...observationsById.values()].sort((first, second) => (
    (second.updatedAt || second.createdAt || second.date).localeCompare(first.updatedAt || first.createdAt || first.date)
  ));
}

export function normalizeLearningModuleLearningObservationPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return emptyLearningObservationPayload();
  }

  return {
    version: learningObservationStorageVersion,
    observations: normalizeLearningObservationList(payload.observations),
  };
}

export function readLearningModuleLearningObservations(moduleId) {
  if (!canUseLocalStorage()) {
    return emptyLearningObservationPayload();
  }

  try {
    const value = window.localStorage.getItem(getLearningModuleLearningObservationsStorageKey(moduleId));
    return value ? normalizeLearningModuleLearningObservationPayload(JSON.parse(value)) : emptyLearningObservationPayload();
  } catch (error) {
    warnStorageIssue('Learning module learning observations', 'Could not read local learning observations.', error);
    return emptyLearningObservationPayload();
  }
}

export function writeLearningModuleLearningObservations(moduleId, payload) {
  const safePayload = normalizeLearningModuleLearningObservationPayload(payload);

  if (!canUseLocalStorage()) {
    return { payload: safePayload, persisted: false };
  }

  try {
    if (safePayload.observations.length) {
      window.localStorage.setItem(getLearningModuleLearningObservationsStorageKey(moduleId), JSON.stringify(safePayload));
    } else {
      window.localStorage.removeItem(getLearningModuleLearningObservationsStorageKey(moduleId));
    }
    window.dispatchEvent(new CustomEvent(LEARNING_MODULE_LEARNING_OBSERVATIONS_STORAGE_EVENT, { detail: { moduleId } }));
    return { payload: safePayload, persisted: true };
  } catch (error) {
    warnStorageIssue('Learning module learning observations', 'Could not write local learning observations.', error);
    return { payload: safePayload, persisted: false };
  }
}

export function addLearningModuleLearningObservation(moduleId, payload, observationInput) {
  const currentPayload = normalizeLearningModuleLearningObservationPayload(payload);
  const timestamp = new Date().toISOString();
  const observation = normalizeLearningModuleLearningObservation({
    id: createLocalId('local-learning-observation'),
    source: 'teacher',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...observationInput,
  });

  if (!observation) {
    return { payload: currentPayload, observation: null, persisted: false };
  }

  const result = writeLearningModuleLearningObservations(moduleId, {
    ...currentPayload,
    observations: [observation, ...currentPayload.observations],
  });

  return { ...result, observation };
}

export function updateLearningModuleLearningObservation(moduleId, payload, id, changes) {
  const currentPayload = normalizeLearningModuleLearningObservationPayload(payload);
  let updatedObservation = null;
  const observations = currentPayload.observations.map((observation) => {
    if (observation.id !== id) {
      return observation;
    }

    updatedObservation = normalizeLearningModuleLearningObservation({
      ...observation,
      ...changes,
      id: observation.id,
      studentId: observation.studentId,
      date: observation.date,
      areaId: observation.areaId,
      createdAt: observation.createdAt,
      updatedAt: new Date().toISOString(),
    });

    return updatedObservation || observation;
  });

  if (!updatedObservation) {
    return { payload: currentPayload, observation: null, persisted: false };
  }

  const result = writeLearningModuleLearningObservations(moduleId, {
    ...currentPayload,
    observations,
  });

  return { ...result, observation: updatedObservation };
}

export function flattenLearningObservationRecords(baseObservations) {
  return (Array.isArray(baseObservations) ? baseObservations : []).flatMap((observation) => {
    if (observation?.areaId) {
      return [normalizeLearningModuleLearningObservation(observation)].filter(Boolean);
    }

    return ['focus', 'participation', 'independence'].map((areaId) => normalizeLearningModuleLearningObservation({
      id: `${observation.id || `${observation.studentId}-${observation.date}`}-${areaId}`,
      studentId: observation.studentId,
      date: observation.date,
      areaId,
      choiceId: observation[areaId],
      note: observation.comment || observation.note || '',
      source: observation.source || 'teacher',
    })).filter(Boolean);
  });
}

export function groupLearningObservationRecords(records) {
  const groupedByStudentDate = new Map();

  normalizeLearningObservationList(records).forEach((record) => {
    const key = `${record.studentId}:${record.date}:${record.source || 'teacher'}`;
    const current = groupedByStudentDate.get(key) || {
      id: key,
      studentId: record.studentId,
      date: record.date,
      focus: '',
      participation: '',
      independence: '',
      comment: '',
      source: record.source || 'teacher',
    };

    current[record.areaId] = record.choiceId;
    current.comment = [current.comment, record.note].filter(Boolean).join(' · ');
    groupedByStudentDate.set(key, current);
  });

  return [...groupedByStudentDate.values()].sort((first, second) => (
    (second.date || '').localeCompare(first.date || '')
  ));
}
