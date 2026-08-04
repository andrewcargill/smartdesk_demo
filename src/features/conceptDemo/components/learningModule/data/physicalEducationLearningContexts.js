export const physicalEducationLearningContexts = [
  {
    id: 'football',
    type: 'activity',
    label: {
      en: 'Football',
      sv: 'Fotboll',
    },
    primaryCurriculumAreaId: 'movement-adaption',
    possibleCurriculumAreaIds: [
      'movement-adaption',
      'safety-risk-management',
      'evaluation-health',
      'planning-implementation',
    ],
    capturePoints: [
      {
        id: 'football-ball-control',
        label: {
          en: 'Controls the ball while moving',
          sv: 'Kontrollerar bollen i r\u00f6relse',
        },
        observationDimensionId: 'balance-body-control',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'football-receive-pass',
        label: {
          en: 'Coordinates receiving and passing',
          sv: 'Koordinerar mottagning och passning',
        },
        observationDimensionId: 'coordination',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'football-timing',
        label: {
          en: 'Times movement and actions effectively',
          sv: 'Tajmar r\u00f6relse och handlingar effektivt',
        },
        observationDimensionId: 'timing-rhythm',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'football-positioning',
        label: {
          en: 'Adapts positioning as play changes',
          sv: 'Anpassar positionering n\u00e4r spelet f\u00f6r\u00e4ndras',
        },
        observationDimensionId: 'adaptation-purpose-feedback',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'football-precision',
        label: {
          en: 'Performs actions with appropriate precision',
          sv: 'Utf\u00f6r handlingar med l\u00e4mplig precision',
        },
        observationDimensionId: 'precision-movement-control',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'football-team-play',
        label: {
          en: 'Supports team play',
          sv: 'St\u00f6djer lagspel',
        },
        observationDimensionId: 'carries-out-plan',
        curriculumAreaIds: ['planning-implementation'],
      },
      {
        id: 'football-team-adjustment',
        label: {
          en: 'Adjusts to team decisions',
          sv: 'Anpassar sig till lagets beslut',
        },
        observationDimensionId: 'adjusts-plan-when-needed',
        curriculumAreaIds: ['planning-implementation'],
      },
      {
        id: 'football-sportsmanship',
        label: {
          en: 'Acts safely and fairly in play',
          sv: 'Agerar s\u00e4kert och schysst i spel',
        },
        observationDimensionId: 'adapts-actions-conditions',
        curriculumAreaIds: ['safety-risk-management'],
      },
      {
        id: 'football-match-response',
        label: {
          en: 'Responds appropriately during play',
          sv: 'Reagerar l\u00e4mpligt under spel',
        },
        observationDimensionId: 'responds-appropriately',
        curriculumAreaIds: ['safety-risk-management'],
      },
    ],
  },
];

export function getPhysicalEducationLearningContextById(contextId) {
  return physicalEducationLearningContexts.find((context) => context.id === contextId) || null;
}
