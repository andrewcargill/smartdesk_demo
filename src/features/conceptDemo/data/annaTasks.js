import { annaReminders } from './annaReminders.js';

export const annaTasks = annaReminders.map((reminder) => ({
  ...reminder,
  type: reminder.linkedContexts?.[0]?.moduleId === 'english' ? 'planning' : 'follow-up',
}));
