import { useCallback, useEffect, useMemo, useState } from 'react';
import { maths7AWorkingGroups } from '../data/Maths7AWorkingGroups.js';

function normalizeGroup(group, { subjectId, classId }) {
  if (!group || typeof group !== 'object') {
    return null;
  }

  const id = typeof group.id === 'string' ? group.id.trim() : '';
  const typeId = typeof group.typeId === 'string' ? group.typeId.trim() : '';
  const label = typeof group.label === 'string' ? group.label.trim() : '';

  if (!id || !typeId || !label) {
    return null;
  }

  return {
    ...group,
    id,
    classId: typeof group.classId === 'string' && group.classId.trim() ? group.classId.trim() : classId,
    subjectId: typeof group.subjectId === 'string' && group.subjectId.trim() ? group.subjectId.trim() : subjectId,
    typeId,
    label,
    description: typeof group.description === 'string' ? group.description : '',
    studentIds: Array.isArray(group.studentIds) ? uniqueStudentIds(group.studentIds) : [],
    createdAt: typeof group.createdAt === 'string' ? group.createdAt : '',
    updatedAt: typeof group.updatedAt === 'string' ? group.updatedAt : '',
    createdBy: typeof group.createdBy === 'string' ? group.createdBy : 'teacher',
    status: typeof group.status === 'string' && group.status.trim() ? group.status.trim() : 'active',
  };
}

function normalizeGroups(groups, context) {
  if (!Array.isArray(groups)) {
    return null;
  }

  const normalizedGroups = groups.map((group) => normalizeGroup(group, context));
  if (normalizedGroups.some((group) => !group)) {
    return null;
  }

  return normalizedGroups;
}

function cloneGroups(groups, context) {
  return normalizeGroups(groups || [], context) || [];
}

function getSeedGroups({ subjectId, classId, initialGroups }) {
  const seedGroups = subjectId === 'mathematics' && classId === '7a'
    ? maths7AWorkingGroups
    : initialGroups;

  return cloneGroups(seedGroups, { subjectId, classId });
}

function readSavedGroups(storageKey, seedGroups, context) {
  if (typeof window === 'undefined') {
    return { groups: cloneGroups(seedGroups, context), shouldPersistSeed: false };
  }

  try {
    const savedValue = window.localStorage.getItem(storageKey);
    if (!savedValue) {
      return { groups: cloneGroups(seedGroups, context), shouldPersistSeed: true };
    }

    const parsed = JSON.parse(savedValue);
    const normalizedSavedGroups = normalizeGroups(parsed, context);

    if (!normalizedSavedGroups) {
      return { groups: cloneGroups(seedGroups, context), shouldPersistSeed: true };
    }

    return { groups: normalizedSavedGroups, shouldPersistSeed: false };
  } catch {
    return { groups: cloneGroups(seedGroups, context), shouldPersistSeed: true };
  }
}

function persistGroups(storageKey, groups) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(groups));
  }
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(value) {
  return String(value || 'working-group')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function createStableGroupId({ subjectId, classId, label }) {
  return `${slugify(subjectId)}-${slugify(classId)}-${slugify(label)}-${Date.now().toString(36)}`;
}

function uniqueStudentIds(studentIds) {
  return Array.from(new Set((studentIds || []).filter(Boolean)));
}

function insertStudentId(studentIds, studentId, index) {
  const currentIds = uniqueStudentIds(studentIds).filter((id) => id !== studentId);
  if (typeof index !== 'number' || index < 0 || index > currentIds.length) {
    return [...currentIds, studentId];
  }

  return [
    ...currentIds.slice(0, index),
    studentId,
    ...currentIds.slice(index),
  ];
}

export function useClassWorkingGroups({ subjectId, classId, initialGroups }) {
  const storageKey = useMemo(
    () => `smartdesk_demo_working_groups_${subjectId}_${classId}`,
    [subjectId, classId],
  );
  const context = useMemo(() => ({ subjectId, classId }), [classId, subjectId]);
  const seedGroups = useMemo(
    () => getSeedGroups({ subjectId, classId, initialGroups }),
    [classId, initialGroups, subjectId],
  );

  const [initialState] = useState(() => readSavedGroups(storageKey, seedGroups, context));
  const [groups, setGroups] = useState(() => initialState.groups);

  useEffect(() => {
    if (initialState.shouldPersistSeed) {
      persistGroups(storageKey, initialState.groups);
    }
  }, [initialState, storageKey]);

  const commitGroups = useCallback((updater) => {
    setGroups((currentGroups) => {
      const rawNextGroups = typeof updater === 'function'
        ? updater(cloneGroups(currentGroups, context))
        : updater;
      const nextGroups = cloneGroups(rawNextGroups, context);
      persistGroups(storageKey, nextGroups);
      return nextGroups;
    });
  }, [context, storageKey]);

  const createGroup = useCallback((groupInput) => {
    const today = getToday();
    const nextStudentIds = uniqueStudentIds(groupInput.studentIds);
    const nextGroup = {
      id: groupInput.id || createStableGroupId({ subjectId, classId, label: groupInput.label }),
      classId,
      subjectId,
      typeId: groupInput.typeId,
      label: groupInput.label.trim(),
      description: groupInput.description?.trim() || '',
      studentIds: nextStudentIds,
      createdAt: groupInput.createdAt || today,
      updatedAt: today,
      createdBy: groupInput.createdBy || 'teacher',
      status: groupInput.status || 'active',
    };

    commitGroups((currentGroups) => [
      ...currentGroups.map((group) => (
        group.typeId === nextGroup.typeId
          ? {
            ...group,
            studentIds: (group.studentIds || []).filter((studentId) => !nextStudentIds.includes(studentId)),
            updatedAt: today,
          }
          : group
      )),
      nextGroup,
    ]);
    return nextGroup;
  }, [classId, commitGroups, subjectId]);

  const updateGroup = useCallback((groupId, updates) => {
    const today = getToday();
    commitGroups((currentGroups) => {
      const existingGroup = currentGroups.find((group) => group.id === groupId);
      if (!existingGroup) {
        return currentGroups;
      }

      const nextTypeId = updates.typeId !== undefined ? updates.typeId : existingGroup.typeId;
      const nextStudentIds = updates.studentIds !== undefined ? uniqueStudentIds(updates.studentIds) : [...(existingGroup.studentIds || [])];

      return currentGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            ...updates,
            typeId: nextTypeId,
            label: updates.label !== undefined ? updates.label.trim() : group.label,
            description: updates.description !== undefined ? updates.description.trim() : group.description,
            studentIds: nextStudentIds,
            updatedAt: today,
          };
        }

        if (group.typeId === nextTypeId && nextStudentIds.length) {
          return {
            ...group,
            studentIds: (group.studentIds || []).filter((studentId) => !nextStudentIds.includes(studentId)),
            updatedAt: today,
          };
        }

        return group;
      });
    });
  }, [commitGroups]);

  const deleteGroup = useCallback((groupId) => {
    commitGroups((currentGroups) => currentGroups.filter((group) => group.id !== groupId));
  }, [commitGroups]);

  const addStudentToGroup = useCallback((groupId, studentId) => {
    const today = getToday();
    commitGroups((currentGroups) => {
      const targetGroup = currentGroups.find((group) => group.id === groupId);
      if (!targetGroup) {
        return currentGroups;
      }

      return currentGroups.map((group) => {
        if (group.typeId !== targetGroup.typeId) {
          return group;
        }

        if (group.id === groupId) {
          return {
            ...group,
            studentIds: insertStudentId(group.studentIds || [], studentId),
            updatedAt: today,
          };
        }

        return {
          ...group,
          studentIds: (group.studentIds || []).filter((id) => id !== studentId),
          updatedAt: today,
        };
      });
    });
  }, [commitGroups]);

  const removeStudentFromGroup = useCallback((groupId, studentId) => {
    const today = getToday();
    commitGroups((currentGroups) => currentGroups.map((group) => {
      if (group.id !== groupId) {
        return group;
      }

      return {
        ...group,
        studentIds: (group.studentIds || []).filter((id) => id !== studentId),
        updatedAt: today,
      };
    }));
  }, [commitGroups]);

  const replaceGroupStudents = useCallback((groupId, studentIds) => {
    updateGroup(groupId, { studentIds: uniqueStudentIds(studentIds) });
  }, [updateGroup]);

  const moveStudentToGroup = useCallback((groupId, studentId, index) => {
    const today = getToday();
    commitGroups((currentGroups) => {
      const targetGroup = currentGroups.find((group) => group.id === groupId);
      if (!targetGroup) {
        return currentGroups;
      }

      return currentGroups.map((group) => {
        if (group.typeId !== targetGroup.typeId) {
          return group;
        }

        if (group.id === groupId) {
          return {
            ...group,
            studentIds: insertStudentId(group.studentIds || [], studentId, index),
            updatedAt: today,
          };
        }

        return {
          ...group,
          studentIds: (group.studentIds || []).filter((id) => id !== studentId),
          updatedAt: today,
        };
      });
    });
  }, [commitGroups]);

  const moveStudentToUngrouped = useCallback((typeId, studentId) => {
    const today = getToday();
    commitGroups((currentGroups) => currentGroups.map((group) => (
      group.typeId === typeId
        ? {
          ...group,
          studentIds: (group.studentIds || []).filter((id) => id !== studentId),
          updatedAt: today,
        }
        : group
    )));
  }, [commitGroups]);

  const resetGroups = useCallback(() => {
    const seededGroups = cloneGroups(seedGroups, context);
    persistGroups(storageKey, seededGroups);
    setGroups(seededGroups);
  }, [context, seedGroups, storageKey]);

  return {
    groups,
    storageKey,
    createGroup,
    updateGroup,
    deleteGroup,
    addStudentToGroup,
    removeStudentFromGroup,
    replaceGroupStudents,
    moveStudentToGroup,
    moveStudentToUngrouped,
    resetGroups,
  };
}
