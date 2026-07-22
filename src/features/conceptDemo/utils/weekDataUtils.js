import { annaDiaryEvents } from '../data/annaDiaryEvents.js';
import { annaLessonNotes } from '../data/annaLessonNotes.js';
import { annaReminders } from '../data/annaReminders.js';
import { buildWeekDays } from './weekViewUtils.js';

export function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function sortByTime(events) {
  return [...(events || [])].sort((first, second) => toMinutes(first.start) - toMinutes(second.start));
}

export function getCurrentWeekContext(schedule, options = {}) {
  const weekStart = options.weekStart || schedule.currentContext.weekStart || schedule.currentContext.date;
  return {
    ...schedule.currentContext,
    weekStart,
    days: buildWeekDays({
      weekStart,
      dayEntries: schedule.dayDefinitions,
      scheduleEntries: schedule.scheduleEntries,
      diaryEvents: options.diaryEvents || annaDiaryEvents,
      reminders: options.reminders || annaReminders,
      lessonNotes: options.lessonNotes || annaLessonNotes,
    }),
  };
}

export function getCurrentDay(days, currentDayId) {
  return days.find((day) => day.id === currentDayId) || days[0];
}

export function mergeScheduleEventsAndMeetings(day) {
  return sortByTime(day?.events || []);
}

export function getEventsForDay(dayId, schedule, options = {}) {
  const weekContext = getCurrentWeekContext(schedule, options);
  const day = weekContext.days.find((item) => item.id === dayId);
  return day ? sortByTime(day.events) : [];
}

export function getCurrentPositionIndex(events, currentTime) {
  const current = toMinutes(currentTime);

  return sortByTime(events).findIndex((event, index, sortedEvents) => {
    const nextEvent = sortedEvents[index + 1];
    return nextEvent && current >= toMinutes(event.end) && current < toMinutes(nextEvent.start);
  });
}

export function selectTasksForCurrentWeek(tasks, schedule, options = {}) {
  const weekContext = getCurrentWeekContext(schedule, options);
  const weekDates = new Set(weekContext.days.map((day) => day.date));
  const weekEventIds = new Set(weekContext.days.flatMap((day) => day.events.flatMap((event) => [event.id, event.originalId].filter(Boolean))));

  return (tasks || []).filter((task) => (
    weekDates.has(task.date)
    || weekDates.has(task.scheduledDate)
    || weekEventIds.has(task.preferredWindowEventId)
  ));
}

export function getLinkedEvent(task, schedule, options = {}) {
  if (!task.preferredWindowEventId) {
    return null;
  }

  return getCurrentWeekContext(schedule, options).days
    .flatMap((day) => day.events)
    .find((event) => event.id === task.preferredWindowEventId || event.originalId === task.preferredWindowEventId);
}
