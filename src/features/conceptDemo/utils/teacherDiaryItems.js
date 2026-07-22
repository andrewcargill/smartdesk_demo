export const TEACHER_DIARY_ITEM_TYPES = {
  diaryEvent: 'diary-event',
  reminder: 'reminder',
};

export const TEACHER_DIARY_TITLE_MAX_LENGTH = 120;
export const TEACHER_DIARY_NOTE_MAX_LENGTH = 300;

function cloneLinkedContexts(linkedContexts) {
  return Array.isArray(linkedContexts)
    ? linkedContexts
      .filter((context) => context && typeof context === 'object')
      .map((context) => ({ ...context }))
    : [];
}

export function cloneTeacherDiaryItems(items = []) {
  return items.map((item) => ({
    ...item,
    linkedContexts: cloneLinkedContexts(item.linkedContexts),
  }));
}

export function isKnownTeacherDiaryType(type) {
  return type === TEACHER_DIARY_ITEM_TYPES.diaryEvent || type === TEACHER_DIARY_ITEM_TYPES.reminder;
}

export function isValidTeacherDiaryItem(item) {
  if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !isKnownTeacherDiaryType(item.type)) {
    return false;
  }

  if (typeof item.title !== 'string' || !item.title.trim() || typeof item.date !== 'string' || !item.date) {
    return false;
  }

  if (item.type === TEACHER_DIARY_ITEM_TYPES.diaryEvent) {
    return typeof item.startTime === 'string' && item.startTime && typeof item.endTime === 'string' && item.endTime;
  }

  return true;
}

export function normaliseTeacherDiaryItem(item, fallback = {}) {
  const type = item?.type === TEACHER_DIARY_ITEM_TYPES.diaryEvent
    ? TEACHER_DIARY_ITEM_TYPES.diaryEvent
    : TEACHER_DIARY_ITEM_TYPES.reminder;
  const now = fallback.now || new Date().toISOString();

  return {
    id: item?.id || fallback.id,
    type,
    displayType: item?.displayType || type,
    source: 'smartdesk',
    title: String(item?.title || '').trim().slice(0, TEACHER_DIARY_TITLE_MAX_LENGTH),
    note: String(item?.note || '').trim().slice(0, TEACHER_DIARY_NOTE_MAX_LENGTH),
    date: item?.date || fallback.date || '',
    startTime: type === TEACHER_DIARY_ITEM_TYPES.diaryEvent ? item?.startTime || fallback.startTime || '' : null,
    endTime: type === TEACHER_DIARY_ITEM_TYPES.diaryEvent ? item?.endTime || fallback.endTime || '' : null,
    availability: type === TEACHER_DIARY_ITEM_TYPES.diaryEvent ? item?.availability || 'busy' : null,
    linkedContexts: cloneLinkedContexts(item?.linkedContexts),
    createdAt: item?.createdAt || now,
    updatedAt: item?.updatedAt || now,
    createdBy: item?.createdBy || 'teacher',
  };
}

export function matchLinkedContext(linkedContext, contextQuery = {}) {
  if (!linkedContext || !contextQuery || typeof linkedContext !== 'object' || typeof contextQuery !== 'object') {
    return false;
  }

  const queryEntries = Object.entries(contextQuery).filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (!queryEntries.length) {
    return false;
  }

  return queryEntries.every(([key, value]) => linkedContext[key] === value);
}

export function getDiaryItemsForContext(items = [], contextQuery = {}) {
  return (items || []).filter((item) => (
    Array.isArray(item?.linkedContexts)
    && item.linkedContexts.some((linkedContext) => matchLinkedContext(linkedContext, contextQuery))
  ));
}

export function getDiaryItemsByType(items = [], type) {
  return (items || []).filter((item) => item?.type === type);
}
