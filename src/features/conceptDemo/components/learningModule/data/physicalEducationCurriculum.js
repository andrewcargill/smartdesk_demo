export const physicalEducationCurriculumAreas = [
  {
    id: 'movement-adaption',
    label: { en: 'Movement and adaption', sv: 'Rörelse och anpassning' },
    observationDimensions: [
      { id: 'balance-body-control', label: { en: 'Balance and body control', sv: 'Balans och kroppskontroll' } },
      { id: 'coordination', label: { en: 'Coordination', sv: 'Koordination' } },
      { id: 'timing-rhythm', label: { en: 'Timing and rhythm', sv: 'Timing och rytm' } },
      { id: 'precision-movement-control', label: { en: 'Precision and movement control', sv: 'Precision och rörelsekontroll' } },
      { id: 'adaptation-purpose-feedback', label: { en: 'Adaptation to purpose and feedback', sv: 'Anpassning till syfte och feedback' } },
    ],
  },
  {
    id: 'outdoor-activities-adaption',
    label: { en: 'Outdoor activities and adaption', sv: 'Friluftsliv och anpassning' },
    observationDimensions: [
      { id: 'navigation-orientation', label: { en: 'Navigation and orientation', sv: 'Navigering och orientering' } },
      { id: 'adaptation-environment-conditions', label: { en: 'Adaptation to environment and conditions', sv: 'Anpassning till miljö och förhållanden' } },
      { id: 'practical-outdoor-skills', label: { en: 'Practical outdoor skills', sv: 'Praktiska friluftsfärdigheter' } },
      { id: 'responsibility-preparedness', label: { en: 'Responsibility and preparedness', sv: 'Ansvar och beredskap' } },
      { id: 'sustainable-choices-outdoors', label: { en: 'Sustainable choices outdoors', sv: 'Hållbara val utomhus' } },
    ],
  },
  {
    id: 'planning-implementation',
    label: { en: 'Planning and implementation', sv: 'Planering och genomförande' },
    observationDimensions: [
      { id: 'sets-appropriate-goal', label: { en: 'Sets an appropriate goal', sv: 'Sätter ett lämpligt mål' } },
      { id: 'selects-suitable-activities-methods', label: { en: 'Selects suitable activities or methods', sv: 'Väljer lämpliga aktiviteter eller metoder' } },
      { id: 'creates-workable-plan', label: { en: 'Creates a workable plan', sv: 'Skapar en fungerande plan' } },
      { id: 'carries-out-plan', label: { en: 'Carries out the plan', sv: 'Genomför planen' } },
      { id: 'adjusts-plan-when-needed', label: { en: 'Adjusts the plan when needed', sv: 'Anpassar planen vid behov' } },
    ],
  },
  {
    id: 'evaluation-health',
    label: { en: 'Evaluation and health', sv: 'Utvärdering och hälsa' },
    observationDimensions: [
      { id: 'describes-effects-activity', label: { en: 'Describes effects of activity', sv: 'Beskriver effekter av aktivitet' } },
      { id: 'explains-relationships-affecting-health', label: { en: 'Explains relationships affecting health', sv: 'Förklarar samband som påverkar hälsa' } },
      { id: 'uses-relevant-concepts', label: { en: 'Uses relevant concepts', sv: 'Använder relevanta begrepp' } },
      { id: 'evaluates-choices-outcomes', label: { en: 'Evaluates choices and outcomes', sv: 'Utvärderar val och resultat' } },
      { id: 'suggests-relevant-improvements', label: { en: 'Suggests relevant improvements', sv: 'Föreslår relevanta förbättringar' } },
    ],
  },
  {
    id: 'safety-risk-management',
    label: { en: 'Safety and risk management', sv: 'Säkerhet och riskhantering' },
    observationDimensions: [
      { id: 'identifies-risks', label: { en: 'Identifies risks', sv: 'Identifierar risker' } },
      { id: 'prepares-appropriately', label: { en: 'Prepares appropriately', sv: 'Förbereder sig på lämpligt sätt' } },
      { id: 'uses-equipment-methods-safely', label: { en: 'Uses equipment and methods safely', sv: 'Använder utrustning och metoder säkert' } },
      { id: 'adapts-actions-conditions', label: { en: 'Adapts actions to conditions', sv: 'Anpassar handlingar efter förhållanden' } },
      { id: 'responds-appropriately', label: { en: 'Responds appropriately when something happens', sv: 'Agerar lämpligt när något händer' } },
    ],
  },
  {
    id: 'swimming-emergencies',
    label: { en: 'Swimming and emergencies', sv: 'Simning och nödsituationer' },
    observationDimensions: [
      { id: 'continuous-swimming-ability', label: { en: 'Continuous swimming ability', sv: 'Simma sammanhängande' } },
      { id: 'swimming-technique-control', label: { en: 'Swimming technique and control', sv: 'Simteknik och kontroll' } },
      { id: 'water-safety', label: { en: 'Water safety', sv: 'Vattensäkerhet' } },
      { id: 'emergency-action-land', label: { en: 'Emergency action on land', sv: 'Nödåtgärder på land' } },
      { id: 'emergency-action-water', label: { en: 'Emergency action in water', sv: 'Nödåtgärder i vatten' } },
    ],
  },
];

export const physicalEducationTeachingUnits = physicalEducationCurriculumAreas.map((area, index) => ({
  id: area.id,
  label: area.label,
  curriculumAreaIds: [area.id],
  defaultAbilityIds: area.observationDimensions.map((dimension) => dimension.id),
  order: index + 1,
}));
