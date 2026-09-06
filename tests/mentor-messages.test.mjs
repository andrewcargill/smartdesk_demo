import test from 'node:test';
import assert from 'node:assert/strict';
import { getStudentTeachingMessage, readStoredMentorPicture, writeStoredMentorPicture, subscribeMentorPicture, mentorStorageKey } from '../src/features/conceptDemo/components/mentorModule/utils/mentorPictureStorage.js';

test('mentor seed and overrides match student and class, with removal hiding the message', () => {
  const seed = getStudentTeachingMessage('elias-nilsson', '8A', {});
  assert.equal(seed.text, 'Written instructions recommended');
  assert.equal(getStudentTeachingMessage('elias-nilsson', '7a', {}), null);
  assert.equal(getStudentTeachingMessage('unknown', '8a', {}), null);
  const message = { id: 'new', text: 'Allow extra reading time.', status: 'current', createdAt: '2026-09-06T10:30:00.000Z', author: 'Anna' };
  const overrides = { 'elias-nilsson': { teachingInfo: [message, { ...seed, status: 'past' }] } };
  assert.deepEqual(getStudentTeachingMessage('elias-nilsson', '8a', overrides), message);
  overrides['elias-nilsson'].teachingInfo[0] = { ...message, status: 'past' };
  assert.equal(getStudentTeachingMessage('elias-nilsson', '8a', overrides), null);
  assert.equal(getStudentTeachingMessage('elias-nilsson', '8a', { 'elias-nilsson': { teachingInfo: [] } }), null);
});

test('local storage persists messages, publishes updates and handles corrupt/blocked storage', () => {
  const target = new EventTarget();
  let stored = null;
  globalThis.window = {
    localStorage: { getItem: () => stored, setItem: (key, value) => { assert.equal(key, mentorStorageKey); stored = value; } },
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
  };
  let updates = 0;
  const unsubscribe = subscribeMentorPicture(() => updates++);
  const payload = { 'elias-nilsson': { teachingInfo: [{ id: 'demo', text: 'Written instructions', status: 'current', createdAt: '2026-09-06T10:30:00.000Z' }] } };
  try {
    assert.equal(writeStoredMentorPicture(payload), true);
    assert.deepEqual(readStoredMentorPicture(), payload);
    assert.equal(updates, 1);
    stored = 'broken JSON';
    assert.deepEqual(readStoredMentorPicture(), {});
    stored = '[]';
    assert.deepEqual(readStoredMentorPicture(), {});
    window.localStorage.setItem = () => { throw new Error('blocked'); };
    assert.equal(writeStoredMentorPicture(payload), false);
    assert.deepEqual(readStoredMentorPicture(), payload);
    assert.equal(updates, 2);
    const event = new Event('storage');
    Object.defineProperty(event, 'key', { value: mentorStorageKey });
    stored = '{}';
    window.dispatchEvent(event);
    assert.deepEqual(readStoredMentorPicture(), {});
    assert.equal(updates, 3);
    unsubscribe();
    window.dispatchEvent(event);
    assert.equal(updates, 3);
  } finally { unsubscribe(); delete globalThis.window; }
});
