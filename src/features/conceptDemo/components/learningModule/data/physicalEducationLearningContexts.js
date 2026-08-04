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
  {
    id: 'swimming',
    type: 'activity',
    label: {
      en: 'Swimming',
      sv: 'Simning',
    },
    primaryCurriculumAreaId: 'swimming-emergencies',
    possibleCurriculumAreaIds: [
      'swimming-emergencies',
      'movement-adaption',
      'safety-risk-management',
    ],
    capturePoints: [
      {
        id: 'swimming-controlled-action',
        label: {
          en: 'Maintains a controlled and sustainable swimming action',
          sv: 'Beh\u00e5ller en kontrollerad och h\u00e5llbar simr\u00f6relse',
        },
        observationDimensionId: 'swimming-technique-control',
        curriculumAreaIds: ['swimming-emergencies'],
      },
      {
        id: 'swimming-breathing-coordination',
        label: {
          en: 'Coordinates breathing and movement',
          sv: 'Koordinerar andning och r\u00f6relse',
        },
        observationDimensionId: 'coordination',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'swimming-adapts-technique',
        label: {
          en: 'Adapts technique, pace or position in the water',
          sv: 'Anpassar teknik, tempo eller position i vattnet',
        },
        observationDimensionId: 'adaptation-purpose-feedback',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'swimming-water-safety',
        label: {
          en: 'Behaves safely in and around the water',
          sv: 'Agerar s\u00e4kert i och vid vatten',
        },
        observationDimensionId: 'water-safety',
        curriculumAreaIds: [
          'swimming-emergencies',
          'safety-risk-management',
        ],
      },
      {
        id: 'swimming-water-emergency',
        label: {
          en: 'Responds appropriately in a simulated water emergency',
          sv: 'Agerar l\u00e4mpligt vid en simulerad vattenn\u00f6dsituation',
        },
        observationDimensionId: 'emergency-action-water',
        curriculumAreaIds: ['swimming-emergencies'],
      },
    ],
    requirements: [
      {
        id: 'swim-200m-50m-back',
        label: {
          en: 'Swims 200 m continuously, including 50 m in a back position',
          sv: 'Simmar 200 m sammanh\u00e4ngande, varav 50 m i ryggl\u00e4ge',
        },
        resultType: 'requirement',
        curriculumAreaId: 'swimming-emergencies',
      },
    ],
  },
];

export function getPhysicalEducationLearningContextById(contextId) {
  return physicalEducationLearningContexts.find((context) => context.id === contextId) || null;
}
