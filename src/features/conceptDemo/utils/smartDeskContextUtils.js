import { annaSchedule } from '../data/annaSchedule.js';
import { annaTasks } from '../data/annaTasks.js';
import { getCurrentDayEvents, getNextTeachingLesson, toMinutes } from './todayScheduleUtils.js';

export function getSmartDeskHomeContext(schedule = annaSchedule) {
  const currentDayEvents = getCurrentDayEvents(schedule);
  const currentContext = schedule.currentContext;
  const nextTeachingEvent = getNextTeachingLesson(currentDayEvents, currentContext.currentTime);
  const lessonCount = currentDayEvents.filter((event) => event.type === 'lesson').length;
  const followUpCount = annaTasks.filter((task) => (
    task.date === currentContext.date || task.preferredWindowEventId
  )).length;

  return {
    screen: 'Home',
    teacherName: schedule.teacher?.name || 'Anna',
    currentTime: currentContext.currentTime,
    dateLabel: currentContext.dateLabel,
    dayLabel: currentContext.dateLabel.split(' ')[0],
    nextEvent: nextTeachingEvent,
    lessonCount,
    followUpCount,
  };
}

export function getContextWelcome(context, fallbackText) {
  if (!context?.nextEvent) {
    return fallbackText;
  }

  return `Good morning, ${context.teacherName || 'Anna'}. ${context.nextEvent.title} ${context.nextEvent.className} begins at ${context.nextEvent.start}. What would be useful right now?`;
}

export function getMinutesUntil(event, currentTime) {
  if (!event) {
    return null;
  }

  return toMinutes(event.start) - toMinutes(currentTime);
}
