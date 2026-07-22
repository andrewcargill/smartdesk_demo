import { useCallback, useMemo, useState } from 'react';

function cloneNotes(notes) {
  return (notes || []).map((note) => ({ ...note }));
}

function isValidNote(note) {
  return Boolean(
    note
      && typeof note.curriculumAreaId === 'string'
      && typeof note.status === 'string',
  );
}

function readSavedNotes(storageKey, initialNotes) {
  if (typeof window === 'undefined') {
    return cloneNotes(initialNotes);
  }

  try {
    const savedValue = window.localStorage.getItem(storageKey);
    if (!savedValue) {
      return cloneNotes(initialNotes);
    }

    const parsed = JSON.parse(savedValue);
    if (!Array.isArray(parsed) || !parsed.every(isValidNote)) {
      return cloneNotes(initialNotes);
    }

    return cloneNotes(parsed);
  } catch {
    return cloneNotes(initialNotes);
  }
}

function persistNotes(storageKey, notes) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(notes));
  }
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function usePlanningCurriculumNotes({ subjectId, classId, initialNotes = [] }) {
  const storageKey = useMemo(
    () => `smartdesk_demo_planning_curriculum_notes_${subjectId}_${classId}`,
    [subjectId, classId],
  );
  const [notes, setNotes] = useState(() => readSavedNotes(storageKey, initialNotes));

  const setAreaNote = useCallback((curriculumAreaId, status, note = '') => {
    setNotes((currentNotes) => {
      const withoutArea = currentNotes.filter((item) => item.curriculumAreaId !== curriculumAreaId);
      const nextNotes = status ? [
        ...withoutArea,
        {
          curriculumAreaId,
          status,
          note,
          updatedAt: getToday(),
        },
      ] : withoutArea;

      persistNotes(storageKey, nextNotes);
      return nextNotes;
    });
  }, [storageKey]);

  const resetNotes = useCallback(() => {
    const seededNotes = cloneNotes(initialNotes);
    persistNotes(storageKey, seededNotes);
    setNotes(seededNotes);
  }, [initialNotes, storageKey]);

  return {
    notes,
    storageKey,
    setAreaNote,
    resetNotes,
  };
}
