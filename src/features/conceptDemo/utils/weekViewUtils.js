const dayDefinitions = [
  { id: 'monday', dayOfWeek: 1, label: 'Monday', shortLabel: 'Mon' },
  { id: 'tuesday', dayOfWeek: 2, label: 'Tuesday', shortLabel: 'Tue' },
  { id: 'wednesday', dayOfWeek: 3, label: 'Wednesday', shortLabel: 'Wed' },
  { id: 'thursday', dayOfWeek: 4, label: 'Thursday', shortLabel: 'Thu' },
  { id: 'friday', dayOfWeek: 5, label: 'Friday', shortLabel: 'Fri' },
];

export const MIN_PIXELS_PER_MINUTE = 1.35;
export const DEFAULT_TIMETABLE_VIEWPORT_HEIGHT = 560;
export const TIMELINE_ADD_SNAP_MINUTES = 10;
export const INITIAL_ADD_HOVER_DELAY_MS = 900;
export const ARMED_ADD_HOVER_DELAY_MS = 120;
export const ADD_MODE_RESET_DELAY_MS = 3000;
export const ADD_HOVER_MOVEMENT_TOLERANCE_PX = 8;

const TIMED_ITEM_DENSITY_THRESHOLDS = {
  full: 60,
  compact: 42,
  minimal: 24,
};

export function getTimedItemContentDensity(calculatedHeight) {
  const height = Number(calculatedHeight) || 0;

  if (height >= TIMED_ITEM_DENSITY_THRESHOLDS.full) {
    return 'full';
  }

  if (height >= TIMED_ITEM_DENSITY_THRESHOLDS.compact) {
    return 'compact';
  }

  if (height >= TIMED_ITEM_DENSITY_THRESHOLDS.minimal) {
    return 'minimal';
  }

  return 'tiny';
}

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

function formatDateLabel(date) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(toDate(date));
}

export function timeStringToMinutes(time) {
  const [hours, minutes] = String(time || '00:00').split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

export function minutesToTimeString(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function getItemStartMinutes(item) {
  return timeStringToMinutes(item?.startTime || item?.start);
}

export function getItemEndMinutes(item) {
  return timeStringToMinutes(item?.endTime || item?.end);
}

export function getTimeFromTimelinePointer({
  pointerClientY,
  timelineRect,
  scrollTop = 0,
  sharedStartMinutes,
  pixelsPerMinute,
  snapMinutes = TIMELINE_ADD_SNAP_MINUTES,
  minMinutes,
  maxMinutes,
}) {
  if (
    !timelineRect
    || !Number.isFinite(pointerClientY)
    || !Number.isFinite(sharedStartMinutes)
    || !Number.isFinite(pixelsPerMinute)
    || pixelsPerMinute <= 0
  ) {
    return null;
  }

  const timelineY = pointerClientY - timelineRect.top + (Number(scrollTop) || 0);
  const rawMinutes = sharedStartMinutes + timelineY / pixelsPerMinute;

  if (
    (Number.isFinite(minMinutes) && rawMinutes < minMinutes)
    || (Number.isFinite(maxMinutes) && rawMinutes >= maxMinutes)
  ) {
    return null;
  }

  const snappedMinutes = Math.round(rawMinutes / snapMinutes) * snapMinutes;
  return Math.min(
    Number.isFinite(maxMinutes) ? maxMinutes : snappedMinutes,
    Math.max(Number.isFinite(minMinutes) ? minMinutes : snappedMinutes, snappedMinutes),
  );
}

export function getTimelineItemsAtMinute({ minute, timedItems = [] }) {
  if (!Number.isFinite(minute)) {
    return [];
  }

  return (timedItems || []).filter((item) => {
    const startMinutes = getItemStartMinutes(item);
    const endMinutes = getItemEndMinutes(item);
    return Number.isFinite(startMinutes)
      && Number.isFinite(endMinutes)
      && minute >= startMinutes
      && minute < endMinutes;
  });
}

export function getTimelinePlacementCapability(item) {
  if (!item) {
    return 'empty';
  }

  if (item.source === 'smartdesk' && item.start && item.end) {
    return 'closed';
  }

  if (item.availability === 'flexible-work' || item.availability === 'soft') {
    return 'addable-container';
  }

  return 'closed';
}

export function canQuickAddAtMinute({ minute, timedItems = [] }) {
  const itemsAtMinute = getTimelineItemsAtMinute({ minute, timedItems });

  if (!itemsAtMinute.length) {
    return true;
  }

  return !itemsAtMinute.some((item) => getTimelinePlacementCapability(item) === 'closed');
}

function isWithinWeek(date, weekStart) {
  if (!date || !weekStart) {
    return false;
  }

  const start = toDate(weekStart);
  const end = addDays(start, 6);
  const target = toDate(date);
  return target >= start && target <= end;
}

export function getSharedWeekTimeRange({
  workingPattern,
  weekDates = [],
  weekItems = [],
}) {
  const workingRanges = Object.entries(workingPattern?.days || {})
    .filter(([dayId]) => !weekDates.length || weekDates.some((day) => day.id === dayId))
    .map(([, range]) => ({
      startMinutes: timeStringToMinutes(range?.startTime),
      endMinutes: timeStringToMinutes(range?.endTime),
    }))
    .filter((range) => Number.isFinite(range.startMinutes) && Number.isFinite(range.endMinutes));

  const itemRanges = (weekItems || [])
    .map((item) => ({
      startMinutes: getItemStartMinutes(item),
      endMinutes: getItemEndMinutes(item),
    }))
    .filter((range) => Number.isFinite(range.startMinutes) && Number.isFinite(range.endMinutes));

  const ranges = [...workingRanges, ...itemRanges].filter((range) => range.endMinutes > range.startMinutes);

  if (!ranges.length) {
    return {
      startMinutes: 8 * 60,
      endMinutes: 15 * 60,
    };
  }

  return {
    startMinutes: Math.min(...ranges.map((range) => range.startMinutes)),
    endMinutes: Math.max(...ranges.map((range) => range.endMinutes)),
  };
}

export function clampItemToVisibleRange(item, range) {
  const startMinutes = getItemStartMinutes(item);
  const endMinutes = getItemEndMinutes(item);

  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || endMinutes <= startMinutes) {
    return null;
  }

  return {
    startMinutes: Math.max(range.startMinutes, startMinutes),
    endMinutes: Math.min(range.endMinutes, endMinutes),
  };
}

export function getTimedItemGeometry({
  item,
  range,
  pixelsPerMinute,
}) {
  const clamped = clampItemToVisibleRange(item, range);

  if (!clamped) {
    return null;
  }

  const durationHeight = Math.max(0, clamped.endMinutes - clamped.startMinutes) * pixelsPerMinute;
  return {
    top: (clamped.startMinutes - range.startMinutes) * pixelsPerMinute,
    height: durationHeight,
    durationHeight,
  };
}

export function getWorkingDayGeometry({
  workingDay,
  sharedStartMinutes,
  pixelsPerMinute,
}) {
  const startMinutes = timeStringToMinutes(workingDay?.startTime);
  const endMinutes = timeStringToMinutes(workingDay?.endTime);

  if (
    !Number.isFinite(startMinutes)
    || !Number.isFinite(endMinutes)
    || endMinutes <= startMinutes
    || !Number.isFinite(sharedStartMinutes)
    || !Number.isFinite(pixelsPerMinute)
    || pixelsPerMinute <= 0
  ) {
    return null;
  }

  return {
    top: (startMinutes - sharedStartMinutes) * pixelsPerMinute,
    height: (endMinutes - startMinutes) * pixelsPerMinute,
    startMinutes,
    endMinutes,
  };
}

export function assignDayOverlapColumns(items = []) {
  const timedItems = items
    .map((item, index) => ({
      item,
      index,
      startMinutes: getItemStartMinutes(item),
      endMinutes: getItemEndMinutes(item),
    }))
    .filter((entry) => Number.isFinite(entry.startMinutes) && Number.isFinite(entry.endMinutes))
    .sort((first, second) => (
      first.startMinutes === second.startMinutes
        ? first.endMinutes - second.endMinutes
        : first.startMinutes - second.startMinutes
    ));

  const assignments = new Map();
  const clusters = [];
  let currentCluster = [];
  let currentClusterEnd = -1;

  timedItems.forEach((entry) => {
    if (!currentCluster.length || entry.startMinutes < currentClusterEnd) {
      currentCluster.push(entry);
      currentClusterEnd = Math.max(currentClusterEnd, entry.endMinutes);
      return;
    }

    clusters.push(currentCluster);
    currentCluster = [entry];
    currentClusterEnd = entry.endMinutes;
  });

  if (currentCluster.length) {
    clusters.push(currentCluster);
  }

  clusters.forEach((cluster) => {
    const active = [];
    let maxColumns = 1;
    const clusterAssignments = [];

    cluster.forEach((entry) => {
      for (let index = active.length - 1; index >= 0; index -= 1) {
        if (active[index].endMinutes <= entry.startMinutes) {
          active.splice(index, 1);
        }
      }

      const usedColumns = new Set(active.map((activeEntry) => activeEntry.overlapColumn));
      let overlapColumn = 0;
      while (usedColumns.has(overlapColumn)) {
        overlapColumn += 1;
      }

      const assignedEntry = { ...entry, overlapColumn };
      active.push(assignedEntry);
      maxColumns = Math.max(maxColumns, overlapColumn + 1);
      clusterAssignments.push(assignedEntry);
    });

    clusterAssignments.forEach((entry) => {
      assignments.set(entry.item.id, {
        overlapColumn: entry.overlapColumn,
        overlapColumnCount: maxColumns,
      });
    });
  });

  return assignments;
}

export function getSharedWeekTimetableLayout({
  workingPattern,
  weekDays,
  availableTimelineViewportHeight = DEFAULT_TIMETABLE_VIEWPORT_HEIGHT,
  readableScale = MIN_PIXELS_PER_MINUTE,
}) {
  const range = getSharedWeekTimeRange({
    workingPattern,
    weekDates: weekDays,
    weekItems: (weekDays || []).flatMap((day) => day.events || []),
  });
  const visibleMinuteRange = Math.max(1, range.endMinutes - range.startMinutes);
  const fitScale = Math.max(0, availableTimelineViewportHeight) / visibleMinuteRange;
  const pixelsPerMinute = Math.max(fitScale, readableScale);
  const naturalTimelineHeight = visibleMinuteRange * pixelsPerMinute;

  return {
    ...range,
    startTime: minutesToTimeString(range.startMinutes),
    endTime: minutesToTimeString(range.endMinutes),
    visibleMinuteRange,
    fitScale,
    readableScale,
    pixelsPerMinute,
    naturalTimelineHeight,
    totalHeight: naturalTimelineHeight,
  };
}

function normaliseTimedItem({
  item,
  occurrenceDate,
  startTime,
  endTime,
  displayType,
  source,
  originalId,
  generatedId,
  note,
  linkedContexts,
}) {
  return {
    id: generatedId || item.id,
    originalId: originalId || item.id,
    occurrenceDate,
    date: occurrenceDate,
    startTime,
    endTime,
    start: startTime,
    end: endTime,
    displayType,
    type: displayType,
    diaryItemType: item.type || displayType,
    title: item.title,
    subtitle: item.subtitle || item.topic || '',
    subjectId: item.subjectId || null,
    subject: item.subject || null,
    classId: item.classId || null,
    className: item.className || item.classId?.toUpperCase() || null,
    location: item.location || null,
    topic: item.topic || item.note || null,
    note: note || '',
    availability: item.availability || 'busy',
    linkedContexts: linkedContexts || item.linkedContexts || [],
    source,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
    createdBy: item.createdBy || null,
  };
}

function normaliseReminder(reminder) {
  return {
    id: reminder.id,
    originalId: reminder.id,
    occurrenceDate: reminder.date || reminder.scheduledDate || '',
    date: reminder.date || reminder.scheduledDate || '',
    startTime: null,
    endTime: null,
    start: null,
    end: null,
    displayType: 'reminder',
    type: reminder.type || 'reminder',
    title: reminder.title,
    subtitle: reminder.note || '',
    note: reminder.note || '',
    availability: reminder.availability || 'outside-regulated-time',
    linkedContexts: reminder.linkedContexts || [],
    source: reminder.source || 'smartdesk',
    createdAt: reminder.createdAt || null,
    updatedAt: reminder.updatedAt || null,
    preferredWindowEventId: reminder.preferredWindowEventId || null,
    status: reminder.status || 'open',
    createdBy: reminder.createdBy || null,
    studentId: reminder.studentId || reminder.linkedContexts?.[0]?.studentId || null,
    classId: reminder.classId || reminder.linkedContexts?.[0]?.classId || null,
    moduleId: reminder.moduleId || reminder.linkedContexts?.[0]?.moduleId || null,
  };
}

function getLessonNoteForOccurrence(lessonNotes, scheduleEntryId, occurrenceDate) {
  return (lessonNotes || []).find((note) => (
    note?.scheduleEntryId === scheduleEntryId
    && note?.occurrenceDate === occurrenceDate
  )) || null;
}

export function getWeekDays({ weekStart, dayEntries = dayDefinitions }) {
  const start = toDate(weekStart);
  return (dayEntries || dayDefinitions).map((day) => {
    const date = toIso(addDays(start, (day.dayOfWeek || 1) - 1));
    return {
      id: day.id,
      dayOfWeek: day.dayOfWeek,
      label: day.label,
      shortLabel: day.shortLabel,
      date,
      dateLabel: formatDateLabel(date),
    };
  });
}

export function buildWeekItems({
  weekStart,
  scheduleEntries = [],
  diaryEvents = [],
  reminders = [],
  lessonNotes = [],
}) {
  const scheduleItems = (scheduleEntries || [])
    .filter((entry) => entry?.id && entry.dayOfWeek && entry.startTime && entry.endTime)
    .map((entry) => {
      const occurrenceDate = toIso(addDays(toDate(weekStart), entry.dayOfWeek - 1));
      const note = getLessonNoteForOccurrence(lessonNotes, entry.id, occurrenceDate);
      return normaliseTimedItem({
        item: entry,
        occurrenceDate,
        startTime: entry.startTime,
        endTime: entry.endTime,
        displayType: entry.type,
        source: entry.source || 'school-timetable',
        originalId: entry.id,
        generatedId: `${entry.id}-${occurrenceDate}`,
        note: note?.text || '',
        linkedContexts: note?.linkedContexts || entry.linkedContexts || [],
      });
    });

  const diaryItems = (diaryEvents || [])
    .filter((event) => event?.id && event.date && event.startTime && event.endTime && isWithinWeek(event.date, weekStart))
    .map((event) => normaliseTimedItem({
      item: event,
      occurrenceDate: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      displayType: event.displayType || event.type || 'diary-event',
      source: event.source || 'smartdesk',
      originalId: event.id,
      note: event.note || '',
    }));

  const reminderItems = (reminders || [])
    .filter((reminder) => reminder?.id && isWithinWeek(reminder.date || reminder.scheduledDate, weekStart))
    .map(normaliseReminder);

  return [...scheduleItems, ...diaryItems, ...reminderItems];
}

export function buildWeekDays({
  weekStart,
  dayEntries = dayDefinitions,
  scheduleEntries = [],
  diaryEvents = [],
  reminders = [],
  lessonNotes = [],
}) {
  const weekDays = getWeekDays({ weekStart, dayEntries });
  const items = buildWeekItems({ weekStart, scheduleEntries, diaryEvents, reminders, lessonNotes });

  return weekDays.map((day) => ({
    ...day,
    events: items
      .filter((item) => item.occurrenceDate === day.date && item.startTime && item.endTime)
      .sort((first, second) => first.startTime.localeCompare(second.startTime)),
    reminders: items
      .filter((item) => item.occurrenceDate === day.date && item.displayType === 'reminder'),
  }));
}
