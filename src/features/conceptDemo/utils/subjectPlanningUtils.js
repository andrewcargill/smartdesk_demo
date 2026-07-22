export function sortPlanningBlocks(blocks) {
  return [...(blocks || [])].sort((first, second) => {
    const firstDate = first.startDate || first.endDate || '';
    const secondDate = second.startDate || second.endDate || '';

    if (firstDate !== secondDate) {
      return firstDate.localeCompare(secondDate);
    }

    return first.title.localeCompare(second.title);
  });
}

export const sortBlocksByDate = sortPlanningBlocks;

export function getBlocksByPeriod(blocks, periodId) {
  return sortPlanningBlocks((blocks || []).filter((block) => block.periodId === periodId));
}

export function getBlocksByStatus(blocks, status) {
  return sortPlanningBlocks((blocks || []).filter((block) => block.status === status));
}

export function getBlocksByType(blocks, blockType) {
  return sortPlanningBlocks((blocks || []).filter((block) => block.blockType === blockType));
}

export function getBlocksForCurriculumArea(blocks, curriculumAreaId) {
  return sortPlanningBlocks((blocks || []).filter((block) => (block.curriculumAreaIds || []).includes(curriculumAreaId)));
}

export function getAssessmentBlocks(blocks) {
  return sortPlanningBlocks((blocks || []).filter((block) => block.blockType === 'assessment'));
}

export function getPlannedCurriculumAreaIds(blocks) {
  return Array.from(new Set((blocks || []).flatMap((block) => block.curriculumAreaIds || [])));
}

export function getCurrentPlanningBlock(blocks) {
  return sortPlanningBlocks(blocks).find((block) => block.status === 'current') || null;
}

export function getUpcomingBlocks(blocks, referenceDate) {
  return sortPlanningBlocks((blocks || []).filter((block) => {
    if (!block.startDate) {
      return block.status === 'planned';
    }

    return block.startDate >= referenceDate;
  }));
}

export function normaliseGroupAdaptations(adaptations) {
  if (!Array.isArray(adaptations)) {
    return [];
  }

  return adaptations
    .filter((adaptation) => (
      adaptation
      && typeof adaptation.id === 'string'
      && typeof adaptation.workingGroupId === 'string'
      && typeof adaptation.instruction === 'string'
    ))
    .map((adaptation) => ({
      id: adaptation.id,
      workingGroupId: adaptation.workingGroupId,
      instruction: adaptation.instruction,
    }));
}

export function getGroupAdaptations(block) {
  return normaliseGroupAdaptations(block?.groupAdaptations);
}

export function getPlanningAdaptationForGroup(block, workingGroupId) {
  return getGroupAdaptations(block).find((adaptation) => adaptation.workingGroupId === workingGroupId) || null;
}

export function getPlanningAdaptationsForStudent(block, studentId, groups) {
  const activeGroupIdsForStudent = new Set((groups || [])
    .filter((group) => group?.status !== 'archived' && (group.studentIds || []).includes(studentId))
    .map((group) => group.id));

  return getGroupAdaptations(block).filter((adaptation) => activeGroupIdsForStudent.has(adaptation.workingGroupId));
}

export function getBlocksForMonth(blocks, year, month) {
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const monthEndDate = new Date(year, month, 0).getDate();
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(monthEndDate).padStart(2, '0')}`;

  return sortPlanningBlocks((blocks || []).filter((block) => {
    const start = block.startDate || block.endDate || monthStart;
    const end = block.endDate || block.startDate || monthEnd;
    return start <= monthEnd && end >= monthStart;
  }));
}

function toDate(date) {
  return new Date(`${date}T12:00:00`);
}

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

export function getWeekRangeForMonth(year, month) {
  const firstDay = new Date(year, month - 1, 1, 12);
  const lastDay = new Date(year, month, 0, 12);
  const start = new Date(firstDay);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);

  const weeks = [];
  const cursor = new Date(start);
  while (cursor <= lastDay || weeks.length < 1) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const oneJan = new Date(weekStart.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((weekStart - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
    weeks.push({
      id: toIso(weekStart),
      label: `Week ${weekNumber}`,
      startDate: toIso(weekStart),
      endDate: toIso(weekEnd),
    });
    cursor.setDate(cursor.getDate() + 7);
  }

  return weeks;
}

export function getWeekRangeForDateRange(startDate, endDate) {
  const firstDay = toDate(startDate);
  const lastDay = toDate(endDate);
  const start = new Date(firstDay);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);

  const weeks = [];
  const cursor = new Date(start);
  while (cursor <= lastDay || weeks.length < 1) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const oneJan = new Date(weekStart.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((weekStart - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
    weeks.push({
      id: toIso(weekStart),
      label: `W${weekNumber}`,
      startDate: toIso(weekStart),
      endDate: toIso(weekEnd),
    });
    cursor.setDate(cursor.getDate() + 7);
  }

  return weeks;
}

export function getTermDateRange(periods) {
  const sortedPeriods = [...(periods || [])].sort((first, second) => (first.order || 0) - (second.order || 0));
  return {
    startDate: sortedPeriods[0]?.startDate || '',
    endDate: sortedPeriods[sortedPeriods.length - 1]?.endDate || '',
  };
}

export function getMonthSpansForWeeks(weeks) {
  const spans = [];
  weeks.forEach((week, index) => {
    const label = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(toDate(week.startDate));
    const currentSpan = spans[spans.length - 1];
    if (currentSpan?.label === label) {
      currentSpan.span += 1;
      return;
    }

    spans.push({
      label,
      startIndex: index,
      span: 1,
    });
  });

  return spans;
}

export function getBlockTermWeekSpan(block, weeks) {
  if (!block?.startDate && !block?.endDate) {
    return null;
  }

  return getBlockWeekSpan(block, weeks);
}

export function getBlockWeekSpan(block, weeks) {
  const start = block.startDate || block.endDate || weeks[0]?.startDate;
  const end = block.endDate || block.startDate || start;
  const firstIndex = Math.max(0, weeks.findIndex((week) => week.endDate >= start));
  const lastIndex = Math.max(firstIndex, weeks.findIndex((week) => week.startDate <= end && week.endDate >= end));

  return {
    startIndex: firstIndex,
    span: Math.max(1, (lastIndex === -1 ? firstIndex : lastIndex) - firstIndex + 1),
  };
}

export function moveBlockToPeriod(block, period) {
  return {
    ...block,
    periodId: period.id,
    startDate: period.startDate,
    endDate: period.endDate,
  };
}

export function moveBlockToWeek(block, weekStart) {
  const start = toDate(weekStart);
  const end = toDate(weekStart);
  const currentStart = block.startDate ? toDate(block.startDate) : null;
  const currentEnd = block.endDate ? toDate(block.endDate) : null;
  const durationDays = currentStart && currentEnd
    ? Math.max(0, Math.round((currentEnd - currentStart) / 86400000))
    : 6;
  end.setDate(start.getDate() + durationDays);

  return {
    ...block,
    startDate: toIso(start),
    endDate: toIso(end),
  };
}

export function duplicatePlanningBlock(block) {
  return {
    ...block,
    id: undefined,
    title: `${block.title} copy`,
    status: 'planned',
    createdAt: undefined,
    updatedAt: undefined,
  };
}

function getPlanningBlocksFromInput(input) {
  return Array.isArray(input) ? input : input?.planningBlocks || [];
}

function filterKnownIds(ids, knownItems) {
  const knownIds = new Set((knownItems || []).map((item) => item.id));
  const uniqueIds = Array.from(new Set((ids || []).filter(Boolean)));
  return knownIds.size ? uniqueIds.filter((id) => knownIds.has(id)) : uniqueIds;
}

export function getRepresentedCurriculumAreaIds(input) {
  const planningBlocks = getPlanningBlocksFromInput(input);
  return new Set(filterKnownIds(
    planningBlocks.flatMap((block) => block.curriculumAreaIds || []),
    input?.curriculumAreas,
  ));
}

export function getRepresentedAbilityIds(input) {
  const planningBlocks = getPlanningBlocksFromInput(input);
  return new Set(filterKnownIds(
    planningBlocks.flatMap((block) => block.abilityIds || []),
    input?.abilities,
  ));
}

function getUniqueCurriculumAreaIds(item) {
  return Array.from(new Set((item?.curriculumAreaIds || []).filter(Boolean)));
}

export function getTemplateUsageCount({ template, planningBlocks = [] }) {
  const templateIds = [template?.id, template?.templateId, template?.sourceTemplateId].filter(Boolean);
  if (!templateIds.length) {
    return 0;
  }

  return (planningBlocks || []).filter((block) => (
    templateIds.includes(block?.sourceTemplateId) || templateIds.includes(block?.templateId)
  )).length;
}

export function getTeachingUnitUsageCount({ teachingUnitId, planningBlocks = [] }) {
  if (!teachingUnitId) {
    return 0;
  }

  return (planningBlocks || []).filter((block) => (
    block?.teachingUnitId === teachingUnitId
    || block?.sourceTemplateId === teachingUnitId
    || block?.templateId === teachingUnitId
  )).length;
}

function getTemplateCurriculumAreaIdsByType(template, curriculumAreas, type) {
  const linkedAreaIds = getUniqueCurriculumAreaIds(template);
  const areaTypesById = new Map((curriculumAreas || []).map((area) => [area.id, area.type]));

  if (!areaTypesById.size) {
    return linkedAreaIds;
  }

  return linkedAreaIds.filter((id) => areaTypesById.get(id) === type);
}

export function filterTeachingUnits({
  teachingUnits = [],
  selectedCurriculumAreaId = '',
  selectedAbilityIds = [],
}) {
  const selectedAbilitySet = new Set((selectedAbilityIds || []).filter(Boolean));

  return (teachingUnits || []).filter((unit) => {
    const unitContentAreaIds = unit.curriculumAreaIds || [];
    const unitAbilityIds = unit.defaultAbilityIds || unit.abilityIds || [];

    if (selectedCurriculumAreaId && !unitContentAreaIds.includes(selectedCurriculumAreaId)) {
      return false;
    }

    return Array.from(selectedAbilitySet).every((abilityId) => unitAbilityIds.includes(abilityId));
  });
}

export function filterPlanningTemplates({
  templates = [],
  contentAreaId = '',
  abilityIds = [],
  curriculumAreas = [],
}) {
  const selectedAbilityIds = Array.from(new Set((abilityIds || []).filter(Boolean)));

  return (templates || []).filter((template) => {
    const contentAreaIds = template.contentAreaIds || getTemplateCurriculumAreaIdsByType(template, curriculumAreas, 'content');
    const templateAbilityIds = template.defaultAbilityIds
      || template.abilityIds
      || getTemplateCurriculumAreaIdsByType(template, curriculumAreas, 'ability');

    if (contentAreaId && !contentAreaIds.includes(contentAreaId)) {
      return false;
    }

    return selectedAbilityIds.every((abilityId) => templateAbilityIds.includes(abilityId));
  });
}

export function getTemplatePlanningStatus({ template, planningBlocks = [], curriculumAreas = [] }) {
  const representedCurriculumAreaIds = getRepresentedCurriculumAreaIds({ planningBlocks, curriculumAreas });
  const linkedCurriculumAreaIds = getUniqueCurriculumAreaIds(template);
  const curriculumAreaById = new Map((curriculumAreas || []).map((area) => [area.id, area]));
  const linkedCurriculumAreas = linkedCurriculumAreaIds.map((id) => ({
    id,
    label: curriculumAreaById.get(id)?.label || id,
  }));
  const representedCurriculumAreas = linkedCurriculumAreas.filter((area) => representedCurriculumAreaIds.has(area.id));
  const unrepresentedCurriculumAreas = linkedCurriculumAreas.filter((area) => !representedCurriculumAreaIds.has(area.id));
  const representedAreaIds = representedCurriculumAreas.map((area) => area.id);
  const unrepresentedAreaIds = unrepresentedCurriculumAreas.map((area) => area.id);
  const usageCount = getTemplateUsageCount({ template, planningBlocks });

  if (!linkedCurriculumAreaIds.length) {
    return {
      status: 'no-curriculum-link',
      usageCount,
      representedAreaIds,
      unrepresentedAreaIds,
      linkedCurriculumAreas,
      representedCurriculumAreas,
      unrepresentedCurriculumAreas,
    };
  }

  if (usageCount > 0) {
    return {
      status: 'already-in-plan',
      usageCount,
      representedAreaIds,
      unrepresentedAreaIds,
      linkedCurriculumAreas,
      representedCurriculumAreas,
      unrepresentedCurriculumAreas,
    };
  }

  if (!unrepresentedCurriculumAreas.length) {
    return {
      status: 'already-represented',
      usageCount,
      representedAreaIds,
      unrepresentedAreaIds,
      linkedCurriculumAreas,
      representedCurriculumAreas,
      unrepresentedCurriculumAreas,
    };
  }

  if (representedCurriculumAreas.length) {
    return {
      status: 'partly-represented',
      usageCount,
      representedAreaIds,
      unrepresentedAreaIds,
      linkedCurriculumAreas,
      representedCurriculumAreas,
      unrepresentedCurriculumAreas,
    };
  }

  return {
    status: 'adds-something-new',
    usageCount,
    representedAreaIds,
    unrepresentedAreaIds,
    linkedCurriculumAreas,
    representedCurriculumAreas,
    unrepresentedCurriculumAreas,
  };
}

export function getCurriculumAreaPlanningState(areaId, blocks, notes) {
  const representedCount = (blocks || []).filter((block) => (block.curriculumAreaIds || []).includes(areaId)).length;
  if (representedCount) {
    return {
      status: 'represented',
      label: `Represented in ${representedCount} planning ${representedCount === 1 ? 'block' : 'blocks'}`,
      representedCount,
    };
  }

  const note = (notes || []).find((item) => item.curriculumAreaId === areaId);
  if (note?.status === 'planned-elsewhere') {
    return { status: note.status, label: 'Planned elsewhere', note };
  }
  if (note?.status === 'not-relevant-this-term') {
    return { status: note.status, label: 'Not relevant this term', note };
  }
  if (note?.status === 'review-later') {
    return { status: note.status, label: 'Review later', note };
  }

  return {
    status: 'not-represented',
    label: 'Not currently represented in this plan',
  };
}
