import { normalizeMathsEvidenceItem } from './mathsCurriculum.js';

export const MATHS_7A_EVIDENCE_STORAGE_KEY = 'smartdesk_demo_maths7a_evidence';

const storageVersion = 2;

function emptyPayload() {
  return {
    version: storageVersion,
    observations: [],
    deletedSeededEvidenceIds: [],
  };
}

function warnStorageIssue(message, error) {
  if (typeof console !== 'undefined') {
    console.warn(`[Maths 7A evidence storage] ${message}`, error || '');
  }
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function getLocalDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createLocalObservationId() {
  const randomId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  return `local-observation-${randomId}`;
}

function normaliseDeletedIds(ids) {
  return Array.isArray(ids) ? [...new Set(ids.filter((id) => typeof id === 'string' && id.trim()))] : [];
}

function normaliseStorageObservation(item) {
  const normalised = normalizeMathsEvidenceItem(item);

  if (
    !normalised
    || normalised.type !== 'observation'
    || !normalised.id
    || !normalised.studentId
    || !normalised.date
    || !normalised.teachingUnitId
    || !normalised.evidenceTopicId
    || !normalised.capturePointId
    || !normalised.levelId
  ) {
    return null;
  }

  const timestamp = item.createdAt || item.capturedAt || (normalised.date ? `${normalised.date}T12:00:00.000` : new Date().toISOString());

  return {
    id: normalised.id,
    type: 'observation',
    studentId: normalised.studentId,
    date: normalised.date,
    teachingUnitId: normalised.teachingUnitId,
    evidenceTopicId: normalised.evidenceTopicId,
    capturePointId: normalised.capturePointId,
    levelId: normalised.levelId,
    source: normalised.source || 'observed',
    observationText: normalised.observationText || 'Quick capture from Now.',
    createdAt: timestamp,
    updatedAt: item.updatedAt || item.capturedAt || timestamp,
  };
}

function normaliseObservationList(observations) {
  const observationsById = new Map();

  (Array.isArray(observations) ? observations : []).forEach((item) => {
    const observation = normaliseStorageObservation(item);
    if (observation) {
      observationsById.set(observation.id, observation);
    }
  });

  return [...observationsById.values()].sort((first, second) => (
    (second.updatedAt || second.createdAt || second.date).localeCompare(first.updatedAt || first.createdAt || first.date)
  ));
}

export function normaliseMaths7ALocalEvidencePayload(payload) {
  if (Array.isArray(payload)) {
    return {
      version: 1,
      observations: normaliseObservationList(payload),
      deletedSeededEvidenceIds: [],
    };
  }

  if (!payload || typeof payload !== 'object') {
    return emptyPayload();
  }

  return {
    version: storageVersion,
    observations: normaliseObservationList(payload.observations),
    deletedSeededEvidenceIds: normaliseDeletedIds(payload.deletedSeededEvidenceIds),
  };
}

export function readMaths7ALocalEvidence() {
  if (!canUseLocalStorage()) {
    return emptyPayload();
  }

  try {
    const value = window.localStorage.getItem(MATHS_7A_EVIDENCE_STORAGE_KEY);
    if (!value) {
      return emptyPayload();
    }

    return normaliseMaths7ALocalEvidencePayload(JSON.parse(value));
  } catch (error) {
    warnStorageIssue('Could not read local evidence. Using an empty local evidence payload.', error);
    return emptyPayload();
  }
}

export function writeMaths7ALocalEvidence(payload) {
  const safePayload = normaliseMaths7ALocalEvidencePayload(payload);

  if (!canUseLocalStorage()) {
    return { payload: safePayload, persisted: false };
  }

  try {
    window.localStorage.setItem(MATHS_7A_EVIDENCE_STORAGE_KEY, JSON.stringify({
      version: storageVersion,
      observations: safePayload.observations,
      deletedSeededEvidenceIds: safePayload.deletedSeededEvidenceIds,
    }));

    return { payload: safePayload, persisted: true };
  } catch (error) {
    warnStorageIssue('Could not write local evidence. Keeping the change for this session only.', error);
    return { payload: safePayload, persisted: false };
  }
}

export function createMaths7ALocalObservation(input) {
  const timestamp = new Date().toISOString();

  return normaliseStorageObservation({
    id: createLocalObservationId(),
    type: 'observation',
    date: getLocalDateString(),
    source: 'observed',
    observationText: 'Quick capture from Now.',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  });
}

export function addMaths7ALocalObservation(payload, observationInput) {
  const currentPayload = normaliseMaths7ALocalEvidencePayload(payload);
  const observation = createMaths7ALocalObservation(observationInput);

  if (!observation) {
    return { payload: currentPayload, observation: null, persisted: false };
  }

  const result = writeMaths7ALocalEvidence({
    ...currentPayload,
    observations: [observation, ...currentPayload.observations],
  });

  return { ...result, observation };
}

export function updateMaths7ALocalObservation(payload, id, changes) {
  const currentPayload = normaliseMaths7ALocalEvidencePayload(payload);
  let updatedObservation = null;
  const observations = currentPayload.observations.map((observation) => {
    if (observation.id !== id) {
      return observation;
    }

    updatedObservation = normaliseStorageObservation({
      ...observation,
      ...changes,
      id: observation.id,
      studentId: observation.studentId,
      date: observation.date,
      teachingUnitId: observation.teachingUnitId,
      evidenceTopicId: observation.evidenceTopicId,
      capturePointId: observation.capturePointId,
      createdAt: observation.createdAt,
      updatedAt: new Date().toISOString(),
    });

    return updatedObservation || observation;
  });

  if (!updatedObservation) {
    return { payload: currentPayload, observation: null, persisted: false };
  }

  const result = writeMaths7ALocalEvidence({
    ...currentPayload,
    observations,
  });

  return { ...result, observation: updatedObservation };
}

export function removeMaths7ALocalObservation(payload, id) {
  const currentPayload = normaliseMaths7ALocalEvidencePayload(payload);
  const observations = currentPayload.observations.filter((observation) => observation.id !== id);
  const result = writeMaths7ALocalEvidence({
    ...currentPayload,
    observations,
  });

  return { ...result, removed: observations.length !== currentPayload.observations.length };
}

export function markMaths7ASeededEvidenceDeleted(payload, id) {
  const currentPayload = normaliseMaths7ALocalEvidencePayload(payload);
  const result = writeMaths7ALocalEvidence({
    ...currentPayload,
    deletedSeededEvidenceIds: [...new Set([...currentPayload.deletedSeededEvidenceIds, id])],
  });

  return result;
}

export function resetMaths7ALocalEvidence() {
  const payload = emptyPayload();

  if (!canUseLocalStorage()) {
    return { payload, persisted: false };
  }

  try {
    window.localStorage.removeItem(MATHS_7A_EVIDENCE_STORAGE_KEY);
    return { payload, persisted: true };
  } catch (error) {
    warnStorageIssue('Could not reset local evidence storage.', error);
    return { payload, persisted: false };
  }
}
