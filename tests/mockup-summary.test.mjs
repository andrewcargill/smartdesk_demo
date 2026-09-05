import assert from 'node:assert/strict';
import test from 'node:test';
import { getMaterialChapter, mathsTeachingMaterial } from '../src/features/conceptDemo/mockups/home01/teachingMaterialData.js';
import { blocksForWeek, canMoveBlock, initialPlanningBlocks, movePlanningBlock, planningWeeks } from '../src/features/conceptDemo/mockups/home01/planning/planningData.js';
import { amiraMaths } from '../src/features/conceptDemo/mockups/home01/amiraMathsData.js';
import { isMathsSummaryRequest, mathsSummary, getMockReportRequest } from '../src/features/conceptDemo/mockups/home01/mathsSummaryData.js';

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


test('Amira requests work directly and take priority over the class context', () => {
  for (const text of ['amira', '  AMIRA  ', "Amira's maths", 'show Amira in 8a maths']) {
    assert.equal(getMockReportRequest(text), 'amira', text);
  }
  assert.equal(getMockReportRequest('8a maths'), 'class');
  for (const text of ['', 'Samira', 'Amirah', 'hello']) assert.equal(getMockReportRequest(text), null, text);
});

test('Amira’s fictional report uses valid scores and attendance', () => {
  assert.equal(amiraMaths.className, mathsSummary.className);
  assert.equal(amiraMaths.scores.length, mathsSummary.scores.length);
  assert.ok(amiraMaths.scores.every((value) => value >= 0 && value <= 100));
  assert.ok(amiraMaths.skills.every((skill) => skill.value >= 0 && skill.value <= 100));
  assert.ok(amiraMaths.attendance.attended <= amiraMaths.attendance.total);
  assert.equal(amiraMaths.scores.at(-1) - amiraMaths.scores[0], 24);
});


test('planning opens independently and takes priority over class/student mentions', () => {
  for (const prompt of ['planning', ' PLANNING ', '8a maths planning', 'planning for Amira']) {
    assert.equal(getMockReportRequest(prompt), 'planning');
  }
  assert.equal(getMockReportRequest('preplanning'), null);
});

test('planning movement respects bounds and collisions without changing the seed plan', () => {
  assert.equal(canMoveBlock(initialPlanningBlocks, 'algebra', -1), false);
  assert.equal(canMoveBlock(initialPlanningBlocks, 'algebra', 1), false);
  assert.equal(canMoveBlock(initialPlanningBlocks, 'geometry', 1), false);
  assert.equal(canMoveBlock(initialPlanningBlocks, 'missing', 1), false);
  assert.equal(canMoveBlock(initialPlanningBlocks, 'warmup', 2), false);
  assert.equal(movePlanningBlock(initialPlanningBlocks, 'algebra', 1), initialPlanningBlocks);
  const moved = movePlanningBlock(initialPlanningBlocks, 'warmup', 1);
  assert.equal(moved.find((block) => block.id === 'warmup').start, 1);
  assert.equal(initialPlanningBlocks.find((block) => block.id === 'warmup').start, 0);
  assert.equal(canMoveBlock(moved, 'warmup', 1), false);
  assert.equal(moved.find((block) => block.id === 'warmup').duration, 1);
});

test('week selection includes spanning activities and excludes their end boundary', () => {
  const first = blocksForWeek(initialPlanningBlocks, 0);
  const second = blocksForWeek(initialPlanningBlocks, 1);
  const third = blocksForWeek(initialPlanningBlocks, 2);
  assert.ok(first.some((block) => block.id === 'algebra'));
  assert.ok(second.some((block) => block.id === 'algebra'));
  assert.ok(!third.some((block) => block.id === 'algebra'));
  assert.ok(third.some((block) => block.id === 'graphs'));
  assert.ok(initialPlanningBlocks.every((block) => block.start >= 0 && block.start + block.duration <= planningWeeks.length));
});


test('the class and all planning activities link to valid mock textbook chapters', () => {
  assert.equal(mathsSummary.module.materialId, mathsTeachingMaterial.id);
  assert.ok(getMaterialChapter(mathsSummary.module.chapterId));
  for (const block of initialPlanningBlocks) {
    assert.equal(block.materialId, mathsTeachingMaterial.id);
    assert.ok(getMaterialChapter(block.chapterId), block.id);
  }
  assert.equal(getMaterialChapter('unknown'), null);
  assert.match(mathsTeachingMaterial.chapterMapNote, /Illustrative/);
  const moved = movePlanningBlock(initialPlanningBlocks, 'warmup', 1).find((block) => block.id === 'warmup');
  assert.equal(moved.chapterId, 'algebra');
});
