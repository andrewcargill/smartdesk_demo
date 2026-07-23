export const mathsCaptureLevels = [
  { id: 'emerging', label: 'Emerging', order: 1 },
  { id: 'developing', label: 'Developing', order: 2 },
  { id: 'secure', label: 'Secure', order: 3 },
  { id: 'advanced', label: 'Advanced', order: 4 },
];

export const mathsCapturePoints = [
  { id: 'concept-understanding', label: 'Concept understanding', teachingUnitId: 'fractions-percentages', evidenceTopicId: 'fractions', abilityIds: ['concepts'], order: 1 },
  { id: 'method-selection', label: 'Method selection', teachingUnitId: 'fractions-percentages', evidenceTopicId: 'fractions', abilityIds: ['methods'], order: 2 },
  { id: 'explains-reasoning', label: 'Explains reasoning', teachingUnitId: 'fractions-percentages', evidenceTopicId: 'fractions', abilityIds: ['reasoning', 'communication'], order: 3 },
  { id: 'works-independently', label: 'Works independently', teachingUnitId: 'fractions-percentages', evidenceTopicId: 'fractions', abilityIds: [], order: 4 },
  { id: 'concept-understanding-percentages', label: 'Concept understanding', teachingUnitId: 'fractions-percentages', evidenceTopicId: 'percentages', abilityIds: ['concepts'], order: 1 },
  { id: 'method-selection-percentages', label: 'Method selection', teachingUnitId: 'fractions-percentages', evidenceTopicId: 'percentages', abilityIds: ['methods'], order: 2 },
  { id: 'explains-reasoning-percentages', label: 'Explains reasoning', teachingUnitId: 'fractions-percentages', evidenceTopicId: 'percentages', abilityIds: ['reasoning', 'communication'], order: 3 },
  { id: 'works-independently-percentages', label: 'Works independently', teachingUnitId: 'fractions-percentages', evidenceTopicId: 'percentages', abilityIds: [], order: 4 },

  { id: 'identifies-relevant-properties', label: 'Identifies relevant properties', teachingUnitId: 'geometry', evidenceTopicId: 'geometry', abilityIds: ['concepts'], order: 1 },
  { id: 'uses-diagrams-effectively', label: 'Uses diagrams effectively', teachingUnitId: 'geometry', evidenceTopicId: 'geometry', abilityIds: ['methods'], order: 2 },
  { id: 'applies-suitable-method-geometry', label: 'Applies a suitable method', teachingUnitId: 'geometry', evidenceTopicId: 'geometry', abilityIds: ['methods'], order: 3 },
  { id: 'explains-geometric-reasoning', label: 'Explains geometric reasoning', teachingUnitId: 'geometry', evidenceTopicId: 'geometry', abilityIds: ['reasoning', 'communication'], order: 4 },

  { id: 'interprets-expressions', label: 'Interprets expressions', teachingUnitId: 'algebra-basics', evidenceTopicId: 'expressions', abilityIds: ['concepts'], order: 1 },
  { id: 'selects-algebraic-method-expressions', label: 'Selects an algebraic method', teachingUnitId: 'algebra-basics', evidenceTopicId: 'expressions', abilityIds: ['methods'], order: 2 },
  { id: 'uses-symbols-accurately-expressions', label: 'Uses symbols accurately', teachingUnitId: 'algebra-basics', evidenceTopicId: 'expressions', abilityIds: ['communication'], order: 3 },
  { id: 'explains-each-step-expressions', label: 'Explains each step', teachingUnitId: 'algebra-basics', evidenceTopicId: 'expressions', abilityIds: ['reasoning', 'communication'], order: 4 },
  { id: 'interprets-equations', label: 'Interprets expressions', teachingUnitId: 'algebra-basics', evidenceTopicId: 'equations', abilityIds: ['concepts'], order: 1 },
  { id: 'selects-algebraic-method-equations', label: 'Selects an algebraic method', teachingUnitId: 'algebra-basics', evidenceTopicId: 'equations', abilityIds: ['methods'], order: 2 },
  { id: 'uses-symbols-accurately-equations', label: 'Uses symbols accurately', teachingUnitId: 'algebra-basics', evidenceTopicId: 'equations', abilityIds: ['communication'], order: 3 },
  { id: 'explains-each-step-equations', label: 'Explains each step', teachingUnitId: 'algebra-basics', evidenceTopicId: 'equations', abilityIds: ['reasoning', 'communication'], order: 4 },
  { id: 'interprets-patterns', label: 'Interprets expressions', teachingUnitId: 'algebra-basics', evidenceTopicId: 'patterns', abilityIds: ['concepts'], order: 1 },
  { id: 'selects-algebraic-method-patterns', label: 'Selects an algebraic method', teachingUnitId: 'algebra-basics', evidenceTopicId: 'patterns', abilityIds: ['methods'], order: 2 },
  { id: 'uses-symbols-accurately-patterns', label: 'Uses symbols accurately', teachingUnitId: 'algebra-basics', evidenceTopicId: 'patterns', abilityIds: ['communication'], order: 3 },
  { id: 'explains-each-step-patterns', label: 'Explains each step', teachingUnitId: 'algebra-basics', evidenceTopicId: 'patterns', abilityIds: ['reasoning', 'communication'], order: 4 },

  { id: 'interprets-information-probability', label: 'Interprets information', teachingUnitId: 'probability-statistics', evidenceTopicId: 'probability', abilityIds: ['concepts'], order: 1 },
  { id: 'selects-suitable-method-probability', label: 'Selects a suitable method', teachingUnitId: 'probability-statistics', evidenceTopicId: 'probability', abilityIds: ['methods'], order: 2 },
  { id: 'reasons-from-data-probability', label: 'Reasons from data', teachingUnitId: 'probability-statistics', evidenceTopicId: 'probability', abilityIds: ['reasoning'], order: 3 },
  { id: 'communicates-conclusion-probability', label: 'Communicates a conclusion', teachingUnitId: 'probability-statistics', evidenceTopicId: 'probability', abilityIds: ['communication'], order: 4 },
  { id: 'interprets-information-statistics', label: 'Interprets information', teachingUnitId: 'probability-statistics', evidenceTopicId: 'statistics', abilityIds: ['concepts'], order: 1 },
  { id: 'selects-suitable-method-statistics', label: 'Selects a suitable method', teachingUnitId: 'probability-statistics', evidenceTopicId: 'statistics', abilityIds: ['methods'], order: 2 },
  { id: 'reasons-from-data-statistics', label: 'Reasons from data', teachingUnitId: 'probability-statistics', evidenceTopicId: 'statistics', abilityIds: ['reasoning'], order: 3 },
  { id: 'communicates-conclusion-statistics', label: 'Communicates a conclusion', teachingUnitId: 'probability-statistics', evidenceTopicId: 'statistics', abilityIds: ['communication'], order: 4 },

  { id: 'identifies-relationship', label: 'Identifies a relationship', teachingUnitId: 'relationships-change', evidenceTopicId: 'relationships', abilityIds: ['concepts'], order: 1 },
  { id: 'recognises-pattern-relationships', label: 'Recognises a pattern', teachingUnitId: 'relationships-change', evidenceTopicId: 'relationships', abilityIds: ['concepts'], order: 2 },
  { id: 'represents-change-relationships', label: 'Represents change', teachingUnitId: 'relationships-change', evidenceTopicId: 'relationships', abilityIds: ['methods'], order: 3 },
  { id: 'explains-relationship-relationships', label: 'Explains the relationship', teachingUnitId: 'relationships-change', evidenceTopicId: 'relationships', abilityIds: ['reasoning', 'communication'], order: 4 },
  { id: 'identifies-relationship-change', label: 'Identifies a relationship', teachingUnitId: 'relationships-change', evidenceTopicId: 'change', abilityIds: ['concepts'], order: 1 },
  { id: 'recognises-pattern-change', label: 'Recognises a pattern', teachingUnitId: 'relationships-change', evidenceTopicId: 'change', abilityIds: ['concepts'], order: 2 },
  { id: 'represents-change-change', label: 'Represents change', teachingUnitId: 'relationships-change', evidenceTopicId: 'change', abilityIds: ['methods'], order: 3 },
  { id: 'explains-relationship-change', label: 'Explains the relationship', teachingUnitId: 'relationships-change', evidenceTopicId: 'change', abilityIds: ['reasoning', 'communication'], order: 4 },
];

export const mathsCaptureSignalAliases = {
  'strong-explanation': 'explains-reasoning',
  'understood-with-verbal-support': 'concept-understanding',
  'understood-with-visual-support': 'concept-understanding',
  'visual-model-helped': 'method-selection-percentages',
  'used-diagram-effectively': 'uses-diagrams-effectively',
};

export const mathsCaptureLabelAliases = {
  'Explained a solution clearly to a peer': 'explains-reasoning',
  'Gave a strong verbal explanation': 'explains-reasoning',
  'Understood after verbal explanation': 'concept-understanding',
  'Worked confidently with visual examples': 'concept-understanding-percentages',
  'Showed understanding after using a visual model': 'concept-understanding-percentages',
  'Identified the correct geometry strategy': 'applies-suitable-method-geometry',
};

export function getMathsCaptureLevelById(levelId) {
  return mathsCaptureLevels.find((level) => level.id === levelId) || null;
}

export function getMathsCapturePointById(capturePointId) {
  return mathsCapturePoints.find((point) => point.id === capturePointId) || null;
}

export function getMathsCapturePointsForTopic({ teachingUnitId, evidenceTopicId }) {
  return mathsCapturePoints
    .filter((point) => point.teachingUnitId === teachingUnitId && point.evidenceTopicId === evidenceTopicId)
    .sort((first, second) => first.order - second.order || first.label.localeCompare(second.label));
}

export function getMathsCaptureFocuses({ teachingUnits = [], evidenceTopics = [] } = {}) {
  const topicById = new Map(evidenceTopics.map((topic) => [topic.id, topic]));

  return teachingUnits
    .map((unit) => {
      const topics = (unit.evidenceTopicIds || [])
        .map((topicId) => topicById.get(topicId))
        .filter((topic) => getMathsCapturePointsForTopic({ teachingUnitId: unit.id, evidenceTopicId: topic.id }).length)
        .map((topic) => ({
          id: topic.id,
          label: topic.label,
        }));

      return topics.length
        ? {
          id: unit.id,
          label: unit.label,
          topics,
        }
        : null;
    })
    .filter(Boolean);
}

export function getMathsCapturePointIdFromLegacy({ signal, label }) {
  return mathsCaptureSignalAliases[signal] || mathsCaptureLabelAliases[label] || null;
}

export function validateMathsCaptureConfig({ getTeachingUnitById, getEvidenceTopicById, getAbilityById } = {}) {
  const errors = [];
  const levelIds = new Set();
  const capturePointIds = new Set();

  mathsCaptureLevels.forEach((level) => {
    if (levelIds.has(level.id)) errors.push(`Duplicate capture level ID ${level.id}.`);
    levelIds.add(level.id);
  });

  mathsCapturePoints.forEach((point) => {
    if (capturePointIds.has(point.id)) errors.push(`Duplicate capture point ID ${point.id}.`);
    capturePointIds.add(point.id);
    if (getTeachingUnitById && !getTeachingUnitById(point.teachingUnitId)) errors.push(`${point.id} references missing teaching unit ${point.teachingUnitId}.`);
    if (getEvidenceTopicById && !getEvidenceTopicById(point.evidenceTopicId)) errors.push(`${point.id} references missing evidence topic ${point.evidenceTopicId}.`);
    (point.abilityIds || []).forEach((id) => {
      if (getAbilityById && !getAbilityById(id)) errors.push(`${point.id} references missing ability ${id}.`);
    });
  });

  return errors;
}
