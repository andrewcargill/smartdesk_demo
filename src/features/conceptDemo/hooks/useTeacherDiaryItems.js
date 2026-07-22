import { useCallback, useMemo, useState } from 'react';
import {
  cloneTeacherDiaryItems,
  isValidTeacherDiaryItem,
  normaliseTeacherDiaryItem,
  TEACHER_DIARY_ITEM_TYPES,
} from '../utils/teacherDiaryItems.js';

function getStorageKey(teacherId) {
  return `smartdesk_demo_teacher_diary_items_${teacherId}`;
}

function slugify(value) {
  return String(value || 'diary-item')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function createStableDiaryItemId(itemInput) {
  return `teacher-${slugify(itemInput.type)}-${slugify(itemInput.title)}-${Date.now().toString(36)}`;
}

function prepareItems(items = []) {
  return cloneTeacherDiaryItems(items)
    .map((item) => normaliseTeacherDiaryItem(item))
    .filter(isValidTeacherDiaryItem);
}

function readSavedItems(storageKey, initialItems) {
  if (typeof window === 'undefined') {
    return prepareItems(initialItems);
  }

  try {
    const savedValue = window.localStorage.getItem(storageKey);
    if (!savedValue) {
      return prepareItems(initialItems);
    }

    const parsed = JSON.parse(savedValue);
    const savedItems = prepareItems(parsed);
    if (!Array.isArray(parsed) || savedItems.length !== parsed.length) {
      return prepareItems(initialItems);
    }

    return savedItems;
  } catch {
    return prepareItems(initialItems);
  }
}

function persistItems(storageKey, items) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }
}

export function useTeacherDiaryItems({ teacherId, initialItems = [] }) {
  const storageKey = useMemo(() => getStorageKey(teacherId), [teacherId]);
  const seedItems = useMemo(() => prepareItems(initialItems), [initialItems]);
  const [diaryItems, setDiaryItems] = useState(() => readSavedItems(storageKey, seedItems));

  const commitItems = useCallback((updater) => {
    setDiaryItems((currentItems) => {
      const nextItems = typeof updater === 'function'
        ? updater(cloneTeacherDiaryItems(currentItems))
        : cloneTeacherDiaryItems(updater);
      const preparedItems = prepareItems(nextItems);
      persistItems(storageKey, preparedItems);
      return preparedItems;
    });
  }, [storageKey]);

  const createDiaryItem = useCallback((itemInput) => {
    const now = new Date().toISOString();
    const nextItem = normaliseTeacherDiaryItem({
      ...itemInput,
      id: itemInput.id || createStableDiaryItemId(itemInput),
      createdAt: now,
      updatedAt: now,
      createdBy: 'teacher',
    });

    if (!isValidTeacherDiaryItem(nextItem)) {
      return null;
    }

    commitItems((currentItems) => [...currentItems, nextItem]);
    return nextItem;
  }, [commitItems]);

  const updateDiaryItem = useCallback((itemId, updates) => {
    const now = new Date().toISOString();
    let updatedItem = null;

    commitItems((currentItems) => currentItems.map((item) => {
      if (item.id !== itemId) {
        return item;
      }

      updatedItem = normaliseTeacherDiaryItem({
        ...item,
        ...updates,
        id: item.id,
        createdAt: item.createdAt,
        updatedAt: now,
        createdBy: item.createdBy || 'teacher',
      });
      return updatedItem;
    }));

    return updatedItem;
  }, [commitItems]);

  const deleteDiaryItem = useCallback((itemId) => {
    commitItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
  }, [commitItems]);

  const resetDiaryItems = useCallback(() => {
    const restoredItems = cloneTeacherDiaryItems(seedItems);
    persistItems(storageKey, restoredItems);
    setDiaryItems(restoredItems);
  }, [seedItems, storageKey]);

  return {
    diaryItems,
    createDiaryItem,
    updateDiaryItem,
    deleteDiaryItem,
    resetDiaryItems,
    types: TEACHER_DIARY_ITEM_TYPES,
  };
}
