import { fallbackMentorPicture, mentorSeed } from '../data/mentor8AData.js';

export const mentorStorageKey = 'smartdesk_demo_mentor_8a_picture';
export const mentorStorageEvent = 'smartdesk:mentor-picture-updated';
let sessionFallback = null;

export function readStoredMentorPicture() {
  if (sessionFallback) return sessionFallback;
  if (typeof window === 'undefined') return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(mentorStorageKey) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

export function writeStoredMentorPicture(value) {
  if (typeof window === 'undefined') return false;
  let saved = true;
  try {
    window.localStorage.setItem(mentorStorageKey, JSON.stringify(value));
    sessionFallback = null;
  } catch {
    sessionFallback = value;
    saved = false;
  }
  window.dispatchEvent(new Event(mentorStorageEvent));
  return saved;
}

export function subscribeMentorPicture(listener) {
  const onStorage = event => {
    if (event.key === mentorStorageKey || event.key === null) {
      sessionFallback = null;
      listener();
    }
  };
  window.addEventListener(mentorStorageEvent, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(mentorStorageEvent, listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function getStudentMentorPicture(studentId, overrides = {}) {
  return {
    ...fallbackMentorPicture,
    ...(mentorSeed[studentId] || {}),
    ...(overrides[studentId] || {}),
    subjectStatuses: {
      ...fallbackMentorPicture.subjectStatuses,
      ...(mentorSeed[studentId]?.subjectStatuses || {}),
      ...(overrides[studentId]?.subjectStatuses || {}),
    },
    subjectCheckIns: {
      ...fallbackMentorPicture.subjectCheckIns,
      ...(mentorSeed[studentId]?.subjectCheckIns || {}),
      ...(overrides[studentId]?.subjectCheckIns || {}),
    },
  };
}


export function getCurrentTeachingMessage(teachingInfo) {
  const messages = Array.isArray(teachingInfo) ? teachingInfo.filter(item => item && typeof item.text === 'string' && item.text.trim()) : [];
  return messages.find(item => item.status === 'current') || messages.find(item => item.status !== 'past') || null;
}

export function getStudentTeachingMessage(studentId, classId, overrides) {
  if (String(classId || '').toLowerCase() !== '8a') return null;
  return getCurrentTeachingMessage(getStudentMentorPicture(studentId, overrides).teachingInfo);
}
