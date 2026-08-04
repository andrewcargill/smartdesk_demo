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
  {
    id: 'orienteering',
    type: 'activity',
    label: {
      en: 'Orienteering',
      sv: 'Orientering',
    },
    primaryCurriculumAreaId: 'outdoor-activities-adaption',
    possibleCurriculumAreaIds: [
      'outdoor-activities-adaption',
      'movement-adaption',
      'safety-risk-management',
    ],
    capturePoints: [
      {
        id: 'orienteering-orientates-map',
        label: {
          en: 'Orientates the map correctly',
          sv: 'Passar kartan korrekt',
        },
        observationDimensionId: 'navigation-orientation',
        curriculumAreaIds: ['outdoor-activities-adaption'],
      },
      {
        id: 'orienteering-selects-route',
        label: {
          en: 'Selects a suitable route',
          sv: 'V\u00e4ljer en l\u00e4mplig v\u00e4g',
        },
        observationDimensionId: 'adaptation-environment-conditions',
        curriculumAreaIds: ['outdoor-activities-adaption'],
      },
      {
        id: 'orienteering-relates-map-environment',
        label: {
          en: 'Relates map features to the surroundings',
          sv: 'Kopplar kartans detaljer till omgivningen',
        },
        observationDimensionId: 'navigation-orientation',
        curriculumAreaIds: ['outdoor-activities-adaption'],
      },
      {
        id: 'orienteering-adapts-to-terrain',
        label: {
          en: 'Adapts pace and movement to the terrain',
          sv: 'Anpassar tempo och r\u00f6relse till terr\u00e4ngen',
        },
        observationDimensionId: 'adaptation-purpose-feedback',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'orienteering-manages-outdoor-risk',
        label: {
          en: 'Identifies and manages risks in the environment',
          sv: 'Identifierar och hanterar risker i milj\u00f6n',
        },
        observationDimensionId: 'identifies-risks',
        curriculumAreaIds: ['safety-risk-management'],
      },
    ],
  },
  {
    id: 'high-jump',
    type: 'activity',
    label: {
      en: 'High jump',
      sv: 'H\u00f6jdhopp',
    },
    primaryCurriculumAreaId: 'movement-adaption',
    possibleCurriculumAreaIds: [
      'movement-adaption',
      'safety-risk-management',
    ],
    capturePoints: [
      {
        id: 'high-jump-controlled-approach',
        label: {
          en: 'Maintains a controlled approach rhythm',
          sv: 'Beh\u00e5ller en kontrollerad ansatsrytm',
        },
        observationDimensionId: 'timing-rhythm',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'high-jump-approach-takeoff',
        label: {
          en: 'Coordinates approach and take-off',
          sv: 'Koordinerar ansats och upphopp',
        },
        observationDimensionId: 'coordination',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'high-jump-body-control-landing',
        label: {
          en: 'Controls body position during the jump and landing',
          sv: 'Kontrollerar kroppsposition under hopp och landning',
        },
        observationDimensionId: 'balance-body-control',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'high-jump-adjusts-technique',
        label: {
          en: 'Adjusts technique after feedback',
          sv: 'Justerar teknik efter \u00e5terkoppling',
        },
        observationDimensionId: 'adaptation-purpose-feedback',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'high-jump-uses-jump-area-safely',
        label: {
          en: 'Uses the jumping and landing area safely',
          sv: 'Anv\u00e4nder hopp- och landningsomr\u00e5det s\u00e4kert',
        },
        observationDimensionId: 'uses-equipment-methods-safely',
        curriculumAreaIds: ['safety-risk-management'],
      },
    ],
  },
  {
    id: 'dance',
    type: 'activity',
    label: {
      en: 'Dance',
      sv: 'Dans',
    },
    primaryCurriculumAreaId: 'movement-adaption',
    possibleCurriculumAreaIds: [
      'movement-adaption',
    ],
    capturePoints: [
      {
        id: 'dance-moves-in-time',
        label: {
          en: 'Maintains movement in time with the music',
          sv: 'Beh\u00e5ller r\u00f6relse i takt med musiken',
        },
        observationDimensionId: 'timing-rhythm',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'dance-coordinates-sequence',
        label: {
          en: 'Coordinates movements into a sequence',
          sv: 'Koordinerar r\u00f6relser till en sekvens',
        },
        observationDimensionId: 'coordination',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'dance-controls-body-position',
        label: {
          en: 'Controls balance and body position',
          sv: 'Kontrollerar balans och kroppsposition',
        },
        observationDimensionId: 'balance-body-control',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'dance-movement-precision',
        label: {
          en: 'Performs movements with clarity and precision',
          sv: 'Utf\u00f6r r\u00f6relser med tydlighet och precision',
        },
        observationDimensionId: 'precision-movement-control',
        curriculumAreaIds: ['movement-adaption'],
      },
      {
        id: 'dance-adapts-to-sequence',
        label: {
          en: 'Adapts movement to the character and purpose of the sequence',
          sv: 'Anpassar r\u00f6relse till sekvensens karakt\u00e4r och syfte',
        },
        observationDimensionId: 'adaptation-purpose-feedback',
        curriculumAreaIds: ['movement-adaption'],
      },
    ],
  },
  {
    id: 'fitness-programme',
    type: 'activity',
    label: {
      en: 'Fitness programme',
      sv: 'Tr\u00e4ningsprogram',
    },
    primaryCurriculumAreaId: 'planning-implementation',
    possibleCurriculumAreaIds: [
      'planning-implementation',
      'safety-risk-management',
      'evaluation-health',
    ],
    capturePoints: [
      {
        id: 'fitness-programme-sets-goal',
        label: {
          en: 'Sets a relevant and realistic goal',
          sv: 'S\u00e4tter ett relevant och realistiskt m\u00e5l',
        },
        observationDimensionId: 'sets-appropriate-goal',
        curriculumAreaIds: ['planning-implementation'],
      },
      {
        id: 'fitness-programme-selects-activities',
        label: {
          en: 'Selects activities that match the goal',
          sv: 'V\u00e4ljer aktiviteter som passar m\u00e5let',
        },
        observationDimensionId: 'selects-suitable-activities-methods',
        curriculumAreaIds: ['planning-implementation'],
      },
      {
        id: 'fitness-programme-creates-sequence',
        label: {
          en: 'Creates a workable sequence with suitable intensity',
          sv: 'Skapar en fungerande ordning med l\u00e4mplig intensitet',
        },
        observationDimensionId: 'creates-workable-plan',
        curriculumAreaIds: ['planning-implementation'],
      },
      {
        id: 'fitness-programme-carries-out-plan',
        label: {
          en: 'Carries out the plan using appropriate technique',
          sv: 'Genomf\u00f6r planen med l\u00e4mplig teknik',
        },
        observationDimensionId: 'carries-out-plan',
        curriculumAreaIds: [
          'planning-implementation',
          'safety-risk-management',
        ],
      },
      {
        id: 'fitness-programme-evaluates-adjusts',
        label: {
          en: 'Evaluates the result and suggests an adjustment',
          sv: 'Utv\u00e4rderar resultatet och f\u00f6resl\u00e5r en justering',
        },
        observationDimensionId: 'evaluates-choices-outcomes',
        curriculumAreaIds: ['evaluation-health'],
      },
    ],
  },
  {
    id: 'outdoor-cooking-campcraft',
    type: 'activity',
    label: {
      en: 'Outdoor cooking and campcraft',
      sv: 'Matlagning ute och friluftsteknik',
    },
    primaryCurriculumAreaId: 'outdoor-activities-adaption',
    possibleCurriculumAreaIds: [
      'outdoor-activities-adaption',
      'safety-risk-management',
      'planning-implementation',
    ],
    capturePoints: [
      {
        id: 'outdoor-cooking-campcraft-prepares-equipment',
        label: {
          en: 'Prepares suitable clothing, equipment and materials',
          sv: 'F\u00f6rbereder l\u00e4mpliga kl\u00e4der, utrustning och material',
        },
        observationDimensionId: 'responsibility-preparedness',
        curriculumAreaIds: ['outdoor-activities-adaption'],
      },
      {
        id: 'outdoor-cooking-campcraft-selects-place-method',
        label: {
          en: 'Selects an appropriate place and method',
          sv: 'V\u00e4ljer en l\u00e4mplig plats och metod',
        },
        observationDimensionId: 'adaptation-environment-conditions',
        curriculumAreaIds: ['outdoor-activities-adaption'],
      },
      {
        id: 'outdoor-cooking-campcraft-uses-equipment-safely',
        label: {
          en: 'Uses outdoor equipment safely',
          sv: 'Anv\u00e4nder friluftsutrustning s\u00e4kert',
        },
        observationDimensionId: 'uses-equipment-methods-safely',
        curriculumAreaIds: ['safety-risk-management'],
      },
      {
        id: 'outdoor-cooking-campcraft-carries-out-task',
        label: {
          en: 'Carries out the planned practical task',
          sv: 'Genomf\u00f6r den planerade praktiska uppgiften',
        },
        observationDimensionId: 'carries-out-plan',
        curriculumAreaIds: ['planning-implementation'],
      },
      {
        id: 'outdoor-cooking-campcraft-sustainable-choices',
        label: {
          en: 'Makes choices that reduce environmental impact',
          sv: 'G\u00f6r val som minskar milj\u00f6p\u00e5verkan',
        },
        observationDimensionId: 'sustainable-choices-outdoors',
        curriculumAreaIds: ['outdoor-activities-adaption'],
      },
    ],
  },
];

export function getPhysicalEducationLearningContextById(contextId) {
  return physicalEducationLearningContexts.find((context) => context.id === contextId) || null;
}
