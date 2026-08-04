export const musicLearningContexts = [
  {
    id: 'band-performance',
    type: 'activity',
    label: {
      en: 'Band performance',
      sv: 'Bandspel',
    },
    description: {
      en: 'Students make music together in an ensemble and develop security, interaction and musical adaptation.',
      sv: 'Eleverna musicerar tillsammans i ensemble och utvecklar s\u00e4kerhet, samspel och musikalisk anpassning.',
    },
    primaryCurriculumAreaId: 'ensemble-adaptation',
    possibleCurriculumAreaIds: [
      'performance-security',
      'ensemble-adaptation',
      'musical-expression',
    ],
    capturePoints: [
      {
        id: 'band-performance-pulse-rhythm',
        label: {
          en: 'Maintains pulse and rhythm through the piece',
          sv: 'H\u00e5ller puls och rytm genom musikstycket',
        },
        observationDimensionId: 'pulse-rhythm',
        curriculumAreaIds: ['performance-security'],
      },
      {
        id: 'band-performance-own-part',
        label: {
          en: 'Performs their instrumental or vocal part',
          sv: 'Genomf\u00f6r sin instrumentala eller vokala st\u00e4mma',
        },
        observationDimensionId: 'own-part-security',
        curriculumAreaIds: ['performance-security'],
      },
      {
        id: 'band-performance-shared-tempo',
        label: {
          en: "Adapts to the group's tempo",
          sv: 'Anpassar sig till gruppens tempo',
        },
        observationDimensionId: 'shared-pulse-tempo-adaptation',
        curriculumAreaIds: ['ensemble-adaptation'],
      },
      {
        id: 'band-performance-form-transitions',
        label: {
          en: "Follows the music's sections, transitions and ending",
          sv: 'F\u00f6ljer musikens delar, \u00f6verg\u00e5ngar och avslut',
        },
        observationDimensionId: 'musical-form-adaptation',
        curriculumAreaIds: ['ensemble-adaptation'],
      },
      {
        id: 'band-performance-dynamics-expression',
        label: {
          en: 'Adapts volume and expression to the ensemble',
          sv: 'Anpassar volym och uttryck till ensemblen',
        },
        observationDimensionId: 'dynamics-balance-adaptation',
        curriculumAreaIds: [
          'ensemble-adaptation',
          'musical-expression',
        ],
      },
    ],
  },
  {
    id: 'guitar-performance',
    type: 'activity',
    label: {
      en: 'Guitar performance',
      sv: 'Gitarrspel',
    },
    description: {
      en: 'Students develop basic guitar technique, rhythmic security and the ability to perform a musical part individually and with others.',
      sv: 'Eleverna utvecklar grundl\u00e4ggande gitarrteknik, rytmisk s\u00e4kerhet och f\u00f6rm\u00e5ga att genomf\u00f6ra en musikalisk st\u00e4mma individuellt och tillsammans med andra.',
    },
    primaryCurriculumAreaId: 'performance-security',
    possibleCurriculumAreaIds: [
      'performance-security',
      'ensemble-adaptation',
      'musical-expression',
    ],
    capturePoints: [
      {
        id: 'guitar-performance-technique',
        label: {
          en: 'Uses functional guitar technique',
          sv: 'Anv\u00e4nder en funktionell gitarrteknik',
        },
        observationDimensionId: 'instrument-singing-technique',
        curriculumAreaIds: ['performance-security'],
      },
      {
        id: 'guitar-performance-chord-changes',
        label: {
          en: 'Changes between chords while maintaining continuity',
          sv: 'Byter mellan ackord med bibeh\u00e5llen kontinuitet',
        },
        observationDimensionId: 'timing-continuity',
        curriculumAreaIds: ['performance-security'],
      },
      {
        id: 'guitar-performance-pulse-rhythm',
        label: {
          en: 'Maintains pulse and rhythm while playing',
          sv: 'H\u00e5ller puls och rytm under spelet',
        },
        observationDimensionId: 'pulse-rhythm',
        curriculumAreaIds: ['performance-security'],
      },
      {
        id: 'guitar-performance-own-part',
        label: {
          en: 'Performs and maintains their guitar part',
          sv: 'Genomf\u00f6r och h\u00e5ller sin gitarrst\u00e4mma',
        },
        observationDimensionId: 'own-part-security',
        curriculumAreaIds: ['performance-security'],
      },
      {
        id: 'guitar-performance-adapts-to-group',
        label: {
          en: 'Adapts tempo and volume to the ensemble',
          sv: 'Anpassar tempo och volym till ensemblen',
        },
        observationDimensionId: 'dynamics-balance-adaptation',
        curriculumAreaIds: ['ensemble-adaptation'],
      },
    ],
  },
  {
    id: 'drum-performance',
    type: 'activity',
    label: {
      en: 'Drum performance',
      sv: 'Trumspel',
    },
    description: {
      en: 'Students develop rhythmic coordination, timing and the ability to support the pulse, form and dynamics of an ensemble.',
      sv: 'Eleverna utvecklar rytmisk koordination, tajming och f\u00f6rm\u00e5ga att st\u00f6dja ensemblens puls, form och dynamik.',
    },
    primaryCurriculumAreaId: 'performance-security',
    possibleCurriculumAreaIds: [
      'performance-security',
      'ensemble-adaptation',
      'musical-expression',
    ],
    capturePoints: [
      {
        id: 'drum-performance-coordination',
        label: {
          en: 'Coordinates hands and feet in the drum pattern',
          sv: 'Koordinerar h\u00e4nder och f\u00f6tter i trumkompet',
        },
        observationDimensionId: 'instrument-singing-technique',
        curriculumAreaIds: ['performance-security'],
      },
      {
        id: 'drum-performance-pulse-rhythm',
        label: {
          en: 'Maintains a steady pulse and rhythmic pattern',
          sv: 'H\u00e5ller en stadig puls och rytmisk figur',
        },
        observationDimensionId: 'pulse-rhythm',
        curriculumAreaIds: ['performance-security'],
      },
      {
        id: 'drum-performance-continuity',
        label: {
          en: 'Maintains the drum part through the piece',
          sv: 'H\u00e5ller trumst\u00e4mman genom musikstycket',
        },
        observationDimensionId: 'own-part-security',
        curriculumAreaIds: ['performance-security'],
      },
      {
        id: 'drum-performance-form',
        label: {
          en: 'Adapts the drum part to sections and transitions',
          sv: 'Anpassar trumkompet till delar och \u00f6verg\u00e5ngar',
        },
        observationDimensionId: 'musical-form-adaptation',
        curriculumAreaIds: ['ensemble-adaptation'],
      },
      {
        id: 'drum-performance-dynamics',
        label: {
          en: 'Adapts intensity and volume to the musical context',
          sv: 'Anpassar intensitet och volym till det musikaliska sammanhanget',
        },
        observationDimensionId: 'dynamics-balance-adaptation',
        curriculumAreaIds: [
          'ensemble-adaptation',
          'musical-expression',
        ],
      },
    ],
  },
  {
    id: 'scary-music-composition',
    type: 'project',
    label: {
      en: 'Writing scary music',
      sv: 'Skapa skr\u00e4ckmusik',
    },
    description: {
      en: 'Students compose music that creates a frightening or suspenseful atmosphere through sound, rhythm, harmony, dynamics and musical form.',
      sv: 'Eleverna komponerar musik som skapar en skr\u00e4mmande eller sp\u00e4nningsfylld st\u00e4mning genom klang, rytm, harmonik, dynamik och musikalisk form.',
    },
    primaryCurriculumAreaId: 'musical-expression',
    possibleCurriculumAreaIds: [
      'musical-expression',
      'composition-form',
      'characteristics-comparison',
    ],
    capturePoints: [
      {
        id: 'scary-music-communicates-idea',
        label: {
          en: 'Communicates a clear frightening or suspenseful musical idea',
          sv: 'F\u00f6rmedlar en tydlig skr\u00e4mmande eller sp\u00e4nningsfylld musikalisk id\u00e9',
        },
        observationDimensionId: 'communicates-musical-idea',
        curriculumAreaIds: ['musical-expression'],
      },
      {
        id: 'scary-music-musical-elements',
        label: {
          en: 'Uses sound, rhythm, harmony or dynamics to create atmosphere',
          sv: 'Anv\u00e4nder klang, rytm, harmonik eller dynamik f\u00f6r att skapa st\u00e4mning',
        },
        observationDimensionId: 'uses-musical-building-blocks',
        curriculumAreaIds: ['musical-expression'],
      },
      {
        id: 'scary-music-creates-material',
        label: {
          en: 'Creates musical material that supports the intended mood',
          sv: 'Skapar musikaliskt material som st\u00f6djer den avsedda st\u00e4mningen',
        },
        observationDimensionId: 'creates-musical-material',
        curriculumAreaIds: [
          'composition-form',
          'musical-expression',
        ],
      },
      {
        id: 'scary-music-organises-form',
        label: {
          en: 'Organises the music into a functioning dramatic form',
          sv: 'Organiserar musiken i en fungerande dramatisk form',
        },
        observationDimensionId: 'organises-functional-form',
        curriculumAreaIds: ['composition-form'],
      },
      {
        id: 'scary-music-revises',
        label: {
          en: 'Revises the composition to strengthen its atmosphere and impact',
          sv: 'Bearbetar kompositionen f\u00f6r att f\u00f6rst\u00e4rka st\u00e4mning och effekt',
        },
        observationDimensionId: 'revises-composition',
        curriculumAreaIds: [
          'composition-form',
          'musical-expression',
        ],
      },
    ],
  },
];

export function getMusicLearningContextById(contextId) {
  return musicLearningContexts.find((context) => context.id === contextId) || null;
}
