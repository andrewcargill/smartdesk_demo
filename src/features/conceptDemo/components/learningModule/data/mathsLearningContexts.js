const abilityCapturePoints = [
  {
    id: 'concepts',
    label: { en: 'Concepts', sv: 'Begrepp' },
  },
  {
    id: 'methods',
    label: { en: 'Methods', sv: 'Metoder' },
  },
  {
    id: 'problem-solving',
    label: { en: 'Problem-solving', sv: 'Problemlösning' },
  },
  {
    id: 'reasoning',
    label: { en: 'Reasoning', sv: 'Resonemang' },
  },
  {
    id: 'communication',
    label: { en: 'Communication', sv: 'Kommunikation' },
  },
];

function buildMathsContext({
  id,
  type,
  label,
  primaryCurriculumAreaId,
  possibleCurriculumAreaIds,
  suggestedAbilityIds,
  contentCapturePoint,
}) {
  const abilityPoints = suggestedAbilityIds
    .map((abilityId) => abilityCapturePoints.find((point) => point.id === abilityId))
    .filter(Boolean)
    .map((point) => ({
      id: `${id}-${point.id}`,
      label: point.label,
      observationDimensionId: point.id,
      curriculumAreaIds: ['mathematical-abilities'],
    }));

  return {
    id,
    type,
    label,
    primaryCurriculumAreaId,
    possibleCurriculumAreaIds,
    suggestedAbilityIds,
    capturePoints: [
      {
        id: `${id}-${contentCapturePoint.id}`,
        label: contentCapturePoint.label,
        observationDimensionId: contentCapturePoint.id,
        curriculumAreaIds: [primaryCurriculumAreaId],
      },
      ...abilityPoints,
    ],
  };
}

export const mathsLearningContexts = [
  buildMathsContext({
    id: 'fractions-decimals-percentages',
    type: 'topic',
    label: {
      sv: 'Bråk, decimaler och procent',
      en: 'Fractions, decimals and percentages',
    },
    primaryCurriculumAreaId: 'number-sense',
    possibleCurriculumAreaIds: [
      'number-sense',
      'mathematical-abilities',
    ],
    suggestedAbilityIds: [
      'concepts',
      'methods',
      'problem-solving',
      'reasoning',
    ],
    contentCapturePoint: {
      id: 'fractions-decimals-percentages',
      label: {
        sv: 'Bråk, decimaler och procent',
        en: 'Fractions, decimals and percentages',
      },
    },
  }),
  buildMathsContext({
    id: 'equations',
    type: 'topic',
    label: {
      sv: 'Ekvationer',
      en: 'Equations',
    },
    primaryCurriculumAreaId: 'algebra',
    possibleCurriculumAreaIds: [
      'algebra',
      'mathematical-abilities',
    ],
    suggestedAbilityIds: [
      'concepts',
      'methods',
      'reasoning',
      'communication',
    ],
    contentCapturePoint: {
      id: 'equations',
      label: {
        sv: 'Ekvationer',
        en: 'Equations',
      },
    },
  }),
  buildMathsContext({
    id: 'geometry-investigation',
    type: 'activity',
    label: {
      sv: 'Geometrisk undersökning',
      en: 'Geometry investigation',
    },
    primaryCurriculumAreaId: 'geometry',
    possibleCurriculumAreaIds: [
      'geometry',
      'mathematical-abilities',
    ],
    suggestedAbilityIds: [
      'concepts',
      'problem-solving',
      'reasoning',
      'communication',
    ],
    contentCapturePoint: {
      id: 'geometrical-concepts-properties',
      label: {
        sv: 'Geometriska begrepp och egenskaper',
        en: 'Geometrical concepts and properties',
      },
    },
  }),
];

export function getMathsLearningContextById(contextId) {
  return mathsLearningContexts.find((context) => context.id === contextId) || null;
}
