import { annaDiaryEvents } from './annaDiaryEvents.js';

export const annaMeetings = annaDiaryEvents
  .filter((event) => event.displayType === 'parent-contact' || event.displayType === 'meeting')
  .map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    start: event.startTime,
    end: event.endTime,
    type: event.displayType || 'meeting',
    studentId: event.linkedContexts?.[0]?.studentId || null,
    classId: event.linkedContexts?.[0]?.classId || null,
    location: event.location || null,
    status: 'scheduled',
    source: event.source,
  }));
