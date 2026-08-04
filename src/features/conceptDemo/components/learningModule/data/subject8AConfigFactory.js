import { class8AProfile, class8AStudents } from '../../../data/classes/class8AStudents.js';
import { getSubjectDefinition } from '../../../data/subjectCatalogue.js';
import { resolveLocalizedValue } from '../../../i18n/conceptDemoTranslations.js';
import { physicalEducationLearningContexts } from './physicalEducationLearningContexts.js';

const navigation = {
  defaultScreen: 'class-picture',
  items: [
    { id: 'class-picture', label: { en: 'Class picture', sv: 'Klassbild' } },
    { id: 'plan', label: { en: 'Plan', sv: 'Planering' } },
    { id: 'now', label: { en: 'Now', sv: 'Nu' } },
    { id: 'assessment', label: { en: 'Assessment', sv: 'Bed\u00f6mning' } },
  ],
};

const subjectBlueprints = {
  english: {
    areas: [
      ['listening-reception', 'Listening', 'Lyssna'],
      ['reading-reception', 'Reading', 'L\u00e4sa'],
      ['speaking-production-interaction', 'Speaking', 'Tala'],
      ['writing-production-interaction', 'Writing', 'Skriva'],
    ],
    skills: [
      ['spoken-language-main-content-details', 'Understand main content and clear details in spoken English', 'F\u00f6rst\u00e5 huvudsakligt inneh\u00e5ll och tydliga detaljer i talad engelska'],
      ['text-main-content-details', 'Understand main content and clear details in texts', 'F\u00f6rst\u00e5 huvudsakligt inneh\u00e5ll och tydliga detaljer i texter'],
      ['source-selection-use', 'Select, evaluate and use spoken and written sources', 'V\u00e4lja, v\u00e4rdera och anv\u00e4nda muntliga och skriftliga k\u00e4llor'],
      ['oral-presentation-coherence', 'Oral presentation: clarity and coherence', 'Muntlig framst\u00e4llning: tydlighet och sammanhang'],
      ['written-presentation-coherence', 'Written presentation: clarity and coherence', 'Skriftlig framst\u00e4llning: tydlighet och sammanhang'],
      ['interaction-purpose-audience-situation', 'Interaction adapted to purpose, audience and situation', 'Interaktion anpassad till syfte, mottagare och situation'],
      ['communication-strategies', 'Strategies that support and improve communication', 'Strategier som underl\u00e4ttar och f\u00f6rb\u00e4ttrar kommunikationen'],
      ['english-speaking-contexts', 'Discuss contexts and areas where English is used', 'Diskutera sammanhang och omr\u00e5den d\u00e4r engelska anv\u00e4nds'],
    ],
    unitTitles: [
      ['Listening', 'Lyssna'],
      ['Reading', 'L\u00e4sa'],
      ['Speaking', 'Tala'],
      ['Writing', 'Skriva'],
    ],
  },
  mathematics: {
    areas: [
      ['number', 'Number', 'Tal'],
      ['algebra', 'Algebra', 'Algebra'],
      ['geometry', 'Geometry', 'Geometri'],
      ['problem-solving', 'Problem solving', 'Probleml\u00f6sning'],
    ],
    skills: [
      ['methods', 'Methods', 'Metoder'],
      ['reasoning', 'Reasoning', 'Resonemang'],
      ['communication', 'Communication', 'Kommunikation'],
      ['concepts', 'Concepts', 'Begrepp'],
    ],
    unitTitles: [
      ['Fractions and percentages', 'Br\u00e5k och procent'],
      ['Algebra patterns', 'Algebraiska m\u00f6nster'],
      ['Geometry reasoning', 'Geometriska resonemang'],
    ],
  },
  science: {
    areas: [
      ['forces', 'Forces', 'Krafter'],
      ['energy', 'Energy', 'Energi'],
      ['investigation', 'Investigation', 'Unders\u00f6kning'],
      ['ecosystems', 'Ecosystems', 'Ekosystem'],
    ],
    skills: [
      ['hypothesis', 'Hypothesis', 'Hypotes'],
      ['method', 'Method', 'Metod'],
      ['analysis', 'Analysis', 'Analys'],
      ['explanation', 'Explanation', 'F\u00f6rklaring'],
    ],
    unitTitles: [
      ['Forces in motion', 'Krafter i r\u00f6relse'],
      ['Energy transfer', 'Energiomvandling'],
      ['Ecosystem investigation', 'Ekosystemunders\u00f6kning'],
    ],
  },
  swedish: {
    areas: [
      ['reading', 'Reading', 'L\u00e4sa'],
      ['writing', 'Writing', 'Skriva'],
      ['speaking', 'Speaking', 'Tala'],
      ['language', 'Language', 'Spr\u00e5k'],
    ],
    skills: [
      ['interpretation', 'Interpretation', 'Tolkning'],
      ['structure', 'Structure', 'Struktur'],
      ['argument', 'Argument', 'Argument'],
      ['presentation', 'Presentation', 'Presentation'],
    ],
    unitTitles: [
      ['Reading strategies', 'L\u00e4sstrategier'],
      ['Argument writing', 'Argumenterande text'],
      ['Oral presentation', 'Muntlig presentation'],
    ],
  },
  history: {
    areas: [
      ['source-criticism', 'Source criticism', 'K\u00e4llkritik'],
      ['change', 'Change', 'F\u00f6r\u00e4ndring'],
      ['cause', 'Cause and consequence', 'Orsak och konsekvens'],
      ['perspective', 'Perspective', 'Perspektiv'],
    ],
    skills: [
      ['evidence-use', 'Use evidence', 'Anv\u00e4nda k\u00e4llor'],
      ['chronology', 'Chronology', 'Kronologi'],
      ['comparison', 'Comparison', 'J\u00e4mf\u00f6relse'],
      ['explanation', 'Explanation', 'F\u00f6rklaring'],
    ],
    unitTitles: [
      ['Source criticism', 'K\u00e4llkritik'],
      ['Industrialisation', 'Industrialiseringen'],
      ['Democracy development', 'Demokratins utveckling'],
    ],
  },
  music: {
    areas: [
      ['performance-security', 'Singing and playing security', 'S\u00e5ng- och spels\u00e4kerhet'],
      ['ensemble-adaptation', 'Musical ensemble and adaptation', 'Musikaliskt samspel och anpassning'],
      ['musical-expression', 'Musical expression and interpretation', 'Musikaliskt uttryck och gestaltning'],
      ['composition-form', 'Composition and musical form', 'Komposition och musikalisk form'],
      ['characteristics-comparison', 'Musical characteristics and comparison', 'Musikaliska karakt\u00e4rsdrag och j\u00e4mf\u00f6relse'],
      ['content-function-significance', 'Musical content, function and significance', 'Musikens inneh\u00e5ll, funktion och betydelse'],
    ],
    skills: [
      ['pulse-rhythm', 'Pulse and rhythm', 'Puls och rytm'],
      ['pitch-melodic-security', 'Pitch and melodic security', 'Tonh\u00f6jd och melodisk s\u00e4kerhet'],
      ['instrument-singing-technique', 'Instrument or singing technique', 'Instrument- eller s\u00e5ngteknik'],
      ['timing-continuity', 'Timing and continuity', 'Tajming och kontinuitet'],
      ['own-part-security', 'Security in own part', 'S\u00e4kerhet i den egna st\u00e4mman'],
      ['responsiveness', 'Responsiveness', 'Lyh\u00f6rdhet'],
      ['shared-pulse-tempo-adaptation', 'Adaptation to shared pulse and tempo', 'Anpassning till gemensam puls och tempo'],
      ['dynamics-balance-adaptation', 'Adaptation of dynamics and balance', 'Anpassning av dynamik och balans'],
      ['musical-form-adaptation', 'Adaptation to musical form', 'Anpassning till musikalisk form'],
      ['genre-character-adaptation', 'Adaptation to genre and character', 'Anpassning till genre och karakt\u00e4r'],
      ['communicates-musical-idea', 'Communicates a musical idea', 'Kommunicerar en musikalisk id\u00e9'],
      ['uses-musical-building-blocks', 'Uses musical building blocks', 'Anv\u00e4nder musikaliska byggstenar'],
      ['expressive-musical-choices', 'Makes expressive musical choices', 'G\u00f6r uttrycksfulla musikaliska val'],
      ['improvises-tests-ideas', 'Improvises and tests ideas', 'Improviserar och pr\u00f6var id\u00e9er'],
      ['develops-expression', 'Processes and develops expression', 'Bearbetar och utvecklar uttrycket'],
      ['creates-musical-material', 'Creates musical material', 'Skapar musikaliskt material'],
      ['organises-functional-form', 'Organises material in a functional form', 'Organiserar material i en fungerande form'],
      ['connects-musical-parts', 'Creates links between musical parts', 'Skapar samband mellan musikens delar'],
      ['uses-style-features', 'Uses style-specific features', 'Anv\u00e4nder stiltypiska drag'],
      ['revises-composition', 'Revises the composition', 'Bearbetar kompositionen'],
      ['identifies-musical-characteristics', 'Identifies musical characteristics', 'Identifierar musikaliska karakt\u00e4rsdrag'],
      ['identifies-instruments-vocal-expression', 'Identifies instruments and vocal expression', 'Identifierar instrument och vokala uttryck'],
      ['uses-relevant-musical-concepts', 'Uses relevant musical concepts', 'Anv\u00e4nder relevanta musikbegrepp'],
      ['compares-musical-examples', 'Compares musical examples', 'J\u00e4mf\u00f6r musikexempel'],
      ['connects-characteristics-genre-period', 'Connects characteristics to genre or period', 'Kopplar karakt\u00e4rsdrag till genre eller tidsperiod'],
      ['interprets-content-expression', 'Interprets musical content and expression', 'Tolkar musikens inneh\u00e5ll och uttryck'],
      ['explains-musical-function', 'Explains musical function', 'F\u00f6rklarar musikens funktion'],
      ['relates-music-identity-social-contexts', 'Relates music to identity and social contexts', 'Relaterar musik till identitet och sociala sammanhang'],
      ['relates-music-cultural-historical-contexts', 'Relates music to cultural and historical contexts', 'Relaterar musik till kulturella och historiska sammanhang'],
      ['reasons-significance-impact', 'Reasons about significance and impact', 'Resonerar om musikens betydelse och p\u00e5verkan'],
    ],
    unitTitles: [
      ['Singing and playing security', 'S\u00e5ng- och spels\u00e4kerhet'],
      ['Musical ensemble and adaptation', 'Musikaliskt samspel och anpassning'],
      ['Musical expression and interpretation', 'Musikaliskt uttryck och gestaltning'],
      ['Composition and musical form', 'Komposition och musikalisk form'],
      ['Musical characteristics and comparison', 'Musikaliska karakt\u00e4rsdrag och j\u00e4mf\u00f6relse'],
      ['Musical content, function and significance', 'Musikens inneh\u00e5ll, funktion och betydelse'],
    ],
    unitSkillIds: {
      'performance-security': ['pulse-rhythm', 'pitch-melodic-security', 'instrument-singing-technique', 'timing-continuity', 'own-part-security'],
      'ensemble-adaptation': ['responsiveness', 'shared-pulse-tempo-adaptation', 'dynamics-balance-adaptation', 'musical-form-adaptation', 'genre-character-adaptation'],
      'musical-expression': ['communicates-musical-idea', 'uses-musical-building-blocks', 'expressive-musical-choices', 'improvises-tests-ideas', 'develops-expression'],
      'composition-form': ['creates-musical-material', 'organises-functional-form', 'connects-musical-parts', 'uses-style-features', 'revises-composition'],
      'characteristics-comparison': ['identifies-musical-characteristics', 'identifies-instruments-vocal-expression', 'uses-relevant-musical-concepts', 'compares-musical-examples', 'connects-characteristics-genre-period'],
      'content-function-significance': ['interprets-content-expression', 'explains-musical-function', 'relates-music-identity-social-contexts', 'relates-music-cultural-historical-contexts', 'reasons-significance-impact'],
    },
  },
  sloyd: {
    areas: [
      ['materials-tools-techniques', 'Materials, tools and craft techniques', 'Sl\u00f6jdens material, verktyg och hantverkstekniker'],
      ['work-processes', 'Craft work processes', 'Sl\u00f6jdens arbetsprocesser'],
      ['expression-sustainability', 'Expression and sustainable development', 'Sl\u00f6jdens uttryck och betydelse f\u00f6r h\u00e5llbar utveckling'],
    ],
    skills: [
      ['design-and-make', 'Design and make objects', 'Formge och framst\u00e4lla f\u00f6rem\u00e5l'],
      ['safe-tool-use', 'Use tools safely and appropriately', 'Anv\u00e4nda verktyg s\u00e4kert och \u00e4ndam\u00e5lsenligt'],
      ['develop-ideas', 'Develop ideas from inspiration', 'Utveckla id\u00e9er utifr\u00e5n inspirationsk\u00e4llor'],
      ['test-material-technique', 'Try and rethink material and technique combinations', 'Pr\u00f6va och ompr\u00f6va material- och teknikkombinationer'],
      ['justify-approach', 'Choose and justify approaches', 'V\u00e4lja och motivera tillv\u00e4gag\u00e5ngss\u00e4tt'],
      ['reflect-quality-expression-environment', 'Reflect on quality, expression and environment', 'Reflektera \u00f6ver kvalitet, uttryck och milj\u00f6'],
    ],
    unitTitles: [
      ['Textile: pattern, construction and function', 'Textilsl\u00f6jd: m\u00f6nster, konstruktion och funktion'],
      ['Wood and metal: form, joining and precision', 'Tr\u00e4- och metallsl\u00f6jd: form, sammanfogning och precision'],
      ['Design process: expression, repair and reuse', 'Designprocess: uttryck, reparation och \u00e5terbruk'],
    ],
  },
  'physical-education': {
    areas: [
      ['movement-adaption', 'Movement and adaption', 'R\u00f6relse och anpassning'],
      ['outdoor-activities-adaption', 'Outdoor activities and adaption', 'Friluftsliv och anpassning'],
      ['planning-implementation', 'Planning and implementation', 'Planering och genomf\u00f6rande'],
      ['evaluation-health', 'Evaluation and health', 'Utv\u00e4rdering och h\u00e4lsa'],
      ['safety-risk-management', 'Safety and risk management', 'S\u00e4kerhet och riskhantering'],
      ['swimming-emergencies', 'Swimming and emergencies', 'Simning och n\u00f6dsituationer'],
    ],
    skills: [
      ['balance-body-control', 'Balance and body control', 'Balans och kroppskontroll'],
      ['coordination', 'Coordination', 'Koordination'],
      ['timing-rhythm', 'Timing and rhythm', 'Timing och rytm'],
      ['precision-movement-control', 'Precision and movement control', 'Precision och r\u00f6relsekontroll'],
      ['adaptation-purpose-feedback', 'Adaptation to purpose and feedback', 'Anpassning till syfte och feedback'],
      ['navigation-orientation', 'Navigation and orientation', 'Navigering och orientering'],
      ['adaptation-environment-conditions', 'Adaptation to environment and conditions', 'Anpassning till milj\u00f6 och f\u00f6rh\u00e5llanden'],
      ['practical-outdoor-skills', 'Practical outdoor skills', 'Praktiska friluftsf\u00e4rdigheter'],
      ['responsibility-preparedness', 'Responsibility and preparedness', 'Ansvar och beredskap'],
      ['sustainable-choices-outdoors', 'Sustainable choices outdoors', 'H\u00e5llbara val utomhus'],
      ['sets-appropriate-goal', 'Sets an appropriate goal', 'S\u00e4tter ett l\u00e4mpligt m\u00e5l'],
      ['selects-suitable-activities-methods', 'Selects suitable activities or methods', 'V\u00e4ljer l\u00e4mpliga aktiviteter eller metoder'],
      ['creates-workable-plan', 'Creates a workable plan', 'Skapar en fungerande plan'],
      ['carries-out-plan', 'Carries out the plan', 'Genomf\u00f6r planen'],
      ['adjusts-plan-when-needed', 'Adjusts the plan when needed', 'Anpassar planen vid behov'],
      ['describes-effects-activity', 'Describes effects of activity', 'Beskriver effekter av aktivitet'],
      ['explains-relationships-affecting-health', 'Explains relationships affecting health', 'F\u00f6rklarar samband som p\u00e5verkar h\u00e4lsa'],
      ['uses-relevant-concepts', 'Uses relevant concepts', 'Anv\u00e4nder relevanta begrepp'],
      ['evaluates-choices-outcomes', 'Evaluates choices and outcomes', 'Utv\u00e4rderar val och resultat'],
      ['suggests-relevant-improvements', 'Suggests relevant improvements', 'F\u00f6resl\u00e5r relevanta f\u00f6rb\u00e4ttringar'],
      ['identifies-risks', 'Identifies risks', 'Identifierar risker'],
      ['prepares-appropriately', 'Prepares appropriately', 'F\u00f6rbereder sig p\u00e5 l\u00e4mpligt s\u00e4tt'],
      ['uses-equipment-methods-safely', 'Uses equipment and methods safely', 'Anv\u00e4nder utrustning och metoder s\u00e4kert'],
      ['adapts-actions-conditions', 'Adapts actions to conditions', 'Anpassar handlingar efter f\u00f6rh\u00e5llanden'],
      ['responds-appropriately', 'Responds appropriately when something happens', 'Agerar l\u00e4mpligt n\u00e4r n\u00e5got h\u00e4nder'],
      ['continuous-swimming-ability', 'Continuous swimming ability', 'Simma sammanh\u00e4ngande'],
      ['swimming-technique-control', 'Swimming technique and control', 'Simteknik och kontroll'],
      ['water-safety', 'Water safety', 'Vattens\u00e4kerhet'],
      ['emergency-action-land', 'Emergency action on land', 'N\u00f6d\u00e5tg\u00e4rder p\u00e5 land'],
      ['emergency-action-water', 'Emergency action in water', 'N\u00f6d\u00e5tg\u00e4rder i vatten'],
    ],
    unitTitles: [
      ['Movement and adaption', 'R\u00f6relse och anpassning'],
      ['Outdoor activities and adaption', 'Friluftsliv och anpassning'],
      ['Planning and implementation', 'Planering och genomf\u00f6rande'],
      ['Evaluation and health', 'Utv\u00e4rdering och h\u00e4lsa'],
      ['Safety and risk management', 'S\u00e4kerhet och riskhantering'],
      ['Swimming and emergencies', 'Simning och n\u00f6dsituationer'],
    ],
    unitSkillIds: {
      'movement-adaption': ['balance-body-control', 'coordination', 'timing-rhythm', 'precision-movement-control', 'adaptation-purpose-feedback'],
      'outdoor-activities-adaption': ['navigation-orientation', 'adaptation-environment-conditions', 'practical-outdoor-skills', 'responsibility-preparedness', 'sustainable-choices-outdoors'],
      'planning-implementation': ['sets-appropriate-goal', 'selects-suitable-activities-methods', 'creates-workable-plan', 'carries-out-plan', 'adjusts-plan-when-needed'],
      'evaluation-health': ['describes-effects-activity', 'explains-relationships-affecting-health', 'uses-relevant-concepts', 'evaluates-choices-outcomes', 'suggests-relevant-improvements'],
      'safety-risk-management': ['identifies-risks', 'prepares-appropriately', 'uses-equipment-methods-safely', 'adapts-actions-conditions', 'responds-appropriately'],
      'swimming-emergencies': ['continuous-swimming-ability', 'swimming-technique-control', 'water-safety', 'emergency-action-land', 'emergency-action-water'],
    },
  },
};

const fallbackBlueprint = subjectBlueprints.science;

const studentProfiles = {
  'elias-nilsson': { pattern: 'improving', previousGrade: 'C', assessmentScores: [12, 8, 11, 13, 15] },
  'freya-wilson': { pattern: 'high', previousGrade: 'B', assessmentScores: [16, 17, 18, 18, 19] },
  'omar-hassan': { pattern: 'struggling', previousGrade: 'C', assessmentScores: [8, 10, 11, 12, 12] },
  'alice-bergstrom': { pattern: 'secure', previousGrade: 'B', assessmentScores: [13, 14, 15, 16, 16] },
  'noor-ahmed': { pattern: 'fragile', previousGrade: 'D', assessmentScores: [9, 10, 12, 12, 13] },
  'william-dahl': { pattern: 'steady', previousGrade: 'C', assessmentScores: [10, 11, 12, 12, 13] },
  'isabella-rossi': { pattern: 'high', previousGrade: 'A', assessmentScores: [18, 18, 19, 20, 20] },
  'benjamin-larsson': { pattern: 'inconsistent', previousGrade: 'C', assessmentScores: [11, 12, 13, 10, 14] },
  'sofia-eriksson': { pattern: 'secure', previousGrade: 'B', assessmentScores: [14, 15, 16, 16, 17] },
  'lucas-martin': { pattern: 'struggling', previousGrade: 'D', assessmentScores: [7, 9, 10, 11, 12] },
};

const evidenceDates = ['2026-01-22', '2026-02-12', '2026-03-12', '2026-04-16', '2026-05-14'];
const assessmentDates = ['2026-01-30', '2026-02-27', '2026-03-27', '2026-04-24', '2026-05-16'];
const absentAssessments = {
  'freya-wilson': [2],
  'william-dahl': [3],
  'benjamin-larsson': [1],
};
const learningObservationWindows = {
  high: [
    { date: '2026-02-12', participation: '+', note: 'confident peer discussion' },
    { date: '2026-05-14', independence: '+', note: 'ready for extension' },
  ],
  secure: [
    { date: '2026-01-22', focus: '0', note: 'settling into routines' },
    { date: '2026-03-12', participation: '+', note: 'steady contribution' },
    { date: '2026-05-14', independence: '+', note: 'works with little prompting' },
  ],
  steady: [
    { date: '2026-01-22', focus: '0', note: 'needs occasional reminder' },
    { date: '2026-04-16', independence: '0', note: 'uses models appropriately' },
  ],
  improving: [
    { date: '2026-01-22', focus: '-', note: 'hard to begin without scaffolding' },
    { date: '2026-02-12', independence: '-', note: 'waited for adult check-in' },
    { date: '2026-03-12', focus: '0', participation: '0', note: 'starting to act on feedback' },
    { date: '2026-04-16', independence: '0', note: 'attempted next step before asking' },
    { date: '2026-05-14', focus: '+', note: 'clear improvement in lesson stamina' },
  ],
  fragile: [
    { date: '2026-01-15', focus: '-', note: 'initial concern logged' },
    { date: '2026-01-22', independence: '-', note: 'needed start-up support' },
    { date: '2026-02-05', participation: '0', note: 'responded in pair work' },
    { date: '2026-02-12', focus: '-', independence: '-', note: 'pattern still unclear' },
    { date: '2026-03-12', focus: '0', note: 'more settled after seating change' },
    { date: '2026-04-16', independence: '0', note: 'can complete a defined step' },
    { date: '2026-05-14', participation: '+', note: 'positive contribution today' },
  ],
  inconsistent: [
    { date: '2026-01-22', participation: '+', note: 'strong start' },
    { date: '2026-02-12', focus: '-', note: 'lost task thread' },
    { date: '2026-03-12', independence: '0', note: 'recovered with checklist' },
    { date: '2026-04-16', participation: '+', note: 'good paired work' },
    { date: '2026-05-14', focus: '0', note: 'still uneven across lessons' },
  ],
  struggling: [
    { date: '2026-01-15', focus: '-', independence: '-', note: 'intensive observation started' },
    { date: '2026-01-22', focus: '-', note: 'needed frequent prompts' },
    { date: '2026-02-05', participation: '-', independence: '-', note: 'avoided independent step' },
    { date: '2026-02-12', focus: '-', participation: '0', note: 'brief paired contribution' },
    { date: '2026-03-05', independence: '-', note: 'still waits for confirmation' },
    { date: '2026-03-12', focus: '0', note: 'completed reduced target' },
    { date: '2026-04-16', participation: '0', note: 'more willing to ask for help' },
    { date: '2026-05-07', focus: '0', independence: '0', note: 'support plan showing small effect' },
    { date: '2026-05-14', independence: '0', note: 'still needs structured next steps' },
  ],
};

const physicalEducationEliasObservationDates = [
  '2026-01-15',
  '2026-01-20',
  '2026-01-22',
  '2026-01-29',
  '2026-02-05',
  '2026-02-12',
  '2026-02-19',
  '2026-02-26',
  '2026-03-03',
  '2026-03-05',
  '2026-03-10',
  '2026-03-12',
  '2026-03-17',
  '2026-03-19',
  '2026-03-24',
  '2026-03-26',
  '2026-03-31',
  '2026-04-02',
  '2026-04-07',
  '2026-04-09',
  '2026-04-14',
  '2026-04-16',
  '2026-04-21',
  '2026-04-23',
  '2026-04-28',
  '2026-04-30',
  '2026-05-07',
  '2026-05-14',
  '2026-05-21',
  '2026-05-28',
];

const physicalEducationEliasObservationPattern = [
  { focus: '0', participation: '+', note: 'positive start in team activity' },
  { independence: '0', note: 'uses paired model before acting' },
  { focus: '0', participation: '0', note: 'needs reminder during transition' },
  { participation: '+', independence: '0', note: 'more active in small-sided play' },
  { focus: '+', note: 'settled during outdoor preparation' },
  { independence: '0', note: 'uses map routine with check-in' },
  { focus: '+', participation: '+', note: 'strong practical outdoor contribution' },
  { independence: '+', note: 'prepares equipment without prompt' },
  { focus: '-', participation: '-', note: 'dance unit dip begins' },
  { independence: '-', note: 'waits outside group task' },
  { focus: '-', participation: '-', note: 'does not engage in sequence practice' },
  { participation: '0', note: 'brief paired contribution after prompt' },
  { focus: '-', independence: '-', note: 'guardian meeting workflow opened' },
  { participation: '-', note: 'avoids performance rehearsal' },
  { focus: '0', note: 'returns after agreed check-in routine' },
  { participation: '0', independence: '0', note: 'first high jump attempt with support' },
  { focus: '0', participation: '+', note: 'responds to clear technical cue' },
  { independence: '0', note: 'asks for feedback before next attempt' },
  { focus: '+', participation: '+', note: 'visible confidence in approach practice' },
  { independence: '0', note: 'adjusts technique after feedback' },
  { focus: '+', note: 'sustained effort through jump sequence' },
  { participation: '+', independence: '+', note: 'works independently at station' },
  { focus: '+', note: 'sets realistic training goal' },
  { independence: '+', note: 'chooses suitable intensity with minimal prompt' },
  { participation: '+', note: 'explains adjustment to partner' },
  { focus: '+', independence: '+', note: 'ready to return to normal observation rhythm' },
  { participation: '+', note: 'confident contribution in swimming warm-up' },
  { focus: '+', independence: '0', note: 'checks routine before distance swim' },
  { participation: '+', independence: '+', note: 'supports partner during water safety task' },
  { focus: '+', independence: '+', note: 'sustains effort across full lesson block' },
];

const levelProgressions = {
  high: ['secure', 'advanced', 'advanced', 'advanced', 'advanced'],
  secure: ['developing', 'secure', 'secure', 'secure', 'advanced'],
  steady: ['developing', 'developing', 'secure', 'secure', 'secure'],
  improving: ['emerging', 'developing', 'developing', 'secure', 'secure'],
  fragile: ['emerging', 'emerging', 'developing', 'developing', 'secure'],
  inconsistent: ['developing', 'emerging', 'developing', 'secure', 'developing'],
  struggling: ['emerging', 'emerging', 'emerging', 'developing', 'developing'],
};

const sloydObservationText = {
  high: {
    en: ['combined material and technique with precision', 'used tools safely and efficiently', 'developed the idea from inspiration independently', 'reworked a construction choice after testing', 'explained quality, expression and environmental impact clearly'],
    sv: ['kombinerade material och teknik med precision', 'anv\u00e4nde verktyg s\u00e4kert och effektivt', 'utvecklade id\u00e9n sj\u00e4lvst\u00e4ndigt utifr\u00e5n inspiration', 'omarbetade ett konstruktionsval efter pr\u00f6vning', 'f\u00f6rklarade kvalitet, uttryck och milj\u00f6p\u00e5verkan tydligt'],
  },
  secure: {
    en: ['made a functional object with appropriate technique', 'used tools safely and purposefully', 'developed the sketch into a workable plan', 'adjusted material choices after feedback', 'reflected on quality and sustainability in a developed way'],
    sv: ['framst\u00e4llde ett funktionellt f\u00f6rem\u00e5l med l\u00e4mplig teknik', 'anv\u00e4nde verktyg s\u00e4kert och \u00e4ndam\u00e5lsenligt', 'utvecklade skissen till en fungerande plan', 'justerade materialval efter feedback', 'reflekterade utvecklat \u00f6ver kvalitet och h\u00e5llbarhet'],
  },
  steady: {
    en: ['followed the work plan with some reminders', 'handled tools safely after a check-in', 'made a clear but simple design choice', 'tested a join or seam before continuing', 'described how the process affected the result'],
    sv: ['f\u00f6ljde arbetsplanen med n\u00e5gra p\u00e5minnelser', 'hanterade verktyg s\u00e4kert efter avst\u00e4mning', 'gjorde ett tydligt men enkelt formgivningsval', 'pr\u00f6vade en sammanfogning eller s\u00f6m innan arbetet fortsatte', 'beskrev hur processen p\u00e5verkade resultatet'],
  },
  improving: {
    en: ['needed support to choose technique at first', 'became more secure with tools over time', 'used feedback to improve the pattern or model', 'started testing alternatives before deciding', 'showed stronger reflection than earlier in the term'],
    sv: ['beh\u00f6vde f\u00f6rst st\u00f6d f\u00f6r att v\u00e4lja teknik', 'blev s\u00e4krare med verktygen \u00f6ver tid', 'anv\u00e4nde feedback f\u00f6r att f\u00f6rb\u00e4ttra m\u00f6nstret eller modellen', 'b\u00f6rjade pr\u00f6va alternativ innan beslut', 'visade starkare reflektion \u00e4n tidigare under terminen'],
  },
  fragile: {
    en: ['needed close scaffolding to begin making', 'used tools safely with adult proximity', 'kept the design idea simple to make progress', 'completed part of the object with support', 'began to connect material choice with function'],
    sv: ['beh\u00f6vde n\u00e4ra st\u00f6ttning f\u00f6r att komma ig\u00e5ng med framst\u00e4llningen', 'anv\u00e4nde verktyg s\u00e4kert med vuxen n\u00e4ra', 'h\u00f6ll formid\u00e9n enkel f\u00f6r att komma vidare', 'genomf\u00f6rde delar av f\u00f6rem\u00e5let med st\u00f6d', 'b\u00f6rjade koppla materialval till funktion'],
  },
  inconsistent: {
    en: ['started the practical work well but lost process focus', 'missed a measurement or safety routine', 'recovered after revisiting the work plan', 'made a stronger material decision after testing', 'needs more consistent reflection during the process'],
    sv: ['startade det praktiska arbetet bra men tappade processfokus', 'missade ett m\u00e5tt eller en s\u00e4kerhetsrutin', '\u00e5terh\u00e4mtade arbetet efter att ha g\u00e5tt tillbaka till arbetsplanen', 'gjorde ett starkare materialval efter pr\u00f6vning', 'beh\u00f6ver mer kontinuerlig reflektion under processen'],
  },
  struggling: {
    en: ['needed close support with the practical sequence', 'found safe and purposeful tool use difficult', 'needed help turning the idea into a workable plan', 'completed a reduced construction task', 'needs guided practice to reflect on quality and environment'],
    sv: ['beh\u00f6vde n\u00e4ra st\u00f6d med den praktiska arbetsg\u00e5ngen', 'hade sv\u00e5rt med s\u00e4ker och \u00e4ndam\u00e5lsenlig verktygsanv\u00e4ndning', 'beh\u00f6vde hj\u00e4lp att g\u00f6ra id\u00e9n till en fungerande plan', 'genomf\u00f6rde en avgr\u00e4nsad konstruktionsuppgift', 'beh\u00f6ver guidad \u00f6vning i att reflektera \u00f6ver kvalitet och milj\u00f6'],
  },
};

function localized(en, sv) {
  return { en, sv };
}

function getSubjectTitle(subjectId) {
  const subject = getSubjectDefinition(subjectId);
  return {
    en: resolveLocalizedValue(subject?.title, 'en', subjectId),
    sv: resolveLocalizedValue(subject?.title, 'sv', subjectId),
  };
}

function getBlueprint(subjectId) {
  return subjectBlueprints[subjectId] || fallbackBlueprint;
}

function translateLearningObservationNote(note) {
  const translations = {
    'confident peer discussion': 's\u00e4ker diskussion med klasskamrat',
    'ready for extension': 'redo f\u00f6r utmaning',
    'settling into routines': 'kommer in i rutinerna',
    'steady contribution': 'stabilt bidrag',
    'works with little prompting': 'arbetar med lite st\u00f6d',
    'needs occasional reminder': 'beh\u00f6ver enstaka p\u00e5minnelse',
    'uses models appropriately': 'anv\u00e4nder modeller p\u00e5 ett l\u00e4mpligt s\u00e4tt',
    'hard to begin without scaffolding': 'sv\u00e5rt att komma ig\u00e5ng utan st\u00f6ttning',
    'waited for adult check-in': 'v\u00e4ntade p\u00e5 vuxen avst\u00e4mning',
    'starting to act on feedback': 'b\u00f6rjar agera p\u00e5 feedback',
    'attempted next step before asking': 'pr\u00f6vade n\u00e4sta steg innan hen fr\u00e5gade',
    'clear improvement in lesson stamina': 'tydlig f\u00f6rb\u00e4ttring i lektionsuth\u00e5llighet',
    'initial concern logged': 'initial oro noterad',
    'needed start-up support': 'beh\u00f6vde startst\u00f6d',
    'responded in pair work': 'svarade i pararbete',
    'pattern still unclear': 'm\u00f6nstret \u00e4r fortfarande oklart',
    'more settled after seating change': 'mer stabil efter placerings\u00e4ndring',
    'can complete a defined step': 'kan genomf\u00f6ra ett avgr\u00e4nsat steg',
    'positive contribution today': 'positivt bidrag idag',
    'strong start': 'stark start',
    'lost task thread': 'tappade uppgiftstr\u00e5den',
    'recovered with checklist': '\u00e5terh\u00e4mtade arbetet med checklista',
    'good paired work': 'bra pararbete',
    'still uneven across lessons': 'fortfarande oj\u00e4mn mellan lektioner',
    'intensive observation started': 'intensiv observation startad',
    'needed frequent prompts': 'beh\u00f6vde t\u00e4ta p\u00e5minnelser',
    'avoided independent step': 'undvek sj\u00e4lvst\u00e4ndigt steg',
    'brief paired contribution': 'kort bidrag i pararbete',
    'still waits for confirmation': 'v\u00e4ntar fortfarande p\u00e5 bekr\u00e4ftelse',
    'completed reduced target': 'genomf\u00f6rde avgr\u00e4nsat m\u00e5l',
    'more willing to ask for help': 'mer villig att be om hj\u00e4lp',
    'support plan showing small effect': 'st\u00f6dplanen visar liten effekt',
    'still needs structured next steps': 'beh\u00f6ver fortfarande strukturerade n\u00e4sta steg',
    'watching response after failed movement checkpoint': 'f\u00f6ljer upp respons efter ej godk\u00e4nd r\u00f6relsekontroll',
    'waits for adult confirmation before starting activity': 'v\u00e4ntar p\u00e5 vuxen bekr\u00e4ftelse innan aktivitet startas',
    'joins warm-up but avoids main task': 'deltar i uppv\u00e4rmning men undviker huvuduppgiften',
    'focus improves with visual sequence': 'fokus f\u00f6rb\u00e4ttras med visuell ordningsf\u00f6ljd',
    'works better with paired model': 'arbetar b\u00e4ttre med parmodell',
    'starts first step independently': 'startar f\u00f6rsta steget sj\u00e4lvst\u00e4ndigt',
    'sustained effort through practical circuit': 'h\u00e5ller i anstr\u00e4ngningen genom praktisk cirkel',
    'still checks before changing activity': 'st\u00e4mmer fortfarande av innan aktivitetsbyte',
    'loses rhythm when task changes quickly': 'tappar rytm n\u00e4r uppgiften byter snabbt',
    'takes part more fully in small-sided activity': 'deltar mer fullt i mindre spelaktivitet',
    'needs prompt to choose suitable intensity': 'beh\u00f6ver p\u00e5minnelse f\u00f6r att v\u00e4lja l\u00e4mplig intensitet',
    'responds well to clear station routine': 'svarar bra p\u00e5 tydlig stationsrutin',
    'uses feedback to adjust technique': 'anv\u00e4nder feedback f\u00f6r att justera teknik',
    'asks for help instead of withdrawing': 'ber om hj\u00e4lp i st\u00e4llet f\u00f6r att dra sig undan',
    'keeps attention across full lesson block': 'h\u00e5ller uppm\u00e4rksamheten genom hela lektionspasset',
    'prepares equipment and starts without prompt': 'f\u00f6rbereder utrustning och startar utan p\u00e5minnelse',
    'confident contribution in paired practice': 's\u00e4kert bidrag i par\u00f6vning',
    'ready to return to normal observation rhythm': 'redo att \u00e5terg\u00e5 till normal observationsrytm',
    'positive start in team activity': 'positiv start i lagaktivitet',
    'uses paired model before acting': 'anv\u00e4nder parmodell innan handling',
    'needs reminder during transition': 'beh\u00f6ver p\u00e5minnelse vid \u00f6verg\u00e5ng',
    'more active in small-sided play': 'mer aktiv i mindre spel',
    'settled during outdoor preparation': 'stabil under friluftsf\u00f6rberedelse',
    'uses map routine with check-in': 'anv\u00e4nder kartrutin med avst\u00e4mning',
    'strong practical outdoor contribution': 'starkt praktiskt bidrag utomhus',
    'dance unit dip begins': 'svacka i dansmomentet inleds',
    'waits outside group task': 'v\u00e4ntar utanf\u00f6r gruppuppgiften',
    'does not engage in sequence practice': 'deltar inte i sekvens\u00f6vningen',
    'guardian meeting workflow opened': 'arbetsfl\u00f6de f\u00f6r v\u00e5rdnadshavarm\u00f6te \u00f6ppnat',
    'avoids performance rehearsal': 'undviker framtr\u00e4dande\u00f6vning',
    'returns after agreed check-in routine': '\u00e5terkommer efter \u00f6verenskommen avst\u00e4mningsrutin',
    'first high jump attempt with support': 'f\u00f6rsta h\u00f6jdhoppsf\u00f6rs\u00f6k med st\u00f6d',
    'responds to clear technical cue': 'svarar p\u00e5 tydlig teknisk instruktion',
    'asks for feedback before next attempt': 'ber om feedback inf\u00f6r n\u00e4sta f\u00f6rs\u00f6k',
    'visible confidence in approach practice': 'synligt sj\u00e4lvf\u00f6rtroende i ansats\u00f6vning',
    'sustained effort through jump sequence': 'h\u00e5ller i anstr\u00e4ngningen genom hoppsekvens',
    'works independently at station': 'arbetar sj\u00e4lvst\u00e4ndigt vid station',
    'sets realistic training goal': 's\u00e4tter realistiskt tr\u00e4ningsm\u00e5l',
    'chooses suitable intensity with minimal prompt': 'v\u00e4ljer l\u00e4mplig intensitet med liten p\u00e5minnelse',
    'explains adjustment to partner': 'f\u00f6rklarar justering f\u00f6r partner',
    'confident contribution in swimming warm-up': 's\u00e4kert bidrag i simuppv\u00e4rmning',
    'checks routine before distance swim': 'st\u00e4mmer av rutin f\u00f6re distanssimning',
    'supports partner during water safety task': 'st\u00f6ttar partner under vattens\u00e4kerhetsuppgift',
    'sustains effort across full lesson block': 'h\u00e5ller i anstr\u00e4ngningen under hela lektionspasset',
  };

  return translations[note] || note;
}

function buildPhysicalEducationEliasObservationWindows() {
  return physicalEducationEliasObservationDates.map((date, index) => ({
    date,
    ...physicalEducationEliasObservationPattern[index % physicalEducationEliasObservationPattern.length],
  }));
}

function getLearningObservationWindows(subjectId, student, profile) {
  if (subjectId === 'physical-education' && student.id === 'elias-nilsson') {
    return buildPhysicalEducationEliasObservationWindows();
  }

  return learningObservationWindows[profile.pattern] || learningObservationWindows.steady;
}

function buildCurriculum(subjectId) {
  const blueprint = getBlueprint(subjectId);
  const areas = blueprint.areas.map(([id, en, sv], index) => ({
    id,
    title: localized(en, sv),
    label: localized(en, sv),
    order: index + 1,
  }));
  const skills = blueprint.skills.map(([id, en, sv], index) => ({
    id,
    title: localized(en, sv),
    label: localized(en, sv),
    order: index + 1,
  }));
  const teachingUnits = blueprint.unitTitles.map(([en, sv], index) => {
    const area = areas[index % areas.length];
    const unitSkills = skills.slice(index, index + 3);
    const configuredUnitSkillIds = blueprint.unitSkillIds?.[area.id] || null;

    return {
      id: area.id,
      title: localized(en, sv),
      label: localized(en, sv),
      curriculumAreaId: area.id,
      skillIds: configuredUnitSkillIds || (unitSkills.length ? unitSkills.map((skill) => skill.id) : skills.slice(0, 3).map((skill) => skill.id)),
      order: index + 1,
    };
  });

  return {
    areas,
    skills,
    observationLevels: [
      { id: 'emerging', label: localized('Emerging', 'P\u00e5 v\u00e4g'), order: 1 },
      { id: 'developing', label: localized('Developing', 'Utvecklas'), order: 2 },
      { id: 'secure', label: localized('Secure', 'S\u00e4ker'), order: 3 },
      { id: 'advanced', label: localized('Advanced', 'Avancerad'), order: 4 },
    ],
    teachingUnits,
  };
}

function buildLessonSequence(subjectId, schedule, curriculum) {
  const matchingLessons = (schedule?.scheduleEntries || [])
    .filter((event) => event.type === 'lesson' && event.classId === '8a' && event.subjectId === subjectId)
    .slice(0, 3);
  const fallbackLessons = [
    { id: 'fallback-1', date: '2026-05-19', dayLabel: localized('Tuesday', 'Tisdag'), startTime: '09:15', endTime: '10:05' },
    { id: 'fallback-2', date: '2026-05-21', dayLabel: localized('Thursday', 'Torsdag'), startTime: '09:15', endTime: '10:05' },
    { id: 'fallback-3', date: '2026-05-26', dayLabel: localized('Tuesday', 'Tisdag'), startTime: '09:15', endTime: '10:05' },
  ];
  const sourceLessons = matchingLessons.length ? matchingLessons : fallbackLessons;

  return sourceLessons.map((event, index) => {
    const teachingUnit = curriculum.teachingUnits[index % curriculum.teachingUnits.length];

    return {
      id: `${subjectId}-8a-lesson-${index + 1}`,
      date: event.date || fallbackLessons[index]?.date,
      dayLabel: event.dayLabel || localized(event.dayLabel || 'Lesson day', event.dayLabel || 'Lektionsdag'),
      startTime: event.startTime || event.start || fallbackLessons[index]?.startTime,
      endTime: event.endTime || event.end || fallbackLessons[index]?.endTime,
      teachingUnitId: teachingUnit.id,
      title: teachingUnit.title,
      focus: localized(
        `${resolveLocalizedValue(teachingUnit.title, 'en')} focus lesson`,
        `Fokuslektion i ${resolveLocalizedValue(teachingUnit.title, 'sv')}`,
      ),
    };
  });
}

function buildEvidence(subjectId, curriculum) {
  const [firstUnit] = curriculum.teachingUnits;
  const students = class8AStudents;
  const evidenceStudents = subjectId === 'physical-education'
    ? students.filter((student) => student.id === 'elias-nilsson')
    : students;
  const observations = evidenceStudents.flatMap((student, studentIndex) => {
    const profile = studentProfiles[student.id] || studentProfiles['william-dahl'];
    const levelProgression = levelProgressions[profile.pattern] || levelProgressions.steady;

    return evidenceDates.map((date, evidenceIndex) => {
      const unit = curriculum.teachingUnits[(studentIndex + evidenceIndex) % curriculum.teachingUnits.length];
      const skillId = (unit.skillIds || [])[evidenceIndex % (unit.skillIds || []).length] || curriculum.skills[evidenceIndex % curriculum.skills.length]?.id;
      const skill = curriculum.skills.find((item) => item.id === skillId) || curriculum.skills[0];
      const levelId = levelProgression[evidenceIndex] || levelProgression[levelProgression.length - 1];
      const trendText = subjectId === 'sloyd' ? sloydObservationText[profile.pattern]?.en || [] : {
        high: ['worked confidently', 'extended the task independently', 'made precise links', 'supported peers', 'is ready for greater challenge'],
        secure: ['met the expected focus', 'used feedback well', 'worked with steady accuracy', 'secured the main idea', 'is consolidating well'],
        steady: ['needed a short reminder', 'completed the core task', 'showed reliable progress', 'used the model successfully', 'is broadly on track'],
        improving: ['needed significant scaffolding', 'started to connect ideas', 'used feedback to revise', 'showed clearer independence', 'has improved noticeably'],
        fragile: ['found the starting point difficult', 'needed repeated checks', 'completed part of the task with support', 'showed a more secure attempt', 'is beginning to stabilise'],
        inconsistent: ['started well but lost focus', 'missed a key step', 'recovered with prompting', 'showed a stronger lesson', 'needs consistency across tasks'],
        struggling: ['needed close support', 'found the concept difficult', 'completed a reduced task', 'showed a small step forward', 'still needs guided practice'],
      }[profile.pattern] || [];
      const trendTextSv = subjectId === 'sloyd' ? sloydObservationText[profile.pattern]?.sv || [] : {
        high: ['arbetade s\u00e4kert', 'utvecklade uppgiften sj\u00e4lvst\u00e4ndigt', 'gjorde precisa kopplingar', 'st\u00f6ttade klasskamrater', '\u00e4r redo f\u00f6r st\u00f6rre utmaning'],
        secure: ['n\u00e5dde det f\u00f6rv\u00e4ntade fokuset', 'anv\u00e4nde feedback v\u00e4l', 'arbetade med stabil s\u00e4kerhet', 'bef\u00e4ste huvudid\u00e9n', 'bef\u00e4ster arbetet v\u00e4l'],
        steady: ['beh\u00f6vde en kort p\u00e5minnelse', 'genomf\u00f6rde k\u00e4rnuppgiften', 'visade tillf\u00f6rlitlig progression', 'anv\u00e4nde modellen framg\u00e5ngsrikt', '\u00e4r i stort sett p\u00e5 r\u00e4tt v\u00e4g'],
        improving: ['beh\u00f6vde tydlig st\u00f6ttning', 'b\u00f6rjade koppla ihop id\u00e9er', 'anv\u00e4nde feedback f\u00f6r att bearbeta', 'visade tydligare sj\u00e4lvst\u00e4ndighet', 'har utvecklats tydligt'],
        fragile: ['hade sv\u00e5rt att komma ig\u00e5ng', 'beh\u00f6vde upprepade avst\u00e4mningar', 'genomf\u00f6rde delar av uppgiften med st\u00f6d', 'visade ett s\u00e4krare f\u00f6rs\u00f6k', 'b\u00f6rjar stabiliseras'],
        inconsistent: ['startade bra men tappade fokus', 'missade ett viktigt steg', '\u00e5terh\u00e4mtade sig med st\u00f6d', 'visade en starkare lektion', 'beh\u00f6ver j\u00e4mnhet mellan uppgifter'],
        struggling: ['beh\u00f6vde n\u00e4ra st\u00f6d', 'hade sv\u00e5rt med begreppet', 'genomf\u00f6rde en avgr\u00e4nsad uppgift', 'visade ett litet steg fram\u00e5t', 'beh\u00f6ver fortsatt guidad \u00f6vning'],
      }[profile.pattern] || [];

      return {
        id: `${subjectId}-8a-evidence-${student.id}-${evidenceIndex + 1}`,
        type: 'observation',
        studentId: student.id,
        date,
        teachingUnitId: unit.id,
        skillId: skill.id,
        levelId,
        note: localized(
          `${student.firstName} ${trendText[evidenceIndex]} in ${resolveLocalizedValue(unit.title, 'en').toLowerCase()} (${resolveLocalizedValue(skill.title, 'en').toLowerCase()}).`,
          `${student.firstName} ${trendTextSv[evidenceIndex]} i ${resolveLocalizedValue(unit.title, 'sv').toLowerCase()} (${resolveLocalizedValue(skill.title, 'sv').toLowerCase()}).`,
        ),
      };
    });
  });
  const assessments = assessmentDates.map((date, assessmentIndex) => {
    const unit = curriculum.teachingUnits[assessmentIndex % curriculum.teachingUnits.length] || firstUnit;

    return {
      id: `${subjectId}-8a-assessment-${assessmentIndex + 1}`,
      type: 'assessment',
      title: localized(
        `${resolveLocalizedValue(unit.title, 'en')} checkpoint ${assessmentIndex + 1}`,
        `Kontroll ${assessmentIndex + 1} i ${resolveLocalizedValue(unit.title, 'sv')}`,
      ),
      date,
      teachingUnitId: unit.id,
      max: 20,
      pass: 10,
      results: evidenceStudents.map((student) => {
        const profile = studentProfiles[student.id] || studentProfiles['william-dahl'];
        const absent = absentAssessments[student.id]?.includes(assessmentIndex) || false;
        const score = absent ? null : (profile.assessmentScores[assessmentIndex] ?? 12);
        const percentage = score === null ? null : Math.round((score / 20) * 100);

        return {
          studentId: student.id,
          score,
          percentage,
          passed: absent ? false : score >= 10,
          absent,
          warning: !absent && score < 10,
        };
      }),
    };
  });
  const englishEliasObservationClusters = subjectId === 'english'
    ? [
      ['2026-01-22', 'listening-reception', [
        ['spoken-language-main-content-details', 'developing'],
        ['text-main-content-details', 'emerging'],
        ['source-selection-use', 'developing'],
      ]],
      ['2026-02-12', 'reading-reception', [
        ['text-main-content-details', 'developing'],
        ['source-selection-use', 'developing'],
        ['oral-presentation-coherence', 'emerging'],
      ]],
      ['2026-03-12', 'speaking-production-interaction', [
        ['source-selection-use', 'developing'],
        ['oral-presentation-coherence', 'developing'],
        ['written-presentation-coherence', 'secure'],
      ]],
      ['2026-04-16', 'writing-production-interaction', [
        ['oral-presentation-coherence', 'secure'],
        ['written-presentation-coherence', 'developing'],
        ['interaction-purpose-audience-situation', 'developing'],
      ]],
      ['2026-05-14', 'listening-reception', [
        ['spoken-language-main-content-details', 'secure'],
        ['text-main-content-details', 'secure'],
        ['source-selection-use', 'developing'],
      ]],
      ['2026-05-14', 'reading-reception', [
        ['text-main-content-details', 'secure'],
        ['source-selection-use', 'developing'],
        ['oral-presentation-coherence', 'developing'],
      ]],
    ].flatMap(([date, teachingUnitId, captures], clusterIndex) => captures.map(([skillId, levelId], captureIndex) => ({
      id: `english-8a-evidence-elias-extra-${clusterIndex + 1}-${captureIndex + 1}`,
      type: 'observation',
      studentId: 'elias-nilsson',
      date,
      teachingUnitId,
      skillId,
      levelId,
    })))
    : [];
  const physicalEducationEliasObservationClusters = subjectId === 'physical-education'
    ? [
      ['2026-01-22', 'movement-adaption', [
        ['balance-body-control', 'developing'],
        ['coordination', 'emerging'],
        ['adaptation-purpose-feedback', 'developing'],
      ]],
      ['2026-02-12', 'planning-implementation', [
        ['sets-appropriate-goal', 'developing'],
        ['carries-out-plan', 'secure'],
      ]],
      ['2026-02-12', 'outdoor-activities-adaption', [
        ['navigation-orientation', 'developing'],
        ['responsibility-preparedness', 'emerging'],
      ]],
      ['2026-03-12', 'movement-adaption', [
        ['coordination', 'secure'],
        ['timing-rhythm', 'developing'],
        ['precision-movement-control', 'developing'],
      ]],
      ['2026-04-16', 'evaluation-health', [
        ['describes-effects-activity', 'secure'],
        ['evaluates-choices-outcomes', 'secure'],
      ]],
      ['2026-04-16', 'safety-risk-management', [
        ['identifies-risks', 'secure'],
        ['uses-equipment-methods-safely', 'developing'],
        ['responds-appropriately', 'secure'],
      ]],
      ['2026-05-14', 'movement-adaption', [
        ['coordination', 'secure'],
        ['precision-movement-control', 'secure'],
        ['adaptation-purpose-feedback', 'secure'],
      ]],
      ['2026-05-14', 'swimming-emergencies', [
        ['continuous-swimming-ability', 'secure'],
        ['water-safety', 'advanced'],
      ]],
    ].flatMap(([date, teachingUnitId, captures], clusterIndex) => captures.map(([skillId, levelId], captureIndex) => ({
      id: `physical-education-8a-evidence-elias-extra-${clusterIndex + 1}-${captureIndex + 1}`,
      type: 'observation',
      studentId: 'elias-nilsson',
      date,
      teachingUnitId,
      skillId,
      levelId,
    })))
    : [];
  const physicalEducationEliasActivityTimeline = subjectId === 'physical-education'
    ? [
      ['2026-01-15', 'football', localized('Football', 'Fotboll'), 'movement-adaption', [
        ['football-ball-control', 'balance-body-control', 'developing'],
        ['football-receive-pass', 'coordination', 'emerging'],
      ]],
      ['2026-01-20', 'football', localized('Football', 'Fotboll'), 'movement-adaption', [
        ['football-timing', 'timing-rhythm', 'developing'],
        ['football-positioning', 'adaptation-purpose-feedback', 'developing'],
      ]],
      ['2026-01-22', 'football', localized('Football', 'Fotboll'), 'movement-adaption', [
        ['football-precision', 'precision-movement-control', 'developing'],
        ['football-team-adjustment', 'adjusts-plan-when-needed', 'developing', 'planning-implementation'],
      ]],
      ['2026-01-29', 'football', localized('Football', 'Fotboll'), 'planning-implementation', [
        ['football-team-play', 'carries-out-plan', 'developing'],
        ['football-sportsmanship', 'adapts-actions-conditions', 'developing', 'safety-risk-management'],
      ]],
      ['2026-02-05', 'orienteering', localized('Orienteering', 'Orientering'), 'outdoor-activities-adaption', [
        ['orienteering-orientates-map', 'navigation-orientation', 'developing'],
        ['orienteering-relates-map-environment', 'navigation-orientation', 'emerging'],
      ]],
      ['2026-02-12', 'orienteering', localized('Orienteering', 'Orientering'), 'outdoor-activities-adaption', [
        ['orienteering-orientates-map', 'navigation-orientation', 'developing'],
        ['orienteering-selects-route', 'adaptation-environment-conditions', 'emerging'],
      ]],
      ['2026-02-19', 'orienteering', localized('Orienteering', 'Orientering'), 'outdoor-activities-adaption', [
        ['orienteering-relates-map-environment', 'navigation-orientation', 'developing'],
        ['orienteering-adapts-to-terrain', 'adaptation-purpose-feedback', 'developing', 'movement-adaption'],
        ['orienteering-manages-outdoor-risk', 'identifies-risks', 'developing', 'safety-risk-management'],
      ]],
      ['2026-02-26', 'outdoor-cooking-campcraft', localized('Outdoor cooking and campcraft', 'Matlagning ute och friluftsteknik'), 'outdoor-activities-adaption', [
        ['outdoor-cooking-campcraft-prepares-equipment', 'responsibility-preparedness', 'developing'],
        ['outdoor-cooking-campcraft-sustainable-choices', 'sustainable-choices-outdoors', 'developing'],
        ['outdoor-cooking-campcraft-uses-equipment-safely', 'uses-equipment-methods-safely', 'developing', 'safety-risk-management'],
      ]],
      ['2026-03-03', 'dance', localized('Dance', 'Dans'), 'movement-adaption', [
        ['dance-moves-in-time', 'timing-rhythm', 'emerging'],
        ['dance-controls-body-position', 'balance-body-control', 'developing'],
      ]],
      ['2026-03-05', 'dance', localized('Dance', 'Dans'), 'movement-adaption', [
        ['dance-coordinates-sequence', 'coordination', 'emerging'],
        ['dance-adapts-to-sequence', 'adaptation-purpose-feedback', 'emerging'],
      ]],
      ['2026-03-12', 'dance', localized('Dance', 'Dans'), 'movement-adaption', [
        ['dance-moves-in-time', 'timing-rhythm', 'developing'],
        ['dance-coordinates-sequence', 'coordination', 'developing'],
      ]],
      ['2026-03-17', 'dance', localized('Dance', 'Dans'), 'movement-adaption', [
        ['dance-movement-precision', 'precision-movement-control', 'emerging'],
        ['dance-adapts-to-sequence', 'adaptation-purpose-feedback', 'emerging'],
      ]],
      ['2026-03-19', 'dance', localized('Dance', 'Dans'), 'movement-adaption', [
        ['dance-controls-body-position', 'balance-body-control', 'developing'],
        ['dance-coordinates-sequence', 'coordination', 'developing'],
      ]],
      ['2026-03-26', 'high-jump', localized('High jump', 'H\u00f6jdhopp'), 'movement-adaption', [
        ['high-jump-controlled-approach', 'timing-rhythm', 'developing'],
        ['high-jump-body-control-landing', 'balance-body-control', 'developing'],
      ]],
      ['2026-03-31', 'high-jump', localized('High jump', 'H\u00f6jdhopp'), 'movement-adaption', [
        ['high-jump-approach-takeoff', 'coordination', 'developing'],
        ['high-jump-adjusts-technique', 'adaptation-purpose-feedback', 'developing'],
      ]],
      ['2026-04-02', 'high-jump', localized('High jump', 'H\u00f6jdhopp'), 'movement-adaption', [
        ['high-jump-controlled-approach', 'timing-rhythm', 'secure'],
        ['high-jump-body-control-landing', 'balance-body-control', 'developing'],
      ]],
      ['2026-04-09', 'high-jump', localized('High jump', 'H\u00f6jdhopp'), 'movement-adaption', [
        ['high-jump-approach-takeoff', 'coordination', 'secure'],
        ['high-jump-adjusts-technique', 'adaptation-purpose-feedback', 'secure'],
      ]],
      ['2026-04-16', 'fitness-programme', localized('Fitness programme', 'Tr\u00e4ningsprogram'), 'planning-implementation', [
        ['fitness-programme-sets-goal', 'sets-appropriate-goal', 'secure'],
        ['fitness-programme-selects-activities', 'selects-suitable-activities-methods', 'developing'],
        ['fitness-programme-evaluates-adjusts', 'evaluates-choices-outcomes', 'developing', 'evaluation-health'],
      ]],
      ['2026-04-23', 'fitness-programme', localized('Fitness programme', 'Tr\u00e4ningsprogram'), 'planning-implementation', [
        ['fitness-programme-creates-sequence', 'creates-workable-plan', 'secure'],
        ['fitness-programme-carries-out-plan', 'carries-out-plan', 'secure'],
      ]],
      ['2026-04-30', 'high-jump', localized('High jump', 'H\u00f6jdhopp'), 'safety-risk-management', [
        ['high-jump-adjusts-technique', 'adaptation-purpose-feedback', 'secure', 'movement-adaption'],
        ['high-jump-uses-jump-area-safely', 'uses-equipment-methods-safely', 'secure'],
      ]],
      ['2026-05-07', 'swimming', localized('Swimming', 'Simning'), 'swimming-emergencies', [
        ['swimming-controlled-action', 'swimming-technique-control', 'developing'],
        ['swimming-breathing-coordination', 'coordination', 'developing', 'movement-adaption'],
      ]],
      ['2026-05-14', 'swimming', localized('Swimming', 'Simning'), 'swimming-emergencies', [
        ['swimming-controlled-action', 'swimming-technique-control', 'secure'],
        ['swimming-water-safety', 'water-safety', 'advanced'],
      ]],
      ['2026-05-21', 'swimming', localized('Swimming', 'Simning'), 'swimming-emergencies', [
        ['swimming-water-emergency', 'emergency-action-water', 'secure'],
        ['swimming-water-safety', 'water-safety', 'secure'],
      ]],
      ['2026-05-28', 'swimming', localized('Swimming', 'Simning'), 'movement-adaption', [
        ['swimming-breathing-coordination', 'coordination', 'secure'],
        ['swimming-adapts-technique', 'adaptation-purpose-feedback', 'secure'],
      ]],
    ].flatMap(([date, contextId, contextLabel, teachingUnitId, captures], clusterIndex) => captures.map(([capturePointId, skillId, levelId, captureTeachingUnitId], captureIndex) => ({
      id: `physical-education-8a-evidence-elias-activity-${clusterIndex + 1}-${captureIndex + 1}`,
      type: 'observation',
      studentId: 'elias-nilsson',
      date,
      teachingUnitId: captureTeachingUnitId || teachingUnitId,
      skillId,
      capturePointId,
      contextId,
      contextLabel,
      levelId,
    })))
    : [];
  const learningObservations = evidenceStudents.flatMap((student) => {
    const profile = studentProfiles[student.id] || studentProfiles['william-dahl'];
    const windows = getLearningObservationWindows(subjectId, student, profile);

    return windows.map((window, observationIndex) => ({
      id: `${subjectId}-8a-learning-${student.id}-${observationIndex + 1}`,
      studentId: student.id,
      date: window.date,
      ...(window.focus ? { focus: window.focus } : {}),
      ...(window.participation ? { participation: window.participation } : {}),
      ...(window.independence ? { independence: window.independence } : {}),
      comment: localized(
        `${student.firstName}: ${window.note}.`,
        `${student.firstName}: ${translateLearningObservationNote(window.note)}.`,
      ),
    }));
  });
  const timelineResponses = subjectId === 'physical-education'
    ? [
      {
        id: 'physical-education-8a-elias-timeline-response-1',
        type: 'timeline-comment',
        studentId: 'elias-nilsson',
        date: '2026-02-12',
        label: localized('Pair support', 'Parst\u00f6d'),
        comment: localized(
          'Use a confident partner for team-play decisions and pause briefly after the activity to name the choice made.',
          'Anv\u00e4nd en trygg partner vid beslut i lagspel och pausa kort efter aktiviteten f\u00f6r att s\u00e4tta ord p\u00e5 valet.',
        ),
      },
      {
        id: 'physical-education-8a-elias-timeline-response-2',
        type: 'timeline-comment',
        studentId: 'elias-nilsson',
        date: '2026-03-05',
        label: localized('Dance check-in', 'Dansavst\u00e4mning'),
        comment: localized(
          'Keep the next task low-pressure: paired rehearsal, clear entry point, no solo performance expectation.',
          'H\u00e5ll n\u00e4sta uppgift l\u00e5gpressad: par\u00f6vning, tydlig startpunkt, inget krav p\u00e5 soloframtr\u00e4dande.',
        ),
      },
      {
        id: 'physical-education-8a-elias-timeline-response-3',
        type: 'timeline-comment',
        studentId: 'elias-nilsson',
        date: '2026-03-17',
        label: localized('Guardian contact', 'V\u00e5rdnadshavarkontakt'),
        comment: localized(
          'Agree a simple PE routine with home. Keep formal notes in Prorenata; SmartDesk only tracks the classroom follow-up.',
          'Kom \u00f6verens om en enkel idrottsrutin med hemmet. Formella anteckningar i Prorenata; SmartDesk f\u00f6ljer endast lektionsuppf\u00f6ljningen.',
        ),
      },
      {
        id: 'physical-education-8a-elias-timeline-response-4',
        type: 'timeline-comment',
        studentId: 'elias-nilsson',
        date: '2026-04-02',
        label: localized('High jump response', 'Respons i h\u00f6jdhopp'),
        comment: localized(
          'Use short technical cues and immediate re-try. Confidence improves when feedback is concrete and visible.',
          'Anv\u00e4nd korta tekniska instruktioner och direkt nytt f\u00f6rs\u00f6k. Sj\u00e4lvf\u00f6rtroendet st\u00e4rks n\u00e4r feedbacken \u00e4r konkret och synlig.',
        ),
      },
      {
        id: 'physical-education-8a-elias-timeline-response-5',
        type: 'timeline-comment',
        studentId: 'elias-nilsson',
        date: '2026-05-14',
        label: localized('Swimming check-in', 'Simavst\u00e4mning'),
        comment: localized(
          'Revisit breathing rhythm before the next distance swim and confirm water-safety routines at the start.',
          'Repetera andningsrytm f\u00f6re n\u00e4sta distanssimning och s\u00e4kerst\u00e4ll vattenrutiner i starten.',
        ),
      },
    ]
    : [];

  return {
    items: [
      ...observations,
      ...englishEliasObservationClusters,
      ...physicalEducationEliasObservationClusters,
      ...physicalEducationEliasActivityTimeline,
      ...assessments,
    ],
    learningObservations,
    timelineResponses,
  };
}

function buildPlanning(subjectId, curriculum) {
  if (subjectId === 'physical-education') {
    const contextById = new Map(physicalEducationLearningContexts.map((context) => [context.id, context]));
    const activityBlocks = [
      ['football', 'jan-2026', '2026-01-12', '2026-01-30', 'completed', localized('Team play: football', 'Lagspel: fotboll'), localized('Start the term with movement, coordination and fair play evidence through small-sided games.', 'Starta terminen med underlag f\u00f6r r\u00f6relse, koordination och schysst spel genom sm\u00e5lagsspel.')],
      ['orienteering', 'feb-2026', '2026-02-02', '2026-02-20', 'completed', localized('Outdoor navigation: orienteering', 'Friluftsliv: orientering'), localized('Use map routines, route choices and terrain adaptation as planned capture moments.', 'Anv\u00e4nd kartrutiner, v\u00e4gval och anpassning till terr\u00e4ng som planerade observationspunkter.')],
      ['outdoor-cooking-campcraft', 'feb-2026', '2026-02-23', '2026-02-27', 'completed', localized('Outdoor cooking and campcraft', 'Matlagning ute och friluftsteknik'), localized('Short practical outdoor block for preparation, equipment safety and sustainable choices.', 'Kort praktiskt friluftsmoment f\u00f6r f\u00f6rberedelse, s\u00e4ker utrustningsanv\u00e4ndning och h\u00e5llbara val.')],
      ['dance', 'mar-2026', '2026-03-02', '2026-03-20', 'completed', localized('Dance sequence', 'Danssekvens'), localized('Planned movement sequence block. Elias shows a dip here, followed by check-in and adjusted support.', 'Planerat moment med r\u00f6relsesekvens. Elias visar en svacka h\u00e4r, f\u00f6ljt av avst\u00e4mning och anpassat st\u00f6d.')],
      ['high-jump', 'mar-2026', '2026-03-23', '2026-04-10', 'completed', localized('High jump technique', 'H\u00f6jdhoppsteknik'), localized('Recovery block after dance: short technical cues, repeated attempts and visible feedback.', '\u00c5terh\u00e4mtningsmoment efter dans: korta tekniska instruktioner, upprepade f\u00f6rs\u00f6k och synlig feedback.')],
      ['fitness-programme', 'apr-2026', '2026-04-13', '2026-04-24', 'completed', localized('Fitness programme', 'Tr\u00e4ningsprogram'), localized('Students plan, carry out and evaluate a simple training programme.', 'Eleverna planerar, genomf\u00f6r och utv\u00e4rderar ett enkelt tr\u00e4ningsprogram.')],
      ['swimming', 'may-2026', '2026-05-04', '2026-05-29', 'current', localized('Swimming and water safety', 'Simning och vattens\u00e4kerhet'), localized('Current block linking swimming technique, water safety and emergency response.', 'Aktuellt moment som kopplar simteknik, vattens\u00e4kerhet och agerande vid n\u00f6dsituationer.')],
    ].map(([contextId, periodId, startDate, endDate, status, title, description], index) => {
      const context = contextById.get(contextId);
      const curriculumAreaIds = [...new Set([
        context?.primaryCurriculumAreaId,
        ...(context?.possibleCurriculumAreaIds || []),
        ...(context?.capturePoints || []).flatMap((point) => point.curriculumAreaIds || []),
      ].filter(Boolean))];
      const abilityIds = [...new Set((context?.capturePoints || [])
        .map((point) => point.observationDimensionId)
        .filter(Boolean))];

      return {
        id: `${subjectId}-8a-plan-${contextId}`,
        subjectId,
        classId: '8a',
        title,
        description,
        teachingUnitId: context?.primaryCurriculumAreaId || curriculumAreaIds[0] || '',
        sourceTemplateId: contextId,
        templateId: contextId,
        periodId,
        startDate,
        endDate,
        status,
        curriculumAreaIds,
        evidenceTopicIds: curriculumAreaIds.map((areaId) => `${areaId}-observations`),
        abilityIds,
        blockType: 'teaching',
        assessmentAnchor: null,
        quickCaptureOptions: (context?.capturePoints || []).map((point) => ({
          id: point.id,
          label: point.label,
        })),
        groupAdaptations: contextId === 'dance'
          ? [
            {
              id: 'dance-elias-check-in',
              workingGroupId: 'needs-check-in',
              instruction: localized('Low-pressure paired rehearsal and clear entry point for Elias.', 'L\u00e5gpressad par\u00f6vning och tydlig startpunkt f\u00f6r Elias.'),
            },
          ]
          : [],
        notes: contextId === 'dance'
          ? localized('Guardian contact handled outside SmartDesk; formal notes stay in Prorenata.', 'V\u00e5rdnadshavarkontakt hanteras utanf\u00f6r SmartDesk; formella anteckningar ligger i Prorenata.')
          : null,
        createdAt: '2026-01-08',
        updatedAt: status === 'current' ? '2026-05-18' : endDate,
        createdBy: 'teacher',
      };
    });

    return {
      periods: [
        { id: 'jan-2026', label: localized('January', 'Januari'), startDate: '2026-01-08', endDate: '2026-01-31', order: 1 },
        { id: 'feb-2026', label: localized('February', 'Februari'), startDate: '2026-02-01', endDate: '2026-02-28', order: 2 },
        { id: 'mar-2026', label: localized('March', 'Mars'), startDate: '2026-03-01', endDate: '2026-03-31', order: 3 },
        { id: 'apr-2026', label: localized('April', 'April'), startDate: '2026-04-01', endDate: '2026-04-30', order: 4 },
        { id: 'may-2026', label: localized('May', 'Maj'), startDate: '2026-05-01', endDate: '2026-05-31', order: 5 },
        { id: 'june-2026', label: localized('June', 'Juni'), startDate: '2026-06-01', endDate: '2026-06-19', order: 6 },
      ],
      blocks: activityBlocks,
      tools: [
        { id: 'blank-block', title: localized('Blank block', 'Tomt block'), blockType: 'teaching', description: '', curriculumAreaIds: [], evidenceTopicIds: [], abilityIds: [], quickCaptureOptions: [] },
        { id: 'revision-consolidation', title: localized('Revision and consolidation', 'Repetition och bef\u00e4stande'), blockType: 'consolidation', description: localized('Create time to revisit and secure earlier learning.', 'Skapa tid f\u00f6r att repetera och bef\u00e4sta tidigare l\u00e4rande.'), curriculumAreaIds: [], evidenceTopicIds: [], abilityIds: [], quickCaptureOptions: [] },
        { id: 'assessment-point', title: localized('Assessment point', 'Bed\u00f6mningspunkt'), blockType: 'assessment', description: localized('Add a planned assessment or checkpoint.', 'L\u00e4gg till en planerad bed\u00f6mning eller kontrollpunkt.'), curriculumAreaIds: [], evidenceTopicIds: [], abilityIds: [], quickCaptureOptions: [] },
      ],
      curriculumAreaTypeLabels: {
        content: localized('Content', 'Inneh\u00e5ll'),
        ability: localized('Skills', 'F\u00e4rdigheter'),
      },
      blockTypeLabels: {
        teaching: localized('Activities', 'Aktiviteter'),
      },
      curriculumNotes: [],
    };
  }

  return {
    periods: [
      { id: 'jan-2026', label: localized('January', 'Januari'), startDate: '2026-01-08', endDate: '2026-01-31', order: 1 },
      { id: 'feb-2026', label: localized('February', 'Februari'), startDate: '2026-02-01', endDate: '2026-02-28', order: 2 },
      { id: 'mar-2026', label: localized('March', 'Mars'), startDate: '2026-03-01', endDate: '2026-03-31', order: 3 },
      { id: 'apr-2026', label: localized('April', 'April'), startDate: '2026-04-01', endDate: '2026-04-30', order: 4 },
      { id: 'may-2026', label: localized('May', 'Maj'), startDate: '2026-05-01', endDate: '2026-05-31', order: 5 },
      { id: 'june-2026', label: localized('June', 'Juni'), startDate: '2026-06-01', endDate: '2026-06-19', order: 6 },
    ],
    blocks: [
      ['jan-2026', '2026-01-12', '2026-01-30', 0, 'completed'],
      ['feb-2026', '2026-02-02', '2026-02-27', 1, 'completed'],
      ['mar-2026', '2026-03-02', '2026-03-27', 2, 'completed'],
      ['apr-2026', '2026-04-07', '2026-04-30', 0, 'completed'],
      ['may-2026', '2026-05-04', '2026-05-22', 1, 'current'],
      ['june-2026', '2026-06-01', '2026-06-12', 2, 'planned'],
    ].map(([periodId, startDate, endDate, unitIndex, status], index) => {
      const unit = curriculum.teachingUnits[unitIndex % curriculum.teachingUnits.length];

      return {
        id: `${subjectId}-8a-${unit.id}-${index + 1}`,
        subjectId,
        classId: '8a',
        title: unit.title,
        description: localized(
          `Build evidence for ${resolveLocalizedValue(unit.title, 'en').toLowerCase()}.`,
          `Bygg underlag f\u00f6r ${resolveLocalizedValue(unit.title, 'sv').toLowerCase()}.`,
        ),
        teachingUnitId: unit.id,
        sourceTemplateId: unit.id,
        periodId,
        startDate,
        endDate,
        status,
        curriculumAreaIds: [unit.curriculumAreaId],
        evidenceTopicIds: [unit.id],
        abilityIds: unit.skillIds || [],
        blockType: index === 2 ? 'assessment' : 'teaching',
        assessmentAnchor: null,
        quickCaptureOptions: (unit.skillIds || []).slice(0, 2).map((skillId) => {
          const skill = curriculum.skills.find((item) => item.id === skillId);
          return { id: skillId, label: skill?.title || localized(skillId, skillId) };
        }),
        groupAdaptations: [],
        notes: null,
        createdAt: '2026-01-08',
        updatedAt: status === 'current' ? '2026-05-18' : endDate,
        createdBy: 'teacher',
      };
    }),
    tools: [
      { id: 'blank-block', title: localized('Blank block', 'Tomt block'), blockType: 'teaching', description: '', curriculumAreaIds: [], evidenceTopicIds: [], abilityIds: [], quickCaptureOptions: [] },
      { id: 'revision-consolidation', title: localized('Revision and consolidation', 'Repetition och bef\u00e4stande'), blockType: 'consolidation', description: localized('Create time to revisit and secure earlier learning.', 'Skapa tid f\u00f6r att repetera och bef\u00e4sta tidigare l\u00e4rande.'), curriculumAreaIds: [], evidenceTopicIds: [], abilityIds: [], quickCaptureOptions: [] },
      { id: 'assessment-point', title: localized('Assessment point', 'Bed\u00f6mningspunkt'), blockType: 'assessment', description: localized('Add a planned assessment or checkpoint.', 'L\u00e4gg till en planerad bed\u00f6mning eller kontrollpunkt.'), curriculumAreaIds: [], evidenceTopicIds: [], abilityIds: [], quickCaptureOptions: [] },
    ],
    curriculumAreaTypeLabels: {
      content: localized('Content', 'Inneh\u00e5ll'),
      ability: localized('Skills', 'F\u00e4rdigheter'),
    },
    curriculumNotes: [],
  };
}

function normalizeStudentPreviousResults(subjectId) {
  return class8AStudents.map((student) => ({
    ...student,
    previousResults: [
      ...(student.previousResults || []),
      {
        id: `${student.id}-${subjectId}-previous`,
        subjectId,
        schoolYear: 'Year 7',
        term: 'Spring',
        date: '2025-06-10',
        grade: student.previousResults?.[0]?.grade || 'C',
        source: 'previous-year-record',
      },
    ],
  }));
}

export function buildSubject8AConfig({ subjectId, schedule } = {}) {
  const subjectTitle = getSubjectTitle(subjectId);
  const curriculum = buildCurriculum(subjectId);
  const lessons = buildLessonSequence(subjectId, schedule, curriculum);
  const evidence = buildEvidence(subjectId, curriculum);

  return {
    id: `${subjectId}-8a`,
    subjectId,
    classId: '8a',
    title: {
      en: `${subjectTitle.en} 8A`,
      sv: `${subjectTitle.sv} 8A`,
    },
    subtitle: localized('Reusable module prototype', '\u00c5teranv\u00e4ndbar modulprototyp'),
    className: '8A',
    subjectTitle,
    headerSubtitle: localized('Reusable module prototype', '\u00c5teranv\u00e4ndbar modulprototyp'),
    classData: {
      profile: class8AProfile,
      students: normalizeStudentPreviousResults(subjectId),
    },
    curriculum,
    lessons: {
      current: lessons[0] || null,
      sequence: lessons,
    },
    evidence,
    planning: buildPlanning(subjectId, curriculum),
    navigation,
    screens: {
      'class-picture': {
        title: localized('Class picture', 'Klassbild'),
        description: localized(`Reusable class overview for ${subjectTitle.en} 8A.`, `\u00c5teranv\u00e4ndbar klass\u00f6versikt f\u00f6r ${subjectTitle.sv} 8A.`),
      },
      plan: {
        title: localized('Plan', 'Planering'),
        description: localized(`Reusable planning space for ${subjectTitle.en} 8A.`, `\u00c5teranv\u00e4ndbar planeringsyta f\u00f6r ${subjectTitle.sv} 8A.`),
      },
      now: {
        title: localized('Now', 'Nu'),
        description: localized(`Reusable lesson capture for ${subjectTitle.en} 8A.`, `\u00c5teranv\u00e4ndbar lektionsinsamling f\u00f6r ${subjectTitle.sv} 8A.`),
      },
      assessment: {
        title: localized('Assessment', 'Bed\u00f6mning'),
        description: localized(`Reusable assessment space for ${subjectTitle.en} 8A.`, `\u00c5teranv\u00e4ndbar bed\u00f6mningsyta f\u00f6r ${subjectTitle.sv} 8A.`),
      },
    },
  };
}

export function getLearningModuleConfig({ subjectId, classId = '8a', schedule } = {}) {
  if (classId === '8a') {
    return buildSubject8AConfig({ subjectId, schedule });
  }

  return buildSubject8AConfig({ subjectId, schedule });
}
