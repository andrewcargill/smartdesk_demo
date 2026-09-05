import assert from 'node:assert/strict';
import test from 'node:test';
import { isMathsSummaryRequest, mathsSummary } from '../src/features/conceptDemo/mockups/home01/mathsSummaryData.js';

test('class summary recognises case, spacing, subject aliases and word order', () => {
  for (const text of ['8a maths ', '  8A   MATHS  ', 'maths 8a', 'Show me 8a mathematics', '8 a math']) {
    assert.equal(isMathsSummaryRequest(text), true, text);
  }
  for (const text of ['', '8b maths', '18a maths', '8a music', '8a mathematical', 'hello']) {
    assert.equal(isMathsSummaryRequest(text), false, text);
  }
});

test('fictional test results reconcile and absence is not counted as a failing score', () => {
  const assessedFollowUps = mathsSummary.followUps.filter((student) => student.score !== null);
  const absent = mathsSummary.followUps.filter((student) => student.score === null);
  assert.equal(assessedFollowUps.length, 2);
  assert.equal(absent.length, 1);
  assert.equal(mathsSummary.passed + assessedFollowUps.length + absent.length, mathsSummary.students);
  assert.ok(assessedFollowUps.every((student) => student.score < 50));
  assert.equal(mathsSummary.highlights.length, 4);
  assert.equal(mathsSummary.scores.at(-1) - mathsSummary.scores[0], 12);
  assert.ok(mathsSummary.module.lesson <= mathsSummary.module.lessons);
});
