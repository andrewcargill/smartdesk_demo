export const planningWeeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
export const currentPlanningWeek = 1;
export const planningLanes = ['Teaching', 'Practice', 'Check-ins'];
export const initialPlanningBlocks = [
  { id: 'algebra', materialId: 'favorit-matematik-8', chapterId: 'algebra', lane: 'Teaching', title: 'Algebra & equations', start: 0, duration: 2, status: 'In progress', notes: 'Build confidence with two-step equations.' },
  { id: 'graphs', materialId: 'favorit-matematik-8', chapterId: 'graphs', lane: 'Teaching', title: 'Patterns & graphs', start: 2, duration: 2, status: 'Planned', notes: 'Connect tables, rules and a simple graph.' },
  { id: 'geometry', materialId: 'favorit-matematik-8', chapterId: 'geometry', lane: 'Teaching', title: 'Shapes & measurement', start: 4, duration: 2, status: 'Planned', notes: 'Explore area and perimeter through everyday examples.' },
  { id: 'warmup', materialId: 'favorit-matematik-8', chapterId: 'algebra', lane: 'Practice', title: 'Equation warm-ups', start: 0, duration: 1, status: 'Complete', notes: 'Short paired explanations at the start of each lesson.' },
  { id: 'problems', materialId: 'favorit-matematik-8', chapterId: 'graphs', lane: 'Practice', title: 'Real-world problems', start: 2, duration: 2, status: 'Planned', notes: 'Let students choose a problem and explain their approach.' },
  { id: 'stations', materialId: 'favorit-matematik-8', chapterId: 'geometry', lane: 'Practice', title: 'Practice stations', start: 5, duration: 1, status: 'Planned', notes: 'Rotate through measuring, sketching and checking.' },
  { id: 'first-check', materialId: 'favorit-matematik-8', chapterId: 'algebra', lane: 'Check-ins', title: 'Algebra check', start: 1, duration: 1, status: 'Complete', notes: 'A short check with time for feedback.' },
  { id: 'graph-check', materialId: 'favorit-matematik-8', chapterId: 'graphs', lane: 'Check-ins', title: 'Graph check-in', start: 3, duration: 1, status: 'Planned', notes: 'Look for clear explanations, not just the final answer.' },
  { id: 'reflection', materialId: 'favorit-matematik-8', chapterId: 'geometry', lane: 'Check-ins', title: 'Reflect & review', start: 5, duration: 1, status: 'Planned', notes: 'Students choose one example of progress.' },
];

export function blocksForWeek(blocks, week) {
  return blocks.filter((block) => block.start <= week && block.start + block.duration > week);
}

export function canMoveBlock(blocks, id, direction) {
  const block = blocks.find((item) => item.id === id);
  if (!block || ![-1, 1].includes(direction)) return false;
  const start = block.start + direction;
  const end = start + block.duration;
  return start >= 0 && end <= planningWeeks.length && !blocks.some((other) => (
    other.id !== id && other.lane === block.lane && start < other.start + other.duration && end > other.start
  ));
}

export function movePlanningBlock(blocks, id, direction) {
  if (!canMoveBlock(blocks, id, direction)) return blocks;
  return blocks.map((block) => block.id === id ? { ...block, start: block.start + direction } : block);
}
