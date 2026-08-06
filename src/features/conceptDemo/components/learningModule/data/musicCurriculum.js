export const musicCurriculumAreas = [
  {
    id: 'performance-security',
    label: { en: 'Singing and playing security', sv: 'Sång- och spelsäkerhet' },
    observationDimensions: [
      { id: 'pulse-rhythm', label: { en: 'Pulse and rhythm', sv: 'Puls och rytm' } },
      { id: 'pitch-melodic-security', label: { en: 'Pitch and melodic security', sv: 'Tonhöjd och melodisk säkerhet' } },
      { id: 'instrument-singing-technique', label: { en: 'Instrument or singing technique', sv: 'Instrument- eller sångteknik' } },
      { id: 'timing-continuity', label: { en: 'Timing and continuity', sv: 'Tajming och kontinuitet' } },
      { id: 'own-part-security', label: { en: 'Security in own part', sv: 'Säkerhet i den egna stämman' } },
    ],
  },
  {
    id: 'ensemble-adaptation',
    label: { en: 'Musical ensemble and adaptation', sv: 'Musikaliskt samspel och anpassning' },
    observationDimensions: [
      { id: 'responsiveness', label: { en: 'Responsiveness', sv: 'Lyhördhet' } },
      { id: 'shared-pulse-tempo-adaptation', label: { en: 'Adaptation to shared pulse and tempo', sv: 'Anpassning till gemensam puls och tempo' } },
      { id: 'dynamics-balance-adaptation', label: { en: 'Adaptation of dynamics and balance', sv: 'Anpassning av dynamik och balans' } },
      { id: 'musical-form-adaptation', label: { en: 'Adaptation to musical form', sv: 'Anpassning till musikalisk form' } },
      { id: 'genre-character-adaptation', label: { en: 'Adaptation to genre and character', sv: 'Anpassning till genre och karaktär' } },
    ],
  },
  {
    id: 'musical-expression',
    label: { en: 'Musical expression and interpretation', sv: 'Musikaliskt uttryck och gestaltning' },
    observationDimensions: [
      { id: 'communicates-musical-idea', label: { en: 'Communicates a musical idea', sv: 'Kommunicerar en musikalisk idé' } },
      { id: 'uses-musical-building-blocks', label: { en: 'Uses musical building blocks', sv: 'Använder musikaliska byggstenar' } },
      { id: 'expressive-musical-choices', label: { en: 'Makes expressive musical choices', sv: 'Gör uttrycksfulla musikaliska val' } },
      { id: 'improvises-tests-ideas', label: { en: 'Improvises and tests ideas', sv: 'Improviserar och prövar idéer' } },
      { id: 'develops-expression', label: { en: 'Processes and develops expression', sv: 'Bearbetar och utvecklar uttrycket' } },
    ],
  },
  {
    id: 'composition-form',
    label: { en: 'Composition and musical form', sv: 'Komposition och musikalisk form' },
    observationDimensions: [
      { id: 'creates-musical-material', label: { en: 'Creates musical material', sv: 'Skapar musikaliskt material' } },
      { id: 'organises-functional-form', label: { en: 'Organises material in a functional form', sv: 'Organiserar material i en fungerande form' } },
      { id: 'connects-musical-parts', label: { en: 'Creates links between musical parts', sv: 'Skapar samband mellan musikens delar' } },
      { id: 'uses-style-features', label: { en: 'Uses style-specific features', sv: 'Använder stiltypiska drag' } },
      { id: 'revises-composition', label: { en: 'Revises the composition', sv: 'Bearbetar kompositionen' } },
    ],
  },
  {
    id: 'characteristics-comparison',
    label: { en: 'Musical characteristics and comparison', sv: 'Musikaliska karaktärsdrag och jämförelse' },
    observationDimensions: [
      { id: 'identifies-musical-characteristics', label: { en: 'Identifies musical characteristics', sv: 'Identifierar musikaliska karaktärsdrag' } },
      { id: 'identifies-instruments-vocal-expression', label: { en: 'Identifies instruments and vocal expression', sv: 'Identifierar instrument och vokala uttryck' } },
      { id: 'uses-relevant-musical-concepts', label: { en: 'Uses relevant musical concepts', sv: 'Använder relevanta musikbegrepp' } },
      { id: 'compares-musical-examples', label: { en: 'Compares musical examples', sv: 'Jämför musikexempel' } },
      { id: 'connects-characteristics-genre-period', label: { en: 'Connects characteristics to genre or period', sv: 'Kopplar karaktärsdrag till genre eller tidsperiod' } },
    ],
  },
  {
    id: 'content-function-significance',
    label: { en: 'Musical content, function and significance', sv: 'Musikens innehåll, funktion och betydelse' },
    observationDimensions: [
      { id: 'interprets-content-expression', label: { en: 'Interprets musical content and expression', sv: 'Tolkar musikens innehåll och uttryck' } },
      { id: 'explains-musical-function', label: { en: 'Explains musical function', sv: 'Förklarar musikens funktion' } },
      { id: 'relates-music-identity-social-contexts', label: { en: 'Relates music to identity and social contexts', sv: 'Relaterar musik till identitet och sociala sammanhang' } },
      { id: 'relates-music-cultural-historical-contexts', label: { en: 'Relates music to cultural and historical contexts', sv: 'Relaterar musik till kulturella och historiska sammanhang' } },
      { id: 'reasons-significance-impact', label: { en: 'Reasons about significance and impact', sv: 'Resonerar om musikens betydelse och påverkan' } },
    ],
  },
];

export const musicTeachingUnits = musicCurriculumAreas.map((area, index) => ({
  id: area.id,
  label: area.label,
  curriculumAreaIds: [area.id],
  defaultAbilityIds: area.observationDimensions.map((dimension) => dimension.id),
  order: index + 1,
}));
