import { annaSchedule } from './annaSchedule.js';

export const MATHS_7A_LESSON_INDEX_STORAGE_KEY = 'smartdesk_demo_maths7a_lesson_index';

const demoStartDate = '2026-05-18';
const maxLessonIndex = 2;
const maths7ADemoScheduleEntryIds = ['mon-maths-7a', 'tue-maths-7a', 'fri-maths-7a'];

function toDate(date) {
  return new Date(`${date}T12:00:00`);
}

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getDayOfWeek(date) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function getDayDefinition(dayOfWeek) {
  return annaSchedule.dayDefinitions.find((day) => day.dayOfWeek === dayOfWeek) || null;
}

export function getMaths7AScheduleEntries() {
  const entriesById = new Map(annaSchedule.scheduleEntries.map((entry) => [entry.id, entry]));

  return maths7ADemoScheduleEntryIds
    .map((entryId) => entriesById.get(entryId))
    .filter((entry) => (
      entry
      && entry.type === 'lesson'
      && entry.subjectId === 'mathematics'
      && entry.classId === '7a'
    ))
    .sort((first, second) => (
      first.dayOfWeek - second.dayOfWeek
      || first.startTime.localeCompare(second.startTime)
    ));
}

export function buildMaths7ADemoLessonSequence() {
  const scheduleEntries = getMaths7AScheduleEntries();
  const lessons = [];
  let cursor = toDate(demoStartDate);
  let scannedDays = 0;

  if (!scheduleEntries.length) {
    return [];
  }

  while (lessons.length <= maxLessonIndex && scannedDays < 21) {
    const dayOfWeek = getDayOfWeek(cursor);
    const dayDefinition = getDayDefinition(dayOfWeek);
    const entriesForDay = scheduleEntries.filter((entry) => entry.dayOfWeek === dayOfWeek);

    entriesForDay.forEach((entry) => {
      if (lessons.length <= maxLessonIndex) {
        lessons.push({
          index: lessons.length,
          date: toIso(cursor),
          startTime: entry.startTime,
          endTime: entry.endTime,
          weekday: dayDefinition?.label || entry.dayOfWeek,
          subjectId: entry.subjectId,
          classId: entry.classId,
          scheduleEntryId: entry.id,
        });
      }
    });

    cursor = addDays(cursor, 1);
    scannedDays += 1;
  }

  return lessons;
}

export function clampMaths7ALessonIndex(index) {
  const numericIndex = Number(index);

  if (!Number.isInteger(numericIndex)) {
    return 0;
  }

  return Math.max(0, Math.min(maxLessonIndex, numericIndex));
}

export function getMaths7ADemoLesson(index) {
  const lessons = buildMaths7ADemoLessonSequence();
  return lessons[clampMaths7ALessonIndex(index)] || lessons[0];
}

export function readMaths7ALessonIndex() {
  if (typeof window === 'undefined') {
    return 0;
  }

  try {
    const value = window.localStorage.getItem(MATHS_7A_LESSON_INDEX_STORAGE_KEY);
    return clampMaths7ALessonIndex(value === null ? 0 : Number(value));
  } catch {
    return 0;
  }
}

export function writeMaths7ALessonIndex(index) {
  const safeIndex = clampMaths7ALessonIndex(index);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(MATHS_7A_LESSON_INDEX_STORAGE_KEY, String(safeIndex));
    } catch {
      return safeIndex;
    }
  }

  return safeIndex;
}

export function resetMaths7ALessonIndex() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(MATHS_7A_LESSON_INDEX_STORAGE_KEY);
    } catch {
      return 0;
    }
  }

  return 0;
}
