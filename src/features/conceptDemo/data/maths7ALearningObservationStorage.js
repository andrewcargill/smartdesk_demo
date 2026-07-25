import {
  maths7ALearningObservationAreas,
  maths7ALearningObservationChoices,
} from './maths7ALearningObservations.js';

export const MATHS_7A_LEARNING_OBSERVATIONS_STORAGE_KEY = 'smartdesk_demo_maths7a_learning_observations';

const storageVersion = 1;
const areaIds = new Set(maths7ALearningObservationAreas.map((area) => area.id));
const choiceIds = new Set(maths7ALearningObservationChoices.map((choice) => choice.id));

function emptyPayload() {
  return {
    version: storageVersion,
    observations: [],
  };
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function warnStorageIssue(message, error) {
  if (typeof console !== 'undefined') {
    console.warn(`[Maths 7A learning observations] ${message}`, error || '');
  }
}

function createLocalLearningObservationId() {
  const randomId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  return `local-learning-observation-${randomId}`;
}

function normaliseNote(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 100);
}

export function normaliseMaths7ALearningObservation(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const id = typeof item.id === 'string' ? item.id.trim() : '';
  const studentId = typeof item.studentId === 'string' ? item.studentId.trim() : '';
  const date = typeof item.date === 'string' ? item.date.trim() : '';
  const areaId = typeof item.areaId === 'string' ? item.areaId.trim() : '';
  const choiceId = typeof item.choiceId === 'string' ? item.choiceId.trim() : '';
  const note = normaliseNote(item.note);

  if (!id || !studentId || !date || !areaIds.has(areaId)) {
    return null;
  }

  if (choiceId && !choiceIds.has(choiceId)) {
    return null;
  }

  if (!choiceId && !note) {
    return null;
  }

  const timestamp = item.updatedAt || item.createdAt || `${date}T12:00:00.000`;

  return {
    id,
    studentId,
    date,
    areaId,
    choiceId: choiceId || '',
    note,
    source: item.source || 'teacher',
    createdAt: item.createdAt || timestamp,
    updatedAt: timestamp,
  };
}

function normaliseObservationList(observations) {
  const observationsById = new Map();

  (Array.isArray(observations) ? observations : []).forEach((item) => {
    const observation = normaliseMaths7ALearningObservation(item);
    if (observation) {
      observationsById.set(observation.id, observation);
    }
  });

  return [...observationsById.values()].sort((first, second) => (
    (second.updatedAt || second.createdAt || second.date).localeCompare(first.updatedAt || first.createdAt || first.date)
  ));
}

export function normaliseMaths7ALearningObservationPayload(payload) {
  if (Array.isArray(payload)) {
    return {
      version: 1,
      observations: normaliseObservationList(payload),
    };
  }

  if (!payload || typeof payload !== 'object') {
    return emptyPayload();
  }

  return {
    version: storageVersion,
    observations: normaliseObservationList(payload.observations),
  };
}

export function readMaths7ALocalLearningObservations() {
  if (!canUseLocalStorage()) {
    return emptyPayload();
  }

  try {
    const value = window.localStorage.getItem(MATHS_7A_LEARNING_OBSERVATIONS_STORAGE_KEY);
    if (!value) {
      return emptyPayload();
    }

    return normaliseMaths7ALearningObservationPayload(JSON.parse(value));
  } catch (error) {
    warnStorageIssue('Could not read local learning observations. Using an empty payload.', error);
    return emptyPayload();
  }
}

export function writeMaths7ALocalLearningObservations(payload) {
  const safePayload = normaliseMaths7ALearningObservationPayload(payload);

  if (!canUseLocalStorage()) {
    return { payload: safePayload, persisted: false };
  }

  try {
    if (safePayload.observations.length) {
      window.localStorage.setItem(MATHS_7A_LEARNING_OBSERVATIONS_STORAGE_KEY, JSON.stringify({
        version: storageVersion,
        observations: safePayload.observations,
      }));
    } else {
      window.localStorage.removeItem(MATHS_7A_LEARNING_OBSERVATIONS_STORAGE_KEY);
    }

    return { payload: safePayload, persisted: true };
  } catch (error) {
    warnStorageIssue('Could not write local learning observations. Keeping the change for this session only.', error);
    return { payload: safePayload, persisted: false };
  }
}

export function createMaths7ALocalLearningObservation(input) {
  const timestamp = new Date().toISOString();

  return normaliseMaths7ALearningObservation({
    id: createLocalLearningObservationId(),
    source: 'teacher',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  });
}

export function addMaths7ALocalLearningObservation(payload, observationInput) {
  const currentPayload = normaliseMaths7ALearningObservationPayload(payload);
  const observation = createMaths7ALocalLearningObservation(observationInput);

  if (!observation) {
    return { payload: currentPayload, observation: null, persisted: false };
  }

  const result = writeMaths7ALocalLearningObservations({
    ...currentPayload,
    observations: [observation, ...currentPayload.observations],
  });

  return { ...result, observation };
}

export function updateMaths7ALocalLearningObservation(payload, id, changes) {
  const currentPayload = normaliseMaths7ALearningObservationPayload(payload);
  let updatedObservation = null;
  const observations = currentPayload.observations.map((observation) => {
    if (observation.id !== id) {
      return observation;
    }

    updatedObservation = normaliseMaths7ALearningObservation({
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

  const result = writeMaths7ALocalLearningObservations({
    ...currentPayload,
    observations,
  });

  return { ...result, observation: updatedObservation };
}

export function getMergedMaths7ALearningObservations(baseObservations, storedObservations) {
  const observationById = new Map();

  (baseObservations || [])
    .map(normaliseMaths7ALearningObservation)
    .filter(Boolean)
    .forEach((observation) => observationById.set(observation.id, observation));

  normaliseMaths7ALearningObservationPayload(storedObservations).observations
    .forEach((observation) => observationById.set(observation.id, observation));

  return [...observationById.values()].sort((first, second) => (
    (second.updatedAt || second.createdAt || second.date).localeCompare(first.updatedAt || first.createdAt || first.date)
  ));
}

export function resetMaths7ALocalLearningObservations() {
  const payload = emptyPayload();

  if (!canUseLocalStorage()) {
    return { payload, persisted: false };
  }

  try {
    window.localStorage.removeItem(MATHS_7A_LEARNING_OBSERVATIONS_STORAGE_KEY);
    return { payload, persisted: true };
  } catch (error) {
    warnStorageIssue('Could not reset local learning observations.', error);
    return { payload, persisted: false };
  }
}
