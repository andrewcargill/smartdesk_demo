import { getSubjectDisplay } from './annaSubjectUtils.js';
import { getCurrentWeekContext } from './weekDataUtils.js';

export function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function sortEventsByStart(events) {
  return [...events].sort((first, second) => toMinutes(first.start) - toMinutes(second.start));
}

export function getCurrentScheduleDay(schedule) {
  return getCurrentWeekContext(schedule).days.find((day) => day.id === schedule.currentContext.currentDayId) || null;
}

export function getCurrentDayEvents(schedule) {
  const currentDay = getCurrentScheduleDay(schedule);

  return currentDay ? sortEventsByStart(currentDay.events) : [];
}

export function getEventTemporalState(event, currentTime, events) {
  const current = toMinutes(currentTime);
  const start = toMinutes(event.start);
  const end = toMinutes(event.end);
  const nextEvent = sortEventsByStart(events).find((item) => toMinutes(item.start) > current);

  if (current >= end) {
    return 'earlier';
  }

  if (current >= start && current < end) {
    return 'current';
  }

  if (nextEvent?.id === event.id) {
    return 'next';
  }

  return 'later';
}

export function getCurrentGapIndex(events, currentTime) {
  const current = toMinutes(currentTime);
  const sortedEvents = sortEventsByStart(events);

  return sortedEvents.findIndex((event, index) => {
    const nextEvent = sortedEvents[index + 1];
    return nextEvent && current >= toMinutes(event.end) && current < toMinutes(nextEvent.start);
  });
}

export function getCurrentOrNextEvent(events, currentTime) {
  const sortedEvents = sortEventsByStart(events);
  const currentEvent = sortedEvents.find((event) => getEventTemporalState(event, currentTime, sortedEvents) === 'current');

  if (currentEvent) {
    return currentEvent;
  }

  return sortedEvents.find((event) => getEventTemporalState(event, currentTime, sortedEvents) === 'next') || null;
}

export function getNextTeachingLesson(events, currentTime) {
  return sortEventsByStart(events).find((event) => (
    event.type === 'lesson' && toMinutes(event.start) > toMinutes(currentTime)
  )) || null;
}

function getCompactTitle(event) {
  if (event.type === 'lesson') {
    return [event.className, getSubjectDisplay(event).code].filter(Boolean).join(' · ');
  }

  if (event.type === 'mentor') {
    return [event.className, 'Mentor'].filter(Boolean).join(' · ');
  }

  if (event.type === 'planning') {
    return 'Planning';
  }

  if (event.type === 'follow-up') {
    return 'Follow-up';
  }

  if (event.type === 'break') {
    return 'Break';
  }

  return event.title;
}

export function getTodayEventDisplay(event) {
  return {
    title: getCompactTitle(event),
    meta: [event.location].filter(Boolean).join(' · '),
    topic: event.topic,
  };
}

export function getTodaySummary(events, currentTime) {
  const sortedEvents = sortEventsByStart(events);
  const current = toMinutes(currentTime);
  const currentEvent = sortedEvents.find((event) => current >= toMinutes(event.start) && current < toMinutes(event.end));
  const nextEvent = sortedEvents.find((event) => toMinutes(event.start) > current);
  const previousEvent = [...sortedEvents].reverse().find((event) => toMinutes(event.end) <= current);

  if (currentEvent) {
    return `You are currently in ${getTodayEventDisplay(currentEvent).title}.`;
  }

  if (previousEvent && nextEvent) {
    const minutesUntilNext = toMinutes(nextEvent.start) - current;
    return `You have just finished ${getTodayEventDisplay(previousEvent).title}. ${getTodayEventDisplay(nextEvent).title} begins in ${minutesUntilNext} minutes.`;
  }

  if (nextEvent) {
    return `${getTodayEventDisplay(nextEvent).title} begins at ${nextEvent.start}.`;
  }

  return 'There are no later scheduled events today.';
}
