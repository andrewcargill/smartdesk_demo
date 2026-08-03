import { getCurrentWeekContext } from './weekDataUtils.js';
import { getSubjectDefinition } from '../data/subjectCatalogue.js';
import { defaultConceptDemoLanguage, resolveLocalizedValue } from '../i18n/conceptDemoTranslations.js';

const subjectLabels = {
  mathematics: { title: 'Mathematics', shortTitle: 'Maths', code: 'Ma' },
  english: { title: 'English', shortTitle: 'English', code: 'En' },
  'physical-education': { title: 'Physical Education', shortTitle: 'PE', code: 'PE' },
};

const subjectOrder = ['mathematics', 'english', 'physical-education'];

function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function normaliseValue(value) {
  return value
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function normaliseSubjectId(event) {
  const rawValue = event.subjectId || event.subject || event.title;
  const normalised = normaliseValue(rawValue);

  if (normalised === 'physical-education' || normalised === 'pe') {
    return 'physical-education';
  }

  return normalised;
}

export function getSubjectDisplay(event) {
  const subjectId = normaliseSubjectId(event);
  const subjectDefinition = getSubjectDefinition(subjectId);

  if (event.subjectTitle || event.subjectShortTitle || event.subjectCode) {
    return {
      title: event.subjectTitle || event.subject || event.title,
      shortTitle: event.subjectShortTitle || event.subjectTitle || event.subject || event.title,
      code: event.subjectCode || event.subjectShortTitle || event.subjectTitle || event.subject || event.title,
    };
  }

  if (subjectDefinition) {
    return {
      title: resolveLocalizedValue(subjectDefinition.title, defaultConceptDemoLanguage, subjectId),
      shortTitle: resolveLocalizedValue(subjectDefinition.shortTitle, defaultConceptDemoLanguage, subjectId),
      code: resolveLocalizedValue(subjectDefinition.code, defaultConceptDemoLanguage, subjectId),
    };
  }

  return subjectLabels[subjectId] || {
    title: event.subject || event.title,
    shortTitle: event.subject || event.title,
    code: event.subject || event.title,
  };
}

export function getTeachingEvents(schedule) {
  return getCurrentWeekContext(schedule).days.flatMap((day) => (
    day.events
      .filter((event) => event.type === 'lesson' && normaliseSubjectId(event))
      .map((event) => ({
        ...event,
        dayId: day.id,
        dayLabel: day.label,
        date: day.date,
      }))
  ));
}

export function getUniqueClasses(events) {
  return [...new Set(events.map((event) => event.className).filter(Boolean))].sort();
}

export function getNextSubjectLesson(events, currentContext) {
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const currentOrder = dayOrder.indexOf(currentContext.currentDayId);
  const currentTime = toMinutes(currentContext.currentTime);

  const nextEvent = [...events]
    .sort((first, second) => {
      const firstDay = dayOrder.indexOf(first.dayId);
      const secondDay = dayOrder.indexOf(second.dayId);
      return firstDay === secondDay ? toMinutes(first.start) - toMinutes(second.start) : firstDay - secondDay;
    })
    .find((event) => {
      const eventOrder = dayOrder.indexOf(event.dayId);
      return eventOrder > currentOrder || (eventOrder === currentOrder && toMinutes(event.start) >= currentTime);
    });

  if (!nextEvent) {
    return null;
  }

  return {
    dayId: nextEvent.dayId,
    dayLabel: nextEvent.dayLabel,
    start: nextEvent.start,
    className: nextEvent.className,
    topic: nextEvent.topic,
  };
}

export function getSubjectModules(schedule) {
  const teachingEvents = getTeachingEvents(schedule);
  const groupedEvents = teachingEvents.reduce((groups, event) => {
    const subjectId = normaliseSubjectId(event);
    return {
      ...groups,
      [subjectId]: [...(groups[subjectId] || []), event],
    };
  }, {});

  return Object.entries(groupedEvents)
    .map(([id, events]) => ({
      id,
      title: getSubjectDisplay(events[0]).title,
      shortTitle: getSubjectDisplay(events[0]).shortTitle,
      type: 'subject',
      classes: getUniqueClasses(events),
      lessonCount: events.length,
      nextLesson: getNextSubjectLesson(events, schedule.currentContext),
    }))
    .sort((first, second) => {
      const selectedSubjectOrder = schedule.selectedSubjectIds || [];
      const firstSelectedOrder = selectedSubjectOrder.indexOf(first.id);
      const secondSelectedOrder = selectedSubjectOrder.indexOf(second.id);

      if (firstSelectedOrder !== -1 || secondSelectedOrder !== -1) {
        if (firstSelectedOrder === -1) {
          return 1;
        }

        if (secondSelectedOrder === -1) {
          return -1;
        }

        return firstSelectedOrder - secondSelectedOrder;
      }

      const firstOrder = subjectOrder.indexOf(first.id);
      const secondOrder = subjectOrder.indexOf(second.id);

      if (firstOrder === -1 && secondOrder === -1) {
        return first.title.localeCompare(second.title);
      }

      if (firstOrder === -1) {
        return 1;
      }

      if (secondOrder === -1) {
        return -1;
      }

      return firstOrder - secondOrder;
    });
}
