import {
  getMathsCaptureLevelById,
  getMathsCapturePointById,
  getMathsCapturePointIdFromLegacy,
  validateMathsCaptureConfig,
} from './mathsCaptureConfig.js';

export const mathsCurriculumAreas = [
  {
    id: 'numbers-and-calculation',
    title: 'Numbers and calculation',
    label: 'Numbers and calculation',
    officialTitleSv: 'Taluppfattning och tals användning',
    type: 'content',
    order: 1,
  },
  {
    id: 'algebra',
    title: 'Algebra',
    label: 'Algebra',
    officialTitleSv: 'Algebra',
    type: 'content',
    order: 2,
  },
  {
    id: 'geometry',
    title: 'Geometry',
    label: 'Geometry',
    officialTitleSv: 'Geometri',
    type: 'content',
    order: 3,
  },
  {
    id: 'probability-statistics',
    title: 'Probability and statistics',
    label: 'Probability and statistics',
    officialTitleSv: 'Sannolikhet och statistik',
    type: 'content',
    order: 4,
  },
  {
    id: 'relationships-change',
    title: 'Relationships and change',
    label: 'Relationships and change',
    officialTitleSv: 'Samband och förändring',
    type: 'content',
    order: 5,
  },
];

export const mathsAbilities = [
  { id: 'concepts', title: 'Concepts', label: 'Concepts', officialTitleSv: null, type: 'ability', order: 1 },
  { id: 'methods', title: 'Methods', label: 'Methods', officialTitleSv: null, type: 'ability', order: 2 },
  { id: 'problem-solving', title: 'Problem-solving', label: 'Problem-solving', officialTitleSv: null, type: 'ability', order: 3 },
  { id: 'reasoning', title: 'Reasoning', label: 'Reasoning', officialTitleSv: null, type: 'ability', order: 4 },
  { id: 'communication', title: 'Communication', label: 'Communication', officialTitleSv: null, type: 'ability', order: 5 },
];

export const mathsEvidenceTopics = [
  {
    id: 'fractions',
    title: 'Fractions',
    label: 'Fractions',
    curriculumAreaId: 'numbers-and-calculation',
    teachingUnitIds: ['fractions-percentages'],
    order: 1,
  },
  {
    id: 'percentages',
    title: 'Percentages',
    label: 'Percentages',
    curriculumAreaId: 'numbers-and-calculation',
    teachingUnitIds: ['fractions-percentages'],
    order: 2,
  },
  {
    id: 'expressions',
    title: 'Expressions',
    label: 'Expressions',
    curriculumAreaId: 'algebra',
    teachingUnitIds: ['algebra-basics'],
    order: 3,
  },
  {
    id: 'equations',
    title: 'Equations',
    label: 'Equations',
    curriculumAreaId: 'algebra',
    teachingUnitIds: ['algebra-basics'],
    order: 4,
  },
  {
    id: 'patterns',
    title: 'Patterns',
    label: 'Patterns',
    curriculumAreaId: 'algebra',
    teachingUnitIds: ['algebra-basics', 'relationships-change'],
    order: 5,
  },
  {
    id: 'geometry',
    title: 'Geometry',
    label: 'Geometry',
    curriculumAreaId: 'geometry',
    teachingUnitIds: ['geometry'],
    order: 6,
  },
  {
    id: 'probability',
    title: 'Probability',
    label: 'Probability',
    curriculumAreaId: 'probability-statistics',
    teachingUnitIds: ['probability-statistics'],
    order: 7,
  },
  {
    id: 'statistics',
    title: 'Statistics',
    label: 'Statistics',
    curriculumAreaId: 'probability-statistics',
    teachingUnitIds: ['probability-statistics'],
    order: 8,
  },
  {
    id: 'relationships',
    title: 'Relationships',
    label: 'Relationships',
    curriculumAreaId: 'relationships-change',
    teachingUnitIds: ['relationships-change'],
    order: 9,
  },
  {
    id: 'change',
    title: 'Change',
    label: 'Change',
    curriculumAreaId: 'relationships-change',
    teachingUnitIds: ['relationships-change'],
    order: 10,
  },
];

export const mathsTeachingUnits = [
  {
    id: 'fractions-percentages',
    title: 'Fractions and percentages',
    label: 'Fractions and percentages',
    description: 'Core work with equivalence, comparison and percentage methods.',
    blockType: 'teaching',
    curriculumAreaIds: ['numbers-and-calculation'],
    evidenceTopicIds: ['fractions', 'percentages'],
    defaultAbilityIds: ['methods', 'problem-solving'],
    quickCaptureOptions: [
      { id: 'solved-independently', label: 'Solved independently' },
      { id: 'verbal-support-helped', label: 'Verbal support helped' },
      { id: 'visual-model-helped', label: 'Visual model helped' },
    ],
    order: 1,
  },
  {
    id: 'algebra-basics',
    title: 'Algebra basics',
    label: 'Algebra basics',
    description: 'Introductory work with expressions, patterns and simple equations.',
    blockType: 'teaching',
    curriculumAreaIds: ['algebra'],
    evidenceTopicIds: ['expressions', 'equations', 'patterns'],
    defaultAbilityIds: ['concepts', 'methods'],
    quickCaptureOptions: [],
    order: 2,
  },
  {
    id: 'geometry',
    title: 'Geometry',
    label: 'Geometry',
    description: 'A short block on geometric reasoning and measurement.',
    blockType: 'teaching',
    curriculumAreaIds: ['geometry'],
    evidenceTopicIds: ['geometry'],
    defaultAbilityIds: ['reasoning', 'communication'],
    quickCaptureOptions: [
      { id: 'used-diagram-effectively', label: 'Used a diagram effectively' },
      { id: 'explained-reasoning-clearly', label: 'Explained reasoning clearly' },
    ],
    order: 3,
  },
  {
    id: 'probability-statistics',
    title: 'Probability and statistics',
    label: 'Probability and statistics',
    description: 'A broad block for probability, data and statistical reasoning.',
    blockType: 'teaching',
    curriculumAreaIds: ['probability-statistics'],
    evidenceTopicIds: ['probability', 'statistics'],
    defaultAbilityIds: ['reasoning'],
    quickCaptureOptions: [],
    order: 4,
  },
  {
    id: 'relationships-change',
    title: 'Relationships and change',
    label: 'Relationships and change',
    description: 'A broad block for relationships, patterns and change.',
    blockType: 'teaching',
    curriculumAreaIds: ['relationships-change'],
    evidenceTopicIds: ['relationships', 'change', 'patterns'],
    defaultAbilityIds: ['concepts'],
    quickCaptureOptions: [],
    order: 5,
  },
];

export const mathsQuickAddTemplates = [
  {
    id: 'blank-block',
    title: 'Blank block',
    blockType: 'teaching',
    description: '',
    curriculumAreaIds: [],
    evidenceTopicIds: [],
    abilityIds: [],
    quickCaptureOptions: [],
  },
  {
    id: 'revision-consolidation',
    title: 'Revision and consolidation',
    blockType: 'consolidation',
    description: 'Broad consolidation before an assessment or transition point.',
    curriculumAreaIds: [],
    evidenceTopicIds: [],
    abilityIds: [],
    quickCaptureOptions: [],
  },
  {
    id: 'assessment-point',
    title: 'Assessment point',
    blockType: 'assessment',
    description: 'A planned broad assessment point.',
    curriculumAreaIds: [],
    evidenceTopicIds: [],
    abilityIds: [],
    quickCaptureOptions: [],
  },
  {
    id: 'problem-solving-reasoning',
    title: 'Problem-solving and reasoning',
    blockType: 'revisit',
    description: 'Revisit written explanation and multi-step problem-solving.',
    curriculumAreaIds: [],
    evidenceTopicIds: [],
    abilityIds: [],
    quickCaptureOptions: [
      { id: 'identified-relevant-information', label: 'Identified relevant information' },
      { id: 'chose-suitable-method', label: 'Chose a suitable method' },
    ],
  },
];

export const mathsPlanningTemplates = [
  ...mathsQuickAddTemplates,
  ...mathsTeachingUnits.map((unit) => ({
    id: unit.id,
    sourceTemplateId: unit.id,
    teachingUnitId: unit.id,
    title: unit.title,
    blockType: unit.blockType,
    description: unit.description,
    curriculumAreaIds: [...unit.curriculumAreaIds],
    evidenceTopicIds: [...unit.evidenceTopicIds],
    abilityIds: [...unit.defaultAbilityIds],
    defaultAbilityIds: [...unit.defaultAbilityIds],
    quickCaptureOptions: unit.quickCaptureOptions,
  })),
];

const teachingUnitCompatibility = {
  'maths-7a-fractions-percentages': 'fractions-percentages',
  'maths-7a-algebra-basics': 'algebra-basics',
  'maths-7a-geometry': 'geometry',
  'fractions checkpoint': 'fractions-percentages',
  'end-of-term assessment': null,
};

const planningToolCompatibility = {
  'maths-7a-written-problem-solving': 'problem-solving-reasoning',
  'problem-solving-reasoning': 'problem-solving-reasoning',
};

const evidenceTopicCompatibility = {
  'algebra-basics': 'expressions',
  statistics: 'statistics',
};

export function getCurriculumAreaById(id) {
  return mathsCurriculumAreas.find((area) => area.id === id) || null;
}

export function getAbilityById(id) {
  return mathsAbilities.find((ability) => ability.id === id) || null;
}

export function getTeachingUnitById(id) {
  return mathsTeachingUnits.find((unit) => unit.id === id) || null;
}

export function getPlanningToolById(id) {
  return mathsQuickAddTemplates.find((tool) => tool.id === id) || null;
}

export function getEvidenceTopicById(id) {
  return mathsEvidenceTopics.find((topic) => topic.id === (evidenceTopicCompatibility[id] || id)) || null;
}

export function getTeachingUnitsForCurriculumArea(areaId) {
  return mathsTeachingUnits.filter((unit) => unit.curriculumAreaIds.includes(areaId));
}

export function getEvidenceTopicsForTeachingUnit(unitId) {
  const unit = getTeachingUnitById(unitId);
  return unit ? unit.evidenceTopicIds.map(getEvidenceTopicById).filter(Boolean) : [];
}

export function getCurriculumAreaForEvidenceTopic(topicId) {
  const topic = getEvidenceTopicById(topicId);
  return topic ? getCurriculumAreaById(topic.curriculumAreaId) : null;
}

export function getAbilitiesForTeachingUnit(unitId) {
  const unit = getTeachingUnitById(unitId);
  return unit ? unit.defaultAbilityIds.map(getAbilityById).filter(Boolean) : [];
}

export function getTeachingUnitForPlanningBlock(block) {
  if (!block) {
    return null;
  }
  const directId = block.teachingUnitId || block.sourceTemplateId || block.templateId;
  const compatibleId = directId || teachingUnitCompatibility[block.id] || teachingUnitCompatibility[String(block.title || '').toLowerCase()];
  if (compatibleId) {
    return getTeachingUnitById(compatibleId);
  }
  return mathsTeachingUnits.find((unit) => unit.title === block.title) || null;
}

export function getPlanningToolForPlanningBlock(block) {
  if (!block) {
    return null;
  }
  const directId = block.sourceTemplateId || block.templateId || block.teachingUnitId;
  const compatibleId = directId || planningToolCompatibility[block.id] || planningToolCompatibility[String(block.title || '').toLowerCase()];
  return compatibleId ? getPlanningToolById(compatibleId) : null;
}

export function splitMathsCurriculumAndAbilityIds({ curriculumAreaIds = [], abilityIds = [] } = {}) {
  const nextCurriculumAreaIds = [];
  const nextAbilityIds = [];
  const unknownCurriculumAreaIds = [];

  [...curriculumAreaIds, ...abilityIds].forEach((id) => {
    if (!id) {
      return;
    }
    if (getCurriculumAreaById(id)) {
      nextCurriculumAreaIds.push(id);
      return;
    }
    if (getAbilityById(id)) {
      nextAbilityIds.push(id);
      return;
    }
    if (curriculumAreaIds.includes(id)) {
      unknownCurriculumAreaIds.push(id);
    }
  });

  return {
    curriculumAreaIds: Array.from(new Set([...nextCurriculumAreaIds, ...unknownCurriculumAreaIds])),
    abilityIds: Array.from(new Set(nextAbilityIds)),
  };
}

export function normalizeMathsPlanningBlock(block) {
  const teachingUnit = getTeachingUnitForPlanningBlock(block);
  const planningTool = getPlanningToolForPlanningBlock(block);
  const splitIds = splitMathsCurriculumAndAbilityIds({
    curriculumAreaIds: block?.curriculumAreaIds || teachingUnit?.curriculumAreaIds || planningTool?.curriculumAreaIds || [],
    abilityIds: block?.abilityIds || teachingUnit?.defaultAbilityIds || planningTool?.abilityIds || [],
  });

  if (!teachingUnit) {
    return {
      ...block,
      sourceTemplateId: block.sourceTemplateId || planningTool?.id || '',
      teachingUnitId: getTeachingUnitById(block.teachingUnitId) ? block.teachingUnitId : '',
      curriculumAreaIds: splitIds.curriculumAreaIds,
      evidenceTopicIds: block.evidenceTopicIds || [],
      abilityIds: splitIds.abilityIds,
    };
  }

  return {
    ...block,
    teachingUnitId: block.teachingUnitId || teachingUnit.id,
    sourceTemplateId: block.sourceTemplateId || teachingUnit.id,
    curriculumAreaIds: splitIds.curriculumAreaIds,
    evidenceTopicIds: block.evidenceTopicIds || teachingUnit.evidenceTopicIds,
    abilityIds: splitIds.abilityIds,
  };
}

export function normalizeMathsEvidenceItem(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const type = item.type === 'assessment' ? 'assessment' : 'observation';
  const topic = getEvidenceTopicById(item.evidenceTopicId || item.topicId);
  if (!item.id || !item.studentId || !topic) {
    return null;
  }

  const linkedUnitIds = topic?.teachingUnitIds || [];
  const explicitTeachingUnit = getTeachingUnitById(item.teachingUnitId);
  const teachingUnitId = explicitTeachingUnit?.id || (linkedUnitIds.length === 1 ? linkedUnitIds[0] : null);
  const percentage = item.percentage !== undefined
    ? Number(item.percentage)
    : item.valueType === 'percentage'
      ? Number(item.value)
      : null;
  const capturePointId = item.capturePointId && getMathsCapturePointById(item.capturePointId)
    ? item.capturePointId
    : getMathsCapturePointIdFromLegacy({ signal: item.signal, label: item.label });
  const levelId = item.levelId && getMathsCaptureLevelById(item.levelId) ? item.levelId : null;
  const assessmentTitle = item.assessmentTitle || (type === 'assessment' ? item.label || '' : '');
  const observationText = item.observationText || (type === 'observation' ? item.note || item.label || '' : '');

  return {
    ...item,
    type,
    date: item.date || '',
    evidenceTopicId: topic.id,
    teachingUnitId,
    planningBlockId: item.planningBlockId || '',
    source: item.source || 'teacher',
    dimensions: Array.isArray(item.dimensions) ? item.dimensions : [],
    percentage: Number.isFinite(percentage) ? percentage : null,
    assessmentTitle,
    capturePointId,
    levelId,
    observationText,
    topicId: topic.id,
    contentAreaId: topic.curriculumAreaId || item.contentAreaId || '',
    value: item.value !== undefined ? item.value : Number.isFinite(percentage) ? percentage : undefined,
    valueType: item.valueType || (Number.isFinite(percentage) ? 'percentage' : undefined),
    label: item.label || assessmentTitle || observationText || '',
    note: item.note ?? observationText ?? null,
  };
}

export function validateMathsEvidenceItems(evidenceItems = []) {
  const errors = [];
  const legacyContentAreaIds = [];

  (evidenceItems || []).forEach((rawItem) => {
    const item = normalizeMathsEvidenceItem(rawItem);
    const topic = getEvidenceTopicById(item?.evidenceTopicId);

    if (!item) {
      errors.push(`${rawItem?.id || 'evidence item'} could not be normalised.`);
      return;
    }

    if (!topic) {
      errors.push(`${item?.id || 'evidence item'} references missing evidence topic ${item.evidenceTopicId}.`);
      return;
    }

    if (item.teachingUnitId && !getTeachingUnitById(item.teachingUnitId)) {
      errors.push(`${item.id} references missing teaching unit ${item.teachingUnitId}.`);
    }

    if (item.capturePointId && !getMathsCapturePointById(item.capturePointId)) {
      errors.push(`${item.id} references missing capture point ${item.capturePointId}.`);
    }

    if (item.levelId && !getMathsCaptureLevelById(item.levelId)) {
      errors.push(`${item.id} references missing capture level ${item.levelId}.`);
    }

    if (item.capturePointId && !item.levelId) {
      errors.push(`${item.id} has a capture point but no valid level.`);
    }

    if (item.percentage !== null && (!Number.isFinite(Number(item.percentage)) || item.percentage < 0 || item.percentage > 100)) {
      errors.push(`${item.id} has invalid percentage ${item.percentage}.`);
    }

    if (!topic.curriculumAreaId || !getCurriculumAreaById(topic.curriculumAreaId)) {
      errors.push(`${item?.id || 'evidence item'} cannot derive a valid curriculum area from ${topic.id}.`);
    }

    if (item.contentAreaId) {
      legacyContentAreaIds.push({
        id: item.id,
        storedContentAreaId: item.contentAreaId,
        derivedContentAreaId: topic.curriculumAreaId,
      });
    }
  });

  return {
    errors,
    legacyContentAreaIds,
  };
}

export function validateMathsCurriculumConfig() {
  const idsAreUnique = (items) => new Set(items.map((item) => item.id)).size === items.length;
  const errors = [];
  if (!idsAreUnique(mathsCurriculumAreas)) errors.push('Duplicate curriculum area IDs.');
  if (!idsAreUnique(mathsAbilities)) errors.push('Duplicate ability IDs.');
  if (!idsAreUnique(mathsTeachingUnits)) errors.push('Duplicate teaching unit IDs.');
  if (!idsAreUnique(mathsEvidenceTopics)) errors.push('Duplicate evidence topic IDs.');

  mathsTeachingUnits.forEach((unit) => {
    if (unit.blockType !== 'teaching') errors.push(`${unit.id} is not a teaching block.`);
    if (!unit.curriculumAreaIds.length) errors.push(`${unit.id} is missing a curriculum area.`);
    if (!unit.evidenceTopicIds.length) errors.push(`${unit.id} is missing an evidence topic.`);
    unit.curriculumAreaIds.forEach((id) => {
      if (!getCurriculumAreaById(id)) errors.push(`${unit.id} references missing curriculum area ${id}.`);
      if (getAbilityById(id)) errors.push(`${unit.id} has ability ${id} inside curriculumAreaIds.`);
    });
    unit.evidenceTopicIds.forEach((id) => {
      if (!getEvidenceTopicById(id)) errors.push(`${unit.id} references missing evidence topic ${id}.`);
    });
    unit.defaultAbilityIds.forEach((id) => {
      if (!getAbilityById(id)) errors.push(`${unit.id} references missing ability ${id}.`);
      if (getCurriculumAreaById(id)) errors.push(`${unit.id} has curriculum area ${id} inside defaultAbilityIds.`);
    });
  });

  mathsPlanningTemplates.forEach((template) => {
    template.curriculumAreaIds.forEach((id) => {
      if (getAbilityById(id)) errors.push(`${template.id} has ability ${id} inside curriculumAreaIds.`);
    });
    (template.abilityIds || []).forEach((id) => {
      if (getCurriculumAreaById(id)) errors.push(`${template.id} has curriculum area ${id} inside abilityIds.`);
    });
    (template.evidenceTopicIds || []).forEach((id) => {
      if (!getEvidenceTopicById(id)) errors.push(`${template.id} references missing evidence topic ${id}.`);
    });
  });

  mathsEvidenceTopics.forEach((topic) => {
    if (!getCurriculumAreaById(topic.curriculumAreaId)) errors.push(`${topic.id} references missing curriculum area ${topic.curriculumAreaId}.`);
    topic.teachingUnitIds.forEach((id) => {
      if (!getTeachingUnitById(id)) errors.push(`${topic.id} references missing teaching unit ${id}.`);
    });
  });

  return [
    ...errors,
    ...validateMathsCaptureConfig({ getTeachingUnitById, getEvidenceTopicById, getAbilityById }),
  ];
}
