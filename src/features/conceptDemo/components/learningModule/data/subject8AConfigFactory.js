import { class8AProfile, class8AStudents } from '../../../data/classes/class8AStudents.js';
import {
  mathsAbilities,
  mathsCurriculumAreas,
} from '../../../data/mathsCurriculum.js';
import { getSubjectDefinition } from '../../../data/subjectCatalogue.js';
import { resolveLocalizedValue } from '../../../i18n/conceptDemoTranslations.js';
import { mathsLearningContexts } from './mathsLearningContexts.js';
import {
  musicCurriculumAreas,
  musicTeachingUnits,
} from './musicCurriculum.js';
import { musicLearningContexts } from './musicLearningContexts.js';
import {
  physicalEducationCurriculumAreas,
  physicalEducationTeachingUnits,
} from './physicalEducationCurriculum.js';
import { physicalEducationLearningContexts } from './physicalEducationLearningContexts.js';

const navigation = {
  defaultScreen: 'class-picture',
  items: [
    { id: 'class-picture', label: { en: 'Class Overview', sv: 'Klass\u00f6versikt' } },
    { id: 'plan', label: { en: 'Plan', sv: 'Planering' } },
    { id: 'now', label: { en: 'Now', sv: 'Nu' } },
    { id: 'assessment', label: { en: 'Assessment', sv: 'Bed\u00f6mning' } },
  ],
};

const subjectBlueprints = {
  english: {
    areas: [
      ['listening', 'Listening', 'Lyssna'],
      ['reading', 'Reading', 'L\u00e4sa'],
      ['writing', 'Writing', 'Skriva'],
      ['speaking', 'Speaking', 'Tala'],
      ['interaction', 'Interaction', 'Interaktion'],
      ['sources-context', 'Sources and context', 'K\u00e4llor och sammanhang'],
    ],
    skills: [
      ['listening-main-ideas', 'Main ideas', 'Huvuddrag'],
      ['listening-details', 'Details', 'Detaljer'],
      ['listening-interpretation', 'Interpretation', 'Tolkning'],
      ['listening-strategies', 'Listening strategies', 'Lyssningsstrategier'],
      ['listening-language-variation', 'Language variation', 'Spr\u00e5klig variation'],
      ['reading-main-ideas', 'Main ideas', 'Huvuddrag'],
      ['reading-details', 'Details', 'Detaljer'],
      ['reading-interpretation', 'Interpretation', 'Tolkning'],
      ['reading-strategies', 'Reading strategies', 'L\u00e4sstrategier'],
      ['reading-text-types-context', 'Text types and context', 'Texttyper och sammanhang'],
      ['writing-content-development', 'Content and development', 'Inneh\u00e5ll och utveckling'],
      ['writing-structure-coherence', 'Structure and coherence', 'Struktur och sammanhang'],
      ['writing-vocabulary-variation', 'Vocabulary and variation', 'Ordf\u00f6rr\u00e5d och variation'],
      ['writing-grammar-accuracy', 'Grammar and accuracy', 'Grammatik och korrekthet'],
      ['writing-purpose-audience-context', 'Purpose, audience and context', 'Syfte, mottagare och sammanhang'],
      ['writing-revision', 'Revision', 'Bearbetning'],
      ['speaking-content-development', 'Content and development', 'Inneh\u00e5ll och utveckling'],
      ['speaking-clarity', 'Clarity', 'Tydlighet'],
      ['speaking-fluency', 'Fluency', 'Flyt'],
      ['speaking-vocabulary-variation', 'Vocabulary and variation', 'Ordf\u00f6rr\u00e5d och variation'],
      ['speaking-pronunciation', 'Pronunciation', 'Uttal'],
      ['speaking-purpose-audience', 'Purpose and audience', 'Syfte och mottagare'],
      ['interaction-participating', 'Participating', 'Delta'],
      ['interaction-responding-developing', 'Responding and developing', 'Svara och utveckla'],
      ['interaction-expressing-opinions', 'Expressing opinions', 'Framf\u00f6ra \u00e5sikter'],
      ['interaction-communication-strategies', 'Communication strategies', 'Kommunikationsstrategier'],
      ['interaction-adaptation', 'Adaptation', 'Anpassning'],
      ['interaction-keeping-going', 'Keeping interaction going', 'H\u00e5lla interaktionen ig\u00e5ng'],
      ['sources-finding-information', 'Finding information', 'S\u00f6ka information'],
      ['sources-selecting-information', 'Selecting information', 'V\u00e4lja information'],
      ['sources-evaluating-content', 'Evaluating sources and content', 'V\u00e4rdera k\u00e4llor och inneh\u00e5ll'],
      ['sources-using-source-material', 'Using source material', 'Anv\u00e4nda k\u00e4llmaterial'],
      ['sources-culture-society', 'Culture and society', 'Kultur och samh\u00e4lle'],
      ['sources-discussing-comparing-contexts', 'Discussing and comparing contexts', 'Diskutera och j\u00e4mf\u00f6ra sammanhang'],
    ],
    unitTitles: [
      ['Listening', 'Lyssna'],
      ['Reading', 'L\u00e4sa'],
      ['Writing', 'Skriva'],
      ['Speaking', 'Tala'],
      ['Interaction', 'Interaktion'],
      ['Sources and context', 'K\u00e4llor och sammanhang'],
    ],
    unitSkillIds: {
      listening: ['listening-main-ideas', 'listening-details', 'listening-interpretation', 'listening-strategies', 'listening-language-variation'],
      reading: ['reading-main-ideas', 'reading-details', 'reading-interpretation', 'reading-strategies', 'reading-text-types-context'],
      writing: ['writing-content-development', 'writing-structure-coherence', 'writing-vocabulary-variation', 'writing-grammar-accuracy', 'writing-purpose-audience-context', 'writing-revision'],
      speaking: ['speaking-content-development', 'speaking-clarity', 'speaking-fluency', 'speaking-vocabulary-variation', 'speaking-pronunciation', 'speaking-purpose-audience'],
      interaction: ['interaction-participating', 'interaction-responding-developing', 'interaction-expressing-opinions', 'interaction-communication-strategies', 'interaction-adaptation', 'interaction-keeping-going'],
      'sources-context': ['sources-finding-information', 'sources-selecting-information', 'sources-evaluating-content', 'sources-using-source-material', 'sources-culture-society', 'sources-discussing-comparing-contexts'],
    },
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
      ['reading-comprehension', 'Reading and comprehension', 'L\u00e4sa och f\u00f6rst\u00e5'],
      ['writing', 'Writing', 'Skriva'],
      ['speaking-conversation', 'Speaking and conversation', 'Tala och samtala'],
      ['literature-text-analysis', 'Literature and text analysis', 'Litteratur och textanalys'],
      ['information-search-source-criticism', 'Information search and source criticism', 'Informationss\u00f6kning och k\u00e4llkritik'],
      ['language-usage', 'Language and usage', 'Spr\u00e5k och spr\u00e5kbruk'],
    ],
    skills: [
      ['reading-fluency', 'Reading fluency', 'L\u00e4sflyt'],
      ['reading-comprehension', 'Reading comprehension', 'L\u00e4sf\u00f6rst\u00e5else'],
      ['summarising', 'Summarising', 'Sammanfatta'],
      ['interpreting-content', 'Interpreting content', 'Tolka inneh\u00e5ll'],
      ['reasoning-about-text', 'Reasoning about text', 'Resonera om text'],
      ['writing-content', 'Content', 'Inneh\u00e5ll'],
      ['writing-structure', 'Structure', 'Struktur'],
      ['linguistic-variety-writing', 'Linguistic variety', 'Spr\u00e5klig variation'],
      ['adaptation-text-type-purpose-recipient', 'Adapting to text type, purpose and recipient', 'Anpassning till texttyp, syfte och mottagare'],
      ['language-correctness', 'Language correctness', 'Spr\u00e5kriktighet'],
      ['participating-in-conversation', 'Participating in conversation', 'Delta i samtal'],
      ['developing-conversation', 'Developing conversation', 'Utveckla samtal'],
      ['expressing-opinions', 'Expressing opinions', 'Framf\u00f6ra \u00e5sikter'],
      ['supporting-arguments', 'Supporting arguments', 'Underbygga argument'],
      ['oral-presentation-adaptation', 'Oral presentation and adaptation', 'Muntlig framst\u00e4llning och anpassning'],
      ['plot-content', 'Plot and content', 'Handling och inneh\u00e5ll'],
      ['message-theme', 'Message and theme', 'Budskap och tema'],
      ['interpretation-analysis', 'Interpretation and analysis', 'Tolkning och analys'],
      ['literary-concepts', 'Literary concepts', 'Litter\u00e4ra begrepp'],
      ['works-authors-contexts', 'Works, authors and contexts', 'Verk, f\u00f6rfattare och sammanhang'],
      ['searching-information', 'Searching for information', 'S\u00f6ka information'],
      ['selecting-relevant-sources', 'Selecting relevant sources', 'V\u00e4lja relevanta k\u00e4llor'],
      ['processing-own-words', 'Processing with own wording', 'Bearbeta med egna formuleringar'],
      ['quotation-source-reference', 'Quotation and source reference', 'Citat och k\u00e4llh\u00e4nvisning'],
      ['credibility-relevance', 'Credibility and relevance', 'Trov\u00e4rdighet och relevans'],
      ['language-structure', 'Language structure', 'Spr\u00e5kets struktur'],
      ['words-concepts-linguistic-variety', 'Words, concepts and linguistic variety', 'Ord, begrepp och spr\u00e5klig variation'],
      ['usage-in-contexts', 'Language usage in different contexts', 'Spr\u00e5kbruk i olika sammanhang'],
      ['linguistic-variety-sweden', 'Linguistic variety in Sweden', 'Spr\u00e5klig variation i Sverige'],
      ['nordic-languages-language-history', 'Swedish, Nordic languages and language history', 'Svenska och nordiska spr\u00e5k / spr\u00e5khistoria'],
    ],
    unitTitles: [
      ['Reading and comprehension', 'L\u00e4sa och f\u00f6rst\u00e5'],
      ['Writing', 'Skriva'],
      ['Speaking and conversation', 'Tala och samtala'],
      ['Literature and text analysis', 'Litteratur och textanalys'],
      ['Information search and source criticism', 'Informationss\u00f6kning och k\u00e4llkritik'],
      ['Language and usage', 'Spr\u00e5k och spr\u00e5kbruk'],
    ],
    unitSkillIds: {
      'reading-comprehension': ['reading-fluency', 'reading-comprehension', 'summarising', 'interpreting-content', 'reasoning-about-text'],
      writing: ['writing-content', 'writing-structure', 'linguistic-variety-writing', 'adaptation-text-type-purpose-recipient', 'language-correctness'],
      'speaking-conversation': ['participating-in-conversation', 'developing-conversation', 'expressing-opinions', 'supporting-arguments', 'oral-presentation-adaptation'],
      'literature-text-analysis': ['plot-content', 'message-theme', 'interpretation-analysis', 'literary-concepts', 'works-authors-contexts'],
      'information-search-source-criticism': ['searching-information', 'selecting-relevant-sources', 'processing-own-words', 'quotation-source-reference', 'credibility-relevance'],
      'language-usage': ['language-structure', 'words-concepts-linguistic-variety', 'usage-in-contexts', 'linguistic-variety-sweden', 'nordic-languages-language-history'],
    },
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

const musicEliasObservationDates = [
  '2026-01-15',
  '2026-01-22',
  '2026-01-29',
  '2026-02-05',
  '2026-02-12',
  '2026-02-19',
  '2026-03-05',
  '2026-03-12',
  '2026-03-19',
  '2026-03-26',
  '2026-04-09',
  '2026-04-16',
  '2026-04-23',
  '2026-05-07',
  '2026-05-21',
];

const musicEliasObservationPattern = [
  { focus: '+', participation: '+', note: 'confident start with guitar' },
  { independence: '+', note: 'practises chord changes without prompt' },
  { focus: '+', participation: '+', note: 'secure guitar contribution in pair practice' },
  { focus: '0', participation: '0', note: 'steady effort on drum pattern' },
  { independence: '0', note: 'needs count-in for drum transitions' },
  { focus: '0', note: 'keeps simple drum part with reminders' },
  { participation: '+', independence: '+', note: 'strong band rehearsal contribution' },
  { focus: '+', participation: '+', note: 'holds own part in ensemble' },
  { independence: '+', note: 'adjusts volume and entry with confidence' },
  { focus: '-', participation: '-', note: 'composition writing dip begins' },
  { independence: '-', note: 'avoids committing musical idea to paper' },
  { focus: '-', participation: '-', note: 'reluctant to show composition draft' },
  { participation: '0', note: 'shares a reduced composition idea after support' },
  { focus: '-', independence: '-', note: 'showcase preparation remains difficult' },
  { participation: '0', note: 'shows short extract with structured support' },
];

const mathematicsEliasObservationDates = [
  '2026-01-12',
  '2026-01-15',
  '2026-01-20',
  '2026-01-22',
  '2026-01-27',
  '2026-01-29',
  '2026-02-03',
  '2026-02-10',
  '2026-02-12',
  '2026-02-17',
  '2026-02-24',
  '2026-02-26',
  '2026-03-03',
  '2026-03-10',
  '2026-03-12',
  '2026-03-17',
  '2026-03-24',
  '2026-03-26',
  '2026-03-31',
  '2026-04-07',
  '2026-04-09',
  '2026-04-14',
  '2026-04-16',
  '2026-04-21',
  '2026-04-28',
  '2026-05-05',
  '2026-05-07',
  '2026-05-12',
  '2026-05-19',
  '2026-05-21',
  '2026-05-26',
];

const mathematicsEliasObservationPattern = [
  { focus: '0', participation: '0', note: 'settles with fraction model' },
  { participation: '+', note: 'explains fraction image to peer' },
  { focus: '+', independence: '0', note: 'uses percentage bar accurately' },
  { independence: '+', note: 'tries equivalent fractions without prompt' },
  { focus: '+', note: 'checks answer reasonableness' },
  { participation: '+', independence: '+', note: 'confident fraction method share' },
  { focus: '0', note: 'starts algebra carefully' },
  { focus: '-', independence: '0', note: 'simplification steps uncertain' },
  { participation: '0', note: 'accepts paired equation rehearsal' },
  { focus: '-', independence: '-', note: 'equation transformation dip' },
  { participation: '-', note: 'avoids explaining equation step' },
  { focus: '-', independence: '-', note: 'needs one-step equation scaffold' },
  { focus: '0', note: 'recovers with worked example' },
  { independence: '0', participation: '0', note: 'writes equation steps with checklist' },
  { focus: '0', participation: '+', note: 'explains one equation step aloud' },
  { participation: '+', note: 'engages with geometry investigation' },
  { focus: '+', independence: '0', note: 'uses diagram before calculating' },
  { participation: '+', independence: '+', note: 'tests geometry idea with partner' },
  { focus: '+', note: 'geometry reasoning clearer' },
  { independence: '+', note: 'starts construction independently' },
  { participation: '+', focus: '+', note: 'strong diagram discussion' },
  { independence: '+', note: 'uses feedback to refine explanation' },
  { focus: '+', independence: '+', note: 'secure geometry follow-through' },
  { focus: '0', note: 'data interpretation steady' },
  { participation: '0', note: 'needs prompt to justify data conclusion' },
  { focus: '0', independence: '0', note: 'graphs require careful setup' },
  { participation: '+', note: 'connects graph to situation' },
  { focus: '+', note: 'recognises proportional pattern' },
  { independence: '0', note: 'function model still needs support' },
  { participation: '+', focus: '+', note: 'communicates graph conclusion' },
  { independence: '+', note: 'more confident choosing method' },
];

const englishEliasObservationDates = [
  '2026-01-13',
  '2026-01-15',
  '2026-01-20',
  '2026-01-22',
  '2026-01-27',
  '2026-01-29',
  '2026-02-03',
  '2026-02-05',
  '2026-02-10',
  '2026-02-12',
  '2026-02-17',
  '2026-02-19',
  '2026-03-03',
  '2026-03-05',
  '2026-03-10',
  '2026-03-12',
  '2026-03-17',
  '2026-03-19',
  '2026-04-14',
  '2026-04-16',
  '2026-04-21',
  '2026-04-23',
  '2026-04-28',
  '2026-04-30',
  '2026-05-05',
  '2026-05-07',
  '2026-05-12',
  '2026-05-14',
];

const englishEliasObservationPattern = [
  { focus: '0', participation: '0', note: 'settles with text preview' },
  { independence: '-', note: 'needs vocabulary support before reading' },
  { participation: '+', note: 'shares a simple inference with partner' },
  { focus: '0', independence: '0', note: 'uses reading strategy when prompted' },
  { focus: '+', note: 'tracks details more carefully' },
  { participation: '+', independence: '0', note: 'summarises paragraph with scaffold' },
  { focus: '0', note: 'starts writing plan with support' },
  { independence: '-', note: 'grammar choices need checking' },
  { participation: '0', focus: '0', note: 'accepts model sentence revision' },
  { independence: '0', note: 'uses feedback to improve structure' },
  { focus: '+', note: 'edits spelling with checklist' },
  { participation: '+', note: 'reads draft sentence aloud to peer' },
  { focus: '0', independence: '0', note: 'prepares oral notes carefully' },
  { participation: '0', note: 'speaks briefly after rehearsal' },
  { focus: '+', participation: '0', note: 'uses key vocabulary in presentation' },
  { independence: '0', note: 'checks pronunciation before recording' },
  { participation: '+', note: 'answers one follow-up question' },
  { focus: '+', independence: '0', note: 'presentation confidence improving' },
  { focus: '0', participation: '+', note: 'joins paired discussion quickly' },
  { independence: '0', note: 'uses prompt card to respond' },
  { participation: '+', note: 'builds on classmate idea' },
  { focus: '+', note: 'keeps discussion thread' },
  { independence: '0', participation: '+', note: 'expresses opinion with reason' },
  { focus: '+', independence: '0', note: 'uses strategy to ask for clarification' },
  { participation: '+', note: 'discussion contribution more sustained' },
  { focus: '+', independence: '+', note: 'starts task without reminder' },
  { participation: '+', independence: '+', note: 'supports pair interaction' },
  { focus: '+', note: 'ready for more independent text work' },
];

const swedishEliasObservationDates = [
  '2026-01-13',
  '2026-01-15',
  '2026-01-20',
  '2026-01-22',
  '2026-01-27',
  '2026-01-29',
  '2026-02-03',
  '2026-02-05',
  '2026-02-10',
  '2026-02-12',
  '2026-02-17',
  '2026-02-19',
  '2026-03-03',
  '2026-03-05',
  '2026-03-10',
  '2026-03-12',
  '2026-03-17',
  '2026-03-19',
  '2026-04-14',
  '2026-04-16',
  '2026-04-21',
  '2026-04-23',
  '2026-04-28',
  '2026-04-30',
  '2026-05-05',
  '2026-05-07',
  '2026-05-12',
  '2026-05-14',
];

const swedishEliasObservationPattern = [
  { focus: '0', participation: '0', note: 'starts novel reading with support' },
  { independence: '-', note: 'needs help finding key events' },
  { participation: '+', note: 'shares interpretation in pair' },
  { focus: '0', independence: '0', note: 'uses summary frame' },
  { focus: '+', note: 'tracks theme more clearly' },
  { participation: '+', independence: '0', note: 'explains character choice with scaffold' },
  { focus: '0', note: 'plans argumentative text with prompts' },
  { independence: '-', note: 'needs support choosing evidence' },
  { participation: '0', focus: '0', note: 'revises argument after model' },
  { independence: '0', note: 'checks structure with writing frame' },
  { focus: '+', note: 'uses spelling routine carefully' },
  { participation: '+', note: 'reads argument sentence to peer' },
  { focus: '0', independence: '0', note: 'searches sources with checklist' },
  { participation: '0', note: 'asks for source check' },
  { focus: '+', participation: '0', note: 'selects more relevant source' },
  { independence: '0', note: 'rewrites source content in own words' },
  { participation: '+', note: 'presents finding with notes' },
  { focus: '+', independence: '0', note: 'source confidence improving' },
  { focus: '0', participation: '+', note: 'joins debate preparation quickly' },
  { independence: '0', note: 'uses argument card to respond' },
  { participation: '+', note: 'builds on another viewpoint' },
  { focus: '+', note: 'keeps debate thread' },
  { independence: '0', participation: '+', note: 'states opinion with support' },
  { focus: '+', independence: '0', note: 'uses counterargument prompt' },
  { participation: '+', note: 'debate contribution more sustained' },
  { focus: '+', independence: '+', note: 'starts preparation without reminder' },
  { participation: '+', independence: '+', note: 'supports pair rehearsal' },
  { focus: '+', note: 'ready for more independent text analysis' },
];

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

function localizedFromCurriculumItem(item) {
  if (item?.label && typeof item.label === 'object') {
    return localized(resolveLocalizedValue(item.label, 'en', item.id), resolveLocalizedValue(item.label, 'sv', item.id));
  }

  return localized(item.labelEn || item.label || item.title || item.id, item.labelSv || item.officialTitleSv || item.label || item.title || item.id);
}

function buildMathsCurriculum() {
  const mathsAreaTeachingUnits = mathsCurriculumAreas.map((area, index) => ({
    id: area.id,
    label: localizedFromCurriculumItem(area),
    curriculumAreaIds: [area.id],
    defaultAbilityIds: (area.observationDimensions || []).map((dimension) => dimension.id),
    order: area.order || index + 1,
  }));

  return buildDedicatedCurriculum({
    curriculumAreas: mathsCurriculumAreas,
    teachingUnits: mathsAreaTeachingUnits,
    skills: mathsAbilities,
  });
}

function buildDedicatedCurriculum({ curriculumAreas, teachingUnits, skills }) {
  const areas = curriculumAreas.map((area, index) => ({
    id: area.id,
    title: localizedFromCurriculumItem(area),
    label: localizedFromCurriculumItem(area),
    observationDimensions: (area.observationDimensions || []).map((dimension, dimensionIndex) => ({
      id: dimension.id,
      title: localizedFromCurriculumItem(dimension),
      label: localizedFromCurriculumItem(dimension),
      order: dimensionIndex + 1,
    })),
    order: area.order || index + 1,
  }));
  const dimensionsById = new Map(
    areas.flatMap((area) => (area.observationDimensions || []).map((dimension) => [dimension.id, dimension])),
  );
  const skillSource = [...dimensionsById.values()];

  (skills || []).forEach((skill) => {
    if (!skill?.id || dimensionsById.has(skill.id)) {
      return;
    }

    skillSource.push(skill);
  });

  const curriculumSkills = skillSource.map((skill, index) => ({
    id: skill.id,
    title: localizedFromCurriculumItem(skill),
    label: localizedFromCurriculumItem(skill),
    order: skill.order || index + 1,
  }));
  const unitList = teachingUnits.map((unit, index) => {
    const primaryAreaId = unit.curriculumAreaIds?.[0] || areas[index % areas.length]?.id;
    const linkedAreaDimensions = (unit.curriculumAreaIds || [primaryAreaId])
      .flatMap((areaId) => areas.find((area) => area.id === areaId)?.observationDimensions || []);
    const unitObservationDimensions = (unit.observationDimensions?.length ? unit.observationDimensions : linkedAreaDimensions)
      .map((dimension) => ({
        id: dimension.id,
        title: localizedFromCurriculumItem(dimension),
        label: localizedFromCurriculumItem(dimension),
        order: dimension.order,
      }));

    return {
      id: unit.id,
      title: localizedFromCurriculumItem(unit),
      label: localizedFromCurriculumItem(unit),
      curriculumAreaId: primaryAreaId,
      curriculumAreaIds: [...(unit.curriculumAreaIds || [primaryAreaId]).filter(Boolean)],
      observationDimensions: unitObservationDimensions,
      skillIds: [...(unit.defaultAbilityIds || unitObservationDimensions.map((dimension) => dimension.id) || curriculumSkills.map((skill) => skill.id)).filter(Boolean)],
      order: unit.order || index + 1,
    };
  });

  return {
    areas,
    skills: curriculumSkills,
    observationLevels: [
      { id: 'emerging', label: localized('Emerging', 'P\u00e5 v\u00e4g'), order: 1 },
      { id: 'developing', label: localized('Developing', 'Utvecklas'), order: 2 },
      { id: 'secure', label: localized('Secure', 'S\u00e4ker'), order: 3 },
      { id: 'advanced', label: localized('Advanced', 'Avancerad'), order: 4 },
    ],
    teachingUnits: unitList,
  };
}

function buildMusicCurriculum() {
  return buildDedicatedCurriculum({
    curriculumAreas: musicCurriculumAreas,
    teachingUnits: musicTeachingUnits,
  });
}

function buildPhysicalEducationCurriculum() {
  return buildDedicatedCurriculum({
    curriculumAreas: physicalEducationCurriculumAreas,
    teachingUnits: physicalEducationTeachingUnits,
  });
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
    'settles with text preview': 'kommer in i arbetet med text\u00f6verblick',
    'needs vocabulary support before reading': 'beh\u00f6ver ordf\u00f6rr\u00e5dsst\u00f6d f\u00f6re l\u00e4sning',
    'shares a simple inference with partner': 'delar en enkel inferens med partner',
    'uses reading strategy when prompted': 'anv\u00e4nder l\u00e4sstrategi vid p\u00e5minnelse',
    'tracks details more carefully': 'f\u00f6ljer detaljer mer noggrant',
    'summarises paragraph with scaffold': 'sammanfattar stycke med st\u00f6dmall',
    'starts writing plan with support': 'p\u00e5b\u00f6rjar skrivplan med st\u00f6d',
    'grammar choices need checking': 'grammatiska val beh\u00f6ver kontrolleras',
    'accepts model sentence revision': 'tar emot modell f\u00f6r meningsbearbetning',
    'uses feedback to improve structure': 'anv\u00e4nder feedback f\u00f6r att f\u00f6rb\u00e4ttra struktur',
    'edits spelling with checklist': 'bearbetar stavning med checklista',
    'reads draft sentence aloud to peer': 'l\u00e4ser utkastmening h\u00f6gt f\u00f6r kamrat',
    'prepares oral notes carefully': 'f\u00f6rbereder muntliga st\u00f6dord noggrant',
    'speaks briefly after rehearsal': 'talar kort efter repetition',
    'uses key vocabulary in presentation': 'anv\u00e4nder centralt ordf\u00f6rr\u00e5d i presentation',
    'checks pronunciation before recording': 'kontrollerar uttal f\u00f6re inspelning',
    'answers one follow-up question': 'svarar p\u00e5 en f\u00f6ljdfr\u00e5ga',
    'presentation confidence improving': 'presentationssj\u00e4lvf\u00f6rtroendet utvecklas',
    'joins paired discussion quickly': 'kommer snabbt in i pardiskussion',
    'uses prompt card to respond': 'anv\u00e4nder st\u00f6dkort f\u00f6r att svara',
    'builds on classmate idea': 'bygger vidare p\u00e5 klasskamrats id\u00e9',
    'keeps discussion thread': 'h\u00e5ller kvar diskussionstr\u00e5den',
    'expresses opinion with reason': 'uttrycker \u00e5sikt med sk\u00e4l',
    'uses strategy to ask for clarification': 'anv\u00e4nder strategi f\u00f6r att be om f\u00f6rtydligande',
    'discussion contribution more sustained': 'diskussionsbidraget blir mer uth\u00e5lligt',
    'starts task without reminder': 'startar uppgiften utan p\u00e5minnelse',
    'supports pair interaction': 'st\u00f6ttar parinteraktion',
    'ready for more independent text work': 'redo f\u00f6r mer sj\u00e4lvst\u00e4ndigt textarbete',
    'starts novel reading with support': 'p\u00e5b\u00f6rjar romanl\u00e4sning med st\u00f6d',
    'needs help finding key events': 'beh\u00f6ver hj\u00e4lp att hitta centrala h\u00e4ndelser',
    'shares interpretation in pair': 'delar tolkning i par',
    'uses summary frame': 'anv\u00e4nder sammanfattningsmall',
    'tracks theme more clearly': 'f\u00f6ljer tema tydligare',
    'explains character choice with scaffold': 'f\u00f6rklarar karakt\u00e4rsval med st\u00f6dstruktur',
    'plans argumentative text with prompts': 'planerar argumenterande text med st\u00f6dfr\u00e5gor',
    'needs support choosing evidence': 'beh\u00f6ver st\u00f6d att v\u00e4lja bel\u00e4gg',
    'revises argument after model': 'bearbetar argument efter modell',
    'checks structure with writing frame': 'kontrollerar struktur med skrivram',
    'uses spelling routine carefully': 'anv\u00e4nder stavningsrutin noggrant',
    'reads argument sentence to peer': 'l\u00e4ser argumentmening f\u00f6r kamrat',
    'searches sources with checklist': 's\u00f6ker k\u00e4llor med checklista',
    'asks for source check': 'ber om k\u00e4llkontroll',
    'selects more relevant source': 'v\u00e4ljer en mer relevant k\u00e4lla',
    'rewrites source content in own words': 'omformulerar k\u00e4llinneh\u00e5ll med egna ord',
    'presents finding with notes': 'presenterar resultat med st\u00f6danteckningar',
    'source confidence improving': 's\u00e4kerheten i k\u00e4llarbete utvecklas',
    'joins debate preparation quickly': 'kommer snabbt in i debattf\u00f6rberedelse',
    'uses argument card to respond': 'anv\u00e4nder argumentkort f\u00f6r att svara',
    'builds on another viewpoint': 'bygger vidare p\u00e5 ett annat perspektiv',
    'keeps debate thread': 'h\u00e5ller kvar debattens tr\u00e5d',
    'states opinion with support': 'formulerar \u00e5sikt med st\u00f6d',
    'uses counterargument prompt': 'anv\u00e4nder st\u00f6d f\u00f6r motargument',
    'debate contribution more sustained': 'debattbidraget blir mer uth\u00e5lligt',
    'supports pair rehearsal': 'st\u00f6ttar parrepetition',
    'ready for more independent text analysis': 'redo f\u00f6r mer sj\u00e4lvst\u00e4ndig textanalys',
    'confident start with guitar': 's\u00e4ker start med gitarr',
    'practises chord changes without prompt': '\u00f6var ackordbyten utan p\u00e5minnelse',
    'secure guitar contribution in pair practice': 's\u00e4kert gitarrbidrag i par\u00f6vning',
    'steady effort on drum pattern': 'stabil anstr\u00e4ngning i trumkomp',
    'needs count-in for drum transitions': 'beh\u00f6ver inr\u00e4kning vid trum\u00f6verg\u00e5ngar',
    'keeps simple drum part with reminders': 'h\u00e5ller enkel trumst\u00e4mma med p\u00e5minnelser',
    'strong band rehearsal contribution': 'starkt bidrag i bandrepetition',
    'holds own part in ensemble': 'h\u00e5ller egen st\u00e4mma i ensemble',
    'adjusts volume and entry with confidence': 'anpassar volym och insats med s\u00e4kerhet',
    'composition writing dip begins': 'svacka i kompositionsskrivande inleds',
    'avoids committing musical idea to paper': 'undviker att f\u00e4sta musikalisk id\u00e9 p\u00e5 papper',
    'reluctant to show composition draft': 'tvekar att visa kompositionsutkast',
    'shares a reduced composition idea after support': 'delar en avgr\u00e4nsad kompositionsid\u00e9 efter st\u00f6d',
    'showcase preparation remains difficult': 'f\u00f6rberedelse inf\u00f6r visning \u00e4r fortsatt sv\u00e5r',
    'shows short extract with structured support': 'visar kort utdrag med strukturerat st\u00f6d',
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

function buildMusicEliasObservationWindows() {
  return musicEliasObservationDates.map((date, index) => ({
    date,
    ...musicEliasObservationPattern[index % musicEliasObservationPattern.length],
  }));
}

function buildMathematicsEliasObservationWindows() {
  return mathematicsEliasObservationDates.map((date, index) => ({
    date,
    ...mathematicsEliasObservationPattern[index % mathematicsEliasObservationPattern.length],
  }));
}

function buildEnglishEliasObservationWindows() {
  return englishEliasObservationDates.map((date, index) => ({
    date,
    ...englishEliasObservationPattern[index % englishEliasObservationPattern.length],
  }));
}

function buildSwedishEliasObservationWindows() {
  return swedishEliasObservationDates.map((date, index) => ({
    date,
    ...swedishEliasObservationPattern[index % swedishEliasObservationPattern.length],
  }));
}

function getLearningObservationWindows(subjectId, student, profile) {
  if (subjectId === 'english' && student.id === 'elias-nilsson') {
    return buildEnglishEliasObservationWindows();
  }

  if (subjectId === 'swedish' && student.id === 'elias-nilsson') {
    return buildSwedishEliasObservationWindows();
  }

  if (subjectId === 'music' && student.id === 'elias-nilsson') {
    return buildMusicEliasObservationWindows();
  }

  if (subjectId === 'mathematics' && student.id === 'elias-nilsson') {
    return buildMathematicsEliasObservationWindows();
  }

  if (subjectId === 'physical-education' && student.id === 'elias-nilsson') {
    return buildPhysicalEducationEliasObservationWindows();
  }

  return learningObservationWindows[profile.pattern] || learningObservationWindows.steady;
}

function buildCurriculum(subjectId) {
  if (subjectId === 'mathematics') {
    return buildMathsCurriculum();
  }
  if (subjectId === 'music') {
    return buildMusicCurriculum();
  }
  if (subjectId === 'physical-education') {
    return buildPhysicalEducationCurriculum();
  }

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
        const musicEliasScores = [17, 12, 16, 8, 9];
        const profileScores = subjectId === 'music' && student.id === 'elias-nilsson'
          ? musicEliasScores
          : profile.assessmentScores;
        const score = absent ? null : (profileScores[assessmentIndex] ?? 12);
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
  const mathematicsEliasAssessments = subjectId === 'mathematics'
    ? [
      ['2026-01-16', 'number-sense', localized('Homework check: fractions and percentages', 'L\u00e4xkontroll: br\u00e5k och procent'), 12, 6, 9],
      ['2026-01-23', 'number-sense', localized('Exit ticket: decimal-percent links', 'Exit ticket: decimal- och procentkopplingar'), 8, 4, 6],
      ['2026-01-30', 'number-sense', localized('Short quiz: fractions, decimals and percentages', 'Kort quiz: br\u00e5k, decimaler och procent'), 20, 10, 15],
      ['2026-02-06', 'algebra', localized('Homework check: algebraic expressions', 'L\u00e4xkontroll: algebraiska uttryck'), 10, 5, 6],
      ['2026-02-13', 'algebra', localized('Lesson test: simplify expressions', 'Lektionstest: f\u00f6renkla uttryck'), 16, 8, 8],
      ['2026-02-20', 'algebra', localized('Exit ticket: equation steps', 'Exit ticket: ekvationssteg'), 8, 4, 3],
      ['2026-02-27', 'algebra', localized('Checkpoint: equations', 'Kontroll: ekvationer'), 20, 10, 8],
      ['2026-03-06', 'algebra', localized('Re-check: equations with one transformation', 'Omkontroll: ekvationer med en omformning'), 12, 6, 7],
      ['2026-03-13', 'algebra', localized('Lesson test: equation methods', 'Lektionstest: ekvationsmetoder'), 20, 10, 12],
      ['2026-03-20', 'geometry', localized('Homework check: geometry vocabulary', 'L\u00e4xkontroll: geometribegrepp'), 10, 5, 7],
      ['2026-03-27', 'geometry', localized('Practical checkpoint: construction and diagrams', 'Praktisk kontroll: konstruktion och diagram'), 18, 9, 12],
      ['2026-04-10', 'geometry', localized('Lesson test: angle reasoning', 'Lektionstest: vinkelresonemang'), 20, 10, 15],
      ['2026-04-17', 'geometry', localized('Investigation hand-in: scale and similarity', 'Inl\u00e4mning: skala och likformighet'), 16, 8, 12],
      ['2026-04-24', 'probability-statistics', localized('Data handling checkpoint', 'Kontroll: statistik och data'), 20, 10, 13],
      ['2026-05-01', 'probability-statistics', localized('Homework check: diagrams and averages', 'L\u00e4xkontroll: diagram och l\u00e4gesm\u00e5tt'), 12, 6, 8],
      ['2026-05-08', 'relationships-change', localized('Exit ticket: coordinates and graphs', 'Exit ticket: koordinater och grafer'), 10, 5, 7],
      ['2026-05-15', 'relationships-change', localized('Lesson test: proportionality and graphs', 'Lektionstest: proportionalitet och grafer'), 20, 10, 14],
      ['2026-05-22', 'mathematical-abilities', localized('Reasoning task: explain a method', 'Resonemangsuppgift: f\u00f6rklara en metod'), 16, 8, 12],
      ['2026-05-29', 'relationships-change', localized('Term checkpoint: functions and models', 'Terminskontroll: funktioner och modeller'), 24, 12, 17],
    ].map(([date, teachingUnitId, title, max, pass, score], assessmentIndex) => ({
      id: `mathematics-8a-elias-assessment-extra-${assessmentIndex + 1}`,
      type: 'assessment',
      title,
      date,
      teachingUnitId,
      max,
      pass,
      results: [
        {
          studentId: 'elias-nilsson',
          score,
          percentage: Math.round((score / max) * 100),
          passed: score >= pass,
          absent: false,
          warning: score < pass,
        },
      ],
    }))
    : [];
  const englishEliasHomeworkAssessments = subjectId === 'english'
    ? [
      ['2026-01-16', 'writing', localized('Homework: spelling patterns', 'L\u00e4xa: stavningsm\u00f6nster'), 10, 5, 4],
      ['2026-01-23', 'reading', localized('Homework: vocabulary from text', 'L\u00e4xa: ord fr\u00e5n text'), 10, 5, 5],
      ['2026-01-30', 'writing', localized('Homework: sentence punctuation', 'L\u00e4xa: meningsskiljetecken'), 10, 5, 5],
      ['2026-02-06', 'writing', localized('Homework: verb forms', 'L\u00e4xa: verbformer'), 10, 5, 6],
      ['2026-02-13', 'writing', localized('Homework: paragraph connectors', 'L\u00e4xa: styckesbindning'), 10, 5, 5],
      ['2026-02-20', 'writing', localized('Homework: grammar and spelling check', 'L\u00e4xa: grammatik- och stavningskontroll'), 10, 5, 6],
      ['2026-02-27', 'writing', localized('Short test: writing accuracy', 'Kort test: skriftlig korrekthet'), 20, 10, 11],
      ['2026-03-06', 'speaking', localized('Homework: pronunciation practice', 'L\u00e4xa: uttals\u00f6vning'), 10, 5, 6],
      ['2026-03-13', 'writing', localized('Homework: word order', 'L\u00e4xa: ordf\u00f6ljd'), 10, 5, 6],
      ['2026-03-20', 'speaking', localized('Short test: oral preparation notes', 'Kort test: muntliga st\u00f6dord'), 12, 6, 8],
      ['2026-03-27', 'speaking', localized('Presentation checkpoint', 'Presentationskontroll'), 20, 10, 13],
      ['2026-04-10', 'interaction', localized('Homework: opinion phrases', 'L\u00e4xa: fraser f\u00f6r \u00e5sikter'), 10, 5, 6],
      ['2026-04-17', 'interaction', localized('Homework: response phrases', 'L\u00e4xa: svarsfraser'), 10, 5, 7],
      ['2026-04-24', 'interaction', localized('Discussion checkpoint', 'Diskussionskontroll'), 16, 8, 10],
      ['2026-05-01', 'writing', localized('Homework: spelling review', 'L\u00e4xa: stavningsrepetition'), 10, 5, 7],
      ['2026-05-08', 'interaction', localized('Homework: discussion repair strategies', 'L\u00e4xa: strategier f\u00f6r att reparera samtal'), 10, 5, 7],
      ['2026-05-15', 'interaction', localized('Term checkpoint: interaction', 'Terminskontroll: interaktion'), 20, 10, 14],
    ].map(([date, teachingUnitId, title, max, pass, score], assessmentIndex) => ({
      id: `english-8a-elias-homework-${assessmentIndex + 1}`,
      type: 'assessment',
      title,
      date,
      teachingUnitId,
      max,
      pass,
      results: [
        {
          studentId: 'elias-nilsson',
          score,
          percentage: Math.round((score / max) * 100),
          passed: score >= pass,
          absent: false,
          warning: score < pass,
        },
      ],
    }))
    : [];
  const swedishEliasHomeworkAssessments = subjectId === 'swedish'
    ? [
      ['2026-01-16', 'language-usage', localized('Homework: spelling patterns', 'L\u00e4xa: stavningsm\u00f6nster'), 10, 5, 4],
      ['2026-01-23', 'reading-comprehension', localized('Homework: vocabulary from novel', 'L\u00e4xa: ord fr\u00e5n romanen'), 10, 5, 5],
      ['2026-01-30', 'language-usage', localized('Homework: punctuation', 'L\u00e4xa: skiljetecken'), 10, 5, 5],
      ['2026-02-06', 'language-usage', localized('Homework: word classes', 'L\u00e4xa: ordklasser'), 10, 5, 6],
      ['2026-02-13', 'writing', localized('Homework: paragraph structure', 'L\u00e4xa: styckestruktur'), 10, 5, 5],
      ['2026-02-20', 'language-usage', localized('Homework: spelling and grammar check', 'L\u00e4xa: stavnings- och grammatikkontroll'), 10, 5, 6],
      ['2026-02-27', 'writing', localized('Short test: argumentative writing', 'Kort test: argumenterande skrivande'), 20, 10, 11],
      ['2026-03-06', 'information-search-source-criticism', localized('Homework: source notes', 'L\u00e4xa: k\u00e4llanteckningar'), 10, 5, 6],
      ['2026-03-13', 'language-usage', localized('Homework: sentence variation', 'L\u00e4xa: meningsvariation'), 10, 5, 6],
      ['2026-03-20', 'information-search-source-criticism', localized('Short test: source credibility', 'Kort test: k\u00e4llors trov\u00e4rdighet'), 12, 6, 8],
      ['2026-03-27', 'speaking-conversation', localized('Presentation checkpoint', 'Presentationskontroll'), 20, 10, 13],
      ['2026-04-10', 'speaking-conversation', localized('Homework: debate phrases', 'L\u00e4xa: debattfraser'), 10, 5, 6],
      ['2026-04-17', 'speaking-conversation', localized('Homework: counterarguments', 'L\u00e4xa: motargument'), 10, 5, 7],
      ['2026-04-24', 'speaking-conversation', localized('Debate checkpoint', 'Debattkontroll'), 16, 8, 10],
      ['2026-05-01', 'language-usage', localized('Homework: spelling review', 'L\u00e4xa: stavningsrepetition'), 10, 5, 7],
      ['2026-05-08', 'speaking-conversation', localized('Homework: developing responses', 'L\u00e4xa: utveckla svar'), 10, 5, 7],
      ['2026-05-15', 'speaking-conversation', localized('Term checkpoint: oral reasoning', 'Terminskontroll: muntligt resonemang'), 20, 10, 14],
    ].map(([date, teachingUnitId, title, max, pass, score], assessmentIndex) => ({
      id: `swedish-8a-elias-homework-${assessmentIndex + 1}`,
      type: 'assessment',
      title,
      date,
      teachingUnitId,
      max,
      pass,
      results: [
        {
          studentId: 'elias-nilsson',
          score,
          percentage: Math.round((score / max) * 100),
          passed: score >= pass,
          absent: false,
          warning: score < pass,
        },
      ],
    }))
    : [];
  const englishEliasObservationClusters = subjectId === 'english'
    ? [
      ['2026-01-22', 'listening', [
        ['listening-main-ideas', 'developing'],
        ['listening-details', 'emerging'],
        ['listening-strategies', 'developing'],
      ]],
      ['2026-02-12', 'reading', [
        ['reading-main-ideas', 'developing'],
        ['reading-details', 'developing'],
        ['reading-interpretation', 'emerging'],
      ]],
      ['2026-03-12', 'speaking', [
        ['speaking-content-development', 'developing'],
        ['speaking-clarity', 'developing'],
        ['speaking-fluency', 'secure'],
      ]],
      ['2026-04-16', 'writing', [
        ['writing-content-development', 'secure'],
        ['writing-structure-coherence', 'developing'],
        ['writing-purpose-audience-context', 'developing'],
      ]],
      ['2026-05-14', 'listening', [
        ['listening-main-ideas', 'secure'],
        ['listening-details', 'secure'],
        ['listening-language-variation', 'developing'],
      ]],
      ['2026-05-14', 'reading', [
        ['reading-main-ideas', 'secure'],
        ['reading-interpretation', 'developing'],
        ['reading-text-types-context', 'developing'],
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
  const englishEliasActivityTimeline = subjectId === 'english'
    ? [
      ['2026-01-15', 'reading-text-work', localized('Reading / text work', 'L\u00e4sning / textarbete'), 'reading', [
        ['reading-text-work-reading-main-ideas', 'reading-main-ideas', 'developing'],
        ['reading-text-work-reading-details', 'reading-details', 'emerging'],
      ]],
      ['2026-01-29', 'reading-text-work', localized('Reading / text work', 'L\u00e4sning / textarbete'), 'reading', [
        ['reading-text-work-reading-interpretation', 'reading-interpretation', 'developing'],
        ['reading-text-work-reading-strategies', 'reading-strategies', 'developing'],
      ]],
      ['2026-02-05', 'writing-task', localized('Writing task', 'Skrivuppgift'), 'writing', [
        ['writing-task-writing-content-development', 'writing-content-development', 'developing'],
        ['writing-task-writing-structure-coherence', 'writing-structure-coherence', 'emerging'],
      ]],
      ['2026-02-19', 'writing-task', localized('Writing task', 'Skrivuppgift'), 'writing', [
        ['writing-task-writing-vocabulary-variation', 'writing-vocabulary-variation', 'developing'],
        ['writing-task-writing-grammar-accuracy', 'writing-grammar-accuracy', 'developing'],
      ]],
      ['2026-03-05', 'speaking-presentation', localized('Speaking / presentation', 'Tal / presentation'), 'speaking', [
        ['speaking-presentation-speaking-clarity', 'speaking-clarity', 'developing'],
        ['speaking-presentation-speaking-fluency', 'speaking-fluency', 'developing'],
      ]],
      ['2026-03-19', 'speaking-presentation', localized('Speaking / presentation', 'Tal / presentation'), 'speaking', [
        ['speaking-presentation-speaking-vocabulary-variation', 'speaking-vocabulary-variation', 'secure'],
        ['speaking-presentation-speaking-pronunciation', 'speaking-pronunciation', 'developing'],
      ]],
      ['2026-04-16', 'discussion-interaction', localized('Discussion / interaction', 'Diskussion / interaktion'), 'interaction', [
        ['discussion-interaction-interaction-participating', 'interaction-participating', 'developing'],
        ['discussion-interaction-interaction-responding-developing', 'interaction-responding-developing', 'developing'],
      ]],
      ['2026-05-07', 'discussion-interaction', localized('Discussion / interaction', 'Diskussion / interaktion'), 'interaction', [
        ['discussion-interaction-interaction-expressing-opinions', 'interaction-expressing-opinions', 'secure'],
        ['discussion-interaction-interaction-communication-strategies', 'interaction-communication-strategies', 'developing'],
      ]],
    ].flatMap(([date, contextId, contextLabel, teachingUnitId, captures], clusterIndex) => captures.map(([capturePointId, skillId, levelId], captureIndex) => ({
      id: `english-8a-evidence-elias-activity-${clusterIndex + 1}-${captureIndex + 1}`,
      type: 'observation',
      studentId: 'elias-nilsson',
      date,
      teachingUnitId,
      skillId,
      capturePointId,
      contextId,
      contextLabel,
      levelId,
    })))
    : [];
  const swedishEliasActivityTimeline = subjectId === 'swedish'
    ? [
      ['2026-01-15', 'reading-novel-discussion', localized('Novel reading and discussion', 'Romanl\u00e4sning och textsamtal'), 'reading-comprehension', [
        ['reading-novel-discussion-summarising', 'summarising', 'developing'],
        ['reading-novel-discussion-interpreting-content', 'interpreting-content', 'emerging'],
      ]],
      ['2026-01-29', 'reading-novel-discussion', localized('Novel reading and discussion', 'Romanl\u00e4sning och textsamtal'), 'reading-comprehension', [
        ['reading-novel-discussion-reasoning-about-text', 'reasoning-about-text', 'developing'],
        ['reading-novel-discussion-message-theme', 'message-theme', 'developing', 'literature-text-analysis'],
      ]],
      ['2026-02-05', 'argumentative-writing', localized('Argumentative writing', 'Argumenterande text'), 'writing', [
        ['argumentative-writing-writing-structure', 'writing-structure', 'developing'],
        ['argumentative-writing-supporting-arguments', 'supporting-arguments', 'emerging', 'speaking-conversation'],
      ]],
      ['2026-02-19', 'argumentative-writing', localized('Argumentative writing', 'Argumenterande text'), 'writing', [
        ['argumentative-writing-adaptation-text-type-purpose-recipient', 'adaptation-text-type-purpose-recipient', 'developing'],
        ['argumentative-writing-language-correctness', 'language-correctness', 'developing'],
      ]],
      ['2026-03-05', 'source-research-presentation', localized('Research and oral presentation', 'Informationss\u00f6kning och muntlig presentation'), 'information-search-source-criticism', [
        ['source-research-presentation-selecting-relevant-sources', 'selecting-relevant-sources', 'developing'],
        ['source-research-presentation-credibility-relevance', 'credibility-relevance', 'developing'],
      ]],
      ['2026-03-19', 'source-research-presentation', localized('Research and oral presentation', 'Informationss\u00f6kning och muntlig presentation'), 'information-search-source-criticism', [
        ['source-research-presentation-processing-own-words', 'processing-own-words', 'secure'],
        ['source-research-presentation-oral-presentation-adaptation', 'oral-presentation-adaptation', 'developing', 'speaking-conversation'],
      ]],
      ['2026-04-16', 'class-debate', localized('Class debate', 'Klassdebatt'), 'speaking-conversation', [
        ['class-debate-participating-in-conversation', 'participating-in-conversation', 'developing'],
        ['class-debate-developing-conversation', 'developing-conversation', 'developing'],
      ]],
      ['2026-05-07', 'class-debate', localized('Class debate', 'Klassdebatt'), 'speaking-conversation', [
        ['class-debate-expressing-opinions', 'expressing-opinions', 'secure'],
        ['class-debate-supporting-arguments', 'supporting-arguments', 'developing'],
      ]],
    ].flatMap(([date, contextId, contextLabel, teachingUnitId, captures], clusterIndex) => captures.map(([capturePointId, skillId, levelId, captureTeachingUnitId], captureIndex) => ({
      id: `swedish-8a-evidence-elias-activity-${clusterIndex + 1}-${captureIndex + 1}`,
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
  const mathematicsEliasObservationClusters = subjectId === 'mathematics'
    ? [
      ['2026-01-15', 'number-sense', [
        ['fractions-decimals-percentages', 'developing'],
        ['calculations-number-strategies', 'developing'],
        ['estimation-reasonableness', 'emerging'],
      ]],
      ['2026-01-29', 'number-sense', [
        ['fractions-decimals-percentages', 'secure'],
        ['calculations-number-strategies', 'developing'],
        ['methods', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-02-12', 'algebra', [
        ['algebraic-expressions', 'developing'],
        ['simplification-rules', 'emerging'],
        ['concepts', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-02-26', 'algebra', [
        ['equations', 'emerging'],
        ['algebraic-modelling', 'emerging'],
        ['reasoning', 'emerging', 'mathematical-abilities'],
      ]],
      ['2026-03-12', 'algebra', [
        ['equations', 'developing'],
        ['simplification-rules', 'developing'],
        ['methods', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-03-26', 'geometry', [
        ['geometrical-concepts-properties', 'developing'],
        ['construction-representation', 'developing'],
        ['problem-solving', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-04-16', 'geometry', [
        ['geometrical-relationships', 'secure'],
        ['construction-representation', 'secure'],
        ['reasoning', 'secure', 'mathematical-abilities'],
      ]],
      ['2026-05-07', 'relationships-change', [
        ['coordinates-graphs-formulas', 'developing'],
        ['relationships-between-quantities', 'secure'],
        ['functions-models', 'developing'],
      ]],
      ['2026-05-21', 'mathematical-abilities', [
        ['methods', 'secure'],
        ['reasoning', 'secure'],
        ['communication', 'developing'],
      ]],
      ['2026-01-12', 'number-sense', [
        ['numbers-properties', 'developing'],
        ['fractions-decimals-percentages', 'emerging'],
        ['concepts', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-01-20', 'number-sense', [
        ['fractions-decimals-percentages', 'developing'],
        ['calculations-number-strategies', 'developing'],
        ['problem-solving', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-01-27', 'number-sense', [
        ['fractions-decimals-percentages', 'secure'],
        ['estimation-reasonableness', 'developing'],
        ['communication', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-02-03', 'algebra', [
        ['algebraic-expressions', 'developing'],
        ['patterns-generalisation', 'developing'],
        ['concepts', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-02-10', 'algebra', [
        ['simplification-rules', 'emerging'],
        ['algebraic-expressions', 'developing'],
        ['methods', 'emerging', 'mathematical-abilities'],
      ]],
      ['2026-02-17', 'algebra', [
        ['equations', 'emerging'],
        ['simplification-rules', 'developing'],
        ['reasoning', 'emerging', 'mathematical-abilities'],
      ]],
      ['2026-02-24', 'algebra', [
        ['equations', 'emerging'],
        ['algebraic-modelling', 'emerging'],
        ['communication', 'emerging', 'mathematical-abilities'],
      ]],
      ['2026-03-03', 'algebra', [
        ['equations', 'developing'],
        ['simplification-rules', 'developing'],
        ['methods', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-03-10', 'algebra', [
        ['equations', 'developing'],
        ['algebraic-modelling', 'developing'],
        ['reasoning', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-03-17', 'geometry', [
        ['geometrical-concepts-properties', 'developing'],
        ['construction-representation', 'developing'],
        ['concepts', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-03-24', 'geometry', [
        ['length-area-volume', 'developing'],
        ['construction-representation', 'developing'],
        ['problem-solving', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-03-31', 'geometry', [
        ['geometrical-relationships', 'developing'],
        ['scale-similarity', 'emerging'],
        ['reasoning', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-04-07', 'geometry', [
        ['geometrical-relationships', 'secure'],
        ['construction-representation', 'secure'],
        ['communication', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-04-14', 'geometry', [
        ['scale-similarity', 'developing'],
        ['geometrical-relationships', 'secure'],
        ['reasoning', 'secure', 'mathematical-abilities'],
      ]],
      ['2026-04-21', 'probability-statistics', [
        ['tables-diagrams-data', 'developing'],
        ['measures-central-tendency', 'developing'],
        ['concepts', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-04-28', 'probability-statistics', [
        ['variation-distribution', 'developing'],
        ['interpretation-evaluation-data', 'developing'],
        ['reasoning', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-05-05', 'relationships-change', [
        ['relationships-between-quantities', 'developing'],
        ['coordinates-graphs-formulas', 'developing'],
        ['methods', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-05-12', 'relationships-change', [
        ['proportionality', 'developing'],
        ['coordinates-graphs-formulas', 'developing'],
        ['problem-solving', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-05-19', 'relationships-change', [
        ['functions-models', 'developing'],
        ['rate-of-change', 'emerging'],
        ['communication', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-05-26', 'mathematical-abilities', [
        ['methods', 'secure'],
        ['reasoning', 'secure'],
        ['communication', 'secure'],
      ]],
    ].flatMap(([date, teachingUnitId, captures], clusterIndex) => captures.map(([skillId, levelId, captureTeachingUnitId], captureIndex) => ({
      id: `mathematics-8a-evidence-elias-extra-${clusterIndex + 1}-${captureIndex + 1}`,
      type: 'observation',
      studentId: 'elias-nilsson',
      date,
      teachingUnitId: captureTeachingUnitId || teachingUnitId,
      skillId,
      levelId,
    })))
    : [];
  const mathematicsEliasActivityTimeline = subjectId === 'mathematics'
    ? [
      ['2026-01-15', 'fractions-decimals-percentages', localized('Fractions, decimals and percentages', 'Br\u00e5k, decimaler och procent'), 'number-sense', [
        ['fractions-decimals-percentages-fractions-decimals-percentages', 'fractions-decimals-percentages', 'developing'],
        ['fractions-decimals-percentages-concepts', 'concepts', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-01-22', 'fractions-decimals-percentages', localized('Fractions, decimals and percentages', 'Br\u00e5k, decimaler och procent'), 'number-sense', [
        ['fractions-decimals-percentages-methods', 'methods', 'developing', 'mathematical-abilities'],
        ['fractions-decimals-percentages-problem-solving', 'problem-solving', 'emerging', 'mathematical-abilities'],
      ]],
      ['2026-01-29', 'fractions-decimals-percentages', localized('Fractions, decimals and percentages', 'Br\u00e5k, decimaler och procent'), 'number-sense', [
        ['fractions-decimals-percentages-fractions-decimals-percentages', 'fractions-decimals-percentages', 'secure'],
        ['fractions-decimals-percentages-reasoning', 'reasoning', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-02-12', 'equations', localized('Equations', 'Ekvationer'), 'algebra', [
        ['equations-equations', 'equations', 'emerging'],
        ['equations-concepts', 'concepts', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-02-26', 'equations', localized('Equations', 'Ekvationer'), 'algebra', [
        ['equations-methods', 'methods', 'emerging', 'mathematical-abilities'],
        ['equations-reasoning', 'reasoning', 'emerging', 'mathematical-abilities'],
      ]],
      ['2026-03-12', 'equations', localized('Equations', 'Ekvationer'), 'algebra', [
        ['equations-equations', 'equations', 'developing'],
        ['equations-communication', 'communication', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-03-26', 'geometry-investigation', localized('Geometry investigation', 'Geometrisk unders\u00f6kning'), 'geometry', [
        ['geometry-investigation-geometrical-concepts-properties', 'geometrical-concepts-properties', 'developing'],
        ['geometry-investigation-problem-solving', 'problem-solving', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-04-09', 'geometry-investigation', localized('Geometry investigation', 'Geometrisk unders\u00f6kning'), 'geometry', [
        ['geometry-investigation-geometrical-concepts-properties', 'geometrical-concepts-properties', 'secure'],
        ['geometry-investigation-reasoning', 'reasoning', 'secure', 'mathematical-abilities'],
      ]],
      ['2026-04-16', 'geometry-investigation', localized('Geometry investigation', 'Geometrisk unders\u00f6kning'), 'geometry', [
        ['geometry-investigation-communication', 'communication', 'developing', 'mathematical-abilities'],
        ['geometry-investigation-reasoning', 'reasoning', 'secure', 'mathematical-abilities'],
      ]],
      ['2026-01-12', 'fractions-decimals-percentages', localized('Fractions, decimals and percentages', 'Br\u00e5k, decimaler och procent'), 'number-sense', [
        ['fractions-decimals-percentages-fractions-decimals-percentages', 'fractions-decimals-percentages', 'emerging'],
        ['fractions-decimals-percentages-concepts', 'concepts', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-01-20', 'fractions-decimals-percentages', localized('Fractions, decimals and percentages', 'Br\u00e5k, decimaler och procent'), 'number-sense', [
        ['fractions-decimals-percentages-methods', 'methods', 'developing', 'mathematical-abilities'],
        ['fractions-decimals-percentages-problem-solving', 'problem-solving', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-02-03', 'equations', localized('Equations', 'Ekvationer'), 'algebra', [
        ['equations-concepts', 'concepts', 'developing', 'mathematical-abilities'],
        ['equations-equations', 'equations', 'emerging'],
      ]],
      ['2026-02-17', 'equations', localized('Equations', 'Ekvationer'), 'algebra', [
        ['equations-methods', 'methods', 'emerging', 'mathematical-abilities'],
        ['equations-reasoning', 'reasoning', 'emerging', 'mathematical-abilities'],
      ]],
      ['2026-03-03', 'equations', localized('Equations', 'Ekvationer'), 'algebra', [
        ['equations-equations', 'equations', 'developing'],
        ['equations-methods', 'methods', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-03-10', 'equations', localized('Equations', 'Ekvationer'), 'algebra', [
        ['equations-reasoning', 'reasoning', 'developing', 'mathematical-abilities'],
        ['equations-communication', 'communication', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-03-17', 'geometry-investigation', localized('Geometry investigation', 'Geometrisk unders\u00f6kning'), 'geometry', [
        ['geometry-investigation-geometrical-concepts-properties', 'geometrical-concepts-properties', 'developing'],
        ['geometry-investigation-problem-solving', 'problem-solving', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-03-31', 'geometry-investigation', localized('Geometry investigation', 'Geometrisk unders\u00f6kning'), 'geometry', [
        ['geometry-investigation-geometrical-concepts-properties', 'geometrical-concepts-properties', 'secure'],
        ['geometry-investigation-communication', 'communication', 'developing', 'mathematical-abilities'],
      ]],
      ['2026-04-14', 'geometry-investigation', localized('Geometry investigation', 'Geometrisk unders\u00f6kning'), 'geometry', [
        ['geometry-investigation-reasoning', 'reasoning', 'secure', 'mathematical-abilities'],
        ['geometry-investigation-communication', 'communication', 'secure', 'mathematical-abilities'],
      ]],
    ].flatMap(([date, contextId, contextLabel, teachingUnitId, captures], clusterIndex) => captures.map(([capturePointId, skillId, levelId, captureTeachingUnitId], captureIndex) => ({
      id: `mathematics-8a-evidence-elias-activity-${clusterIndex + 1}-${captureIndex + 1}`,
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
  const musicEliasProjectTimeline = subjectId === 'music'
    ? [
      ['2026-01-15', 'guitar-performance', localized('Guitar performance', 'Gitarrspel'), 'performance-security', [
        ['guitar-performance-technique', 'instrument-singing-technique', 'secure'],
        ['guitar-performance-pulse-rhythm', 'pulse-rhythm', 'secure'],
      ]],
      ['2026-01-22', 'guitar-performance', localized('Guitar performance', 'Gitarrspel'), 'performance-security', [
        ['guitar-performance-chord-changes', 'timing-continuity', 'secure'],
        ['guitar-performance-own-part', 'own-part-security', 'advanced'],
      ]],
      ['2026-01-29', 'guitar-performance', localized('Guitar performance', 'Gitarrspel'), 'ensemble-adaptation', [
        ['guitar-performance-adapts-to-group', 'dynamics-balance-adaptation', 'secure'],
        ['guitar-performance-pulse-rhythm', 'pulse-rhythm', 'advanced', 'performance-security'],
      ]],
      ['2026-02-05', 'drum-performance', localized('Drum performance', 'Trumspel'), 'performance-security', [
        ['drum-performance-coordination', 'instrument-singing-technique', 'developing'],
        ['drum-performance-pulse-rhythm', 'pulse-rhythm', 'developing'],
      ]],
      ['2026-02-12', 'drum-performance', localized('Drum performance', 'Trumspel'), 'performance-security', [
        ['drum-performance-continuity', 'own-part-security', 'developing'],
        ['drum-performance-form', 'musical-form-adaptation', 'developing', 'ensemble-adaptation'],
      ]],
      ['2026-02-19', 'drum-performance', localized('Drum performance', 'Trumspel'), 'ensemble-adaptation', [
        ['drum-performance-dynamics', 'dynamics-balance-adaptation', 'developing'],
        ['drum-performance-pulse-rhythm', 'pulse-rhythm', 'secure', 'performance-security'],
      ]],
      ['2026-03-05', 'band-performance', localized('Band performance', 'Bandspel'), 'ensemble-adaptation', [
        ['band-performance-pulse-rhythm', 'pulse-rhythm', 'secure', 'performance-security'],
        ['band-performance-shared-tempo', 'shared-pulse-tempo-adaptation', 'secure'],
      ]],
      ['2026-03-12', 'band-performance', localized('Band performance', 'Bandspel'), 'performance-security', [
        ['band-performance-own-part', 'own-part-security', 'advanced'],
        ['band-performance-form-transitions', 'musical-form-adaptation', 'secure', 'ensemble-adaptation'],
      ]],
      ['2026-03-19', 'band-performance', localized('Band performance', 'Bandspel'), 'musical-expression', [
        ['band-performance-dynamics-expression', 'dynamics-balance-adaptation', 'secure', 'ensemble-adaptation'],
        ['band-performance-own-part', 'own-part-security', 'advanced', 'performance-security'],
      ]],
      ['2026-03-26', 'scary-music-composition', localized('Writing scary music', 'Skapa skr\u00e4ckmusik'), 'musical-expression', [
        ['scary-music-communicates-idea', 'communicates-musical-idea', 'emerging'],
        ['scary-music-musical-elements', 'uses-musical-building-blocks', 'developing'],
      ]],
      ['2026-04-09', 'scary-music-composition', localized('Writing scary music', 'Skapa skr\u00e4ckmusik'), 'composition-form', [
        ['scary-music-creates-material', 'creates-musical-material', 'emerging'],
        ['scary-music-organises-form', 'organises-functional-form', 'emerging'],
      ]],
      ['2026-04-16', 'scary-music-composition', localized('Writing scary music', 'Skapa skr\u00e4ckmusik'), 'composition-form', [
        ['scary-music-revises', 'revises-composition', 'emerging'],
        ['scary-music-communicates-idea', 'communicates-musical-idea', 'developing', 'musical-expression'],
      ]],
      ['2026-04-23', 'scary-music-composition', localized('Writing scary music', 'Skapa skr\u00e4ckmusik'), 'musical-expression', [
        ['scary-music-musical-elements', 'uses-musical-building-blocks', 'developing'],
        ['scary-music-organises-form', 'organises-functional-form', 'developing', 'composition-form'],
      ]],
      ['2026-05-07', 'scary-music-composition', localized('Writing scary music', 'Skapa skr\u00e4ckmusik'), 'composition-form', [
        ['scary-music-creates-material', 'creates-musical-material', 'emerging'],
        ['scary-music-revises', 'revises-composition', 'emerging'],
      ]],
      ['2026-05-21', 'scary-music-composition', localized('Writing scary music', 'Skapa skr\u00e4ckmusik'), 'characteristics-comparison', [
        ['scary-music-musical-elements', 'uses-musical-building-blocks', 'developing', 'musical-expression'],
        ['scary-music-communicates-idea', 'communicates-musical-idea', 'developing', 'musical-expression'],
      ]],
    ].flatMap(([date, contextId, contextLabel, teachingUnitId, captures], clusterIndex) => captures.map(([capturePointId, skillId, levelId, captureTeachingUnitId], captureIndex) => ({
      id: `music-8a-evidence-elias-project-${clusterIndex + 1}-${captureIndex + 1}`,
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
  const timelineResponses = subjectId === 'mathematics'
    ? [
      {
        id: 'mathematics-8a-elias-timeline-response-1',
        type: 'timeline-comment',
        studentId: 'elias-nilsson',
        date: '2026-01-29',
        label: localized('Fraction confidence', 'S\u00e4kerhet i br\u00e5k'),
        comment: localized(
          'Use visual fraction and percentage models as a bridge into equations. He explains more clearly when the representation stays visible.',
          'Anv\u00e4nd visuella modeller f\u00f6r br\u00e5k och procent som bro in i ekvationer. Han f\u00f6rklarar tydligare n\u00e4r representationen finns kvar synligt.',
        ),
      },
      {
        id: 'mathematics-8a-elias-timeline-response-2',
        type: 'timeline-comment',
        studentId: 'elias-nilsson',
        date: '2026-02-26',
        label: localized('Equation dip', 'Svacka i ekvationer'),
        comment: localized(
          'Keep equation work to one transformation at a time. Pair him with a student who verbalises each step before writing.',
          'H\u00e5ll ekvationsarbetet till en omformning i taget. Para ihop honom med en elev som s\u00e4ger varje steg innan det skrivs.',
        ),
      },
      {
        id: 'mathematics-8a-elias-timeline-response-3',
        type: 'timeline-comment',
        studentId: 'elias-nilsson',
        date: '2026-04-09',
        label: localized('Geometry response', 'Respons i geometri'),
        comment: localized(
          'Geometry investigation works well: practical diagram first, then reasoning sentence. Use this structure again for graphs.',
          'Geometrisk unders\u00f6kning fungerar v\u00e4l: praktiskt diagram f\u00f6rst, sedan resonemangsmening. Anv\u00e4nd samma struktur igen f\u00f6r grafer.',
        ),
      },
    ]
    : subjectId === 'music'
    ? [
      {
        id: 'music-8a-elias-timeline-response-1',
        type: 'timeline-comment',
        studentId: 'elias-nilsson',
        date: '2026-01-22',
        label: localized('Guitar strength', 'Styrka i gitarr'),
        comment: localized(
          'Use guitar as an anchor role in later ensemble work. He is secure when the part is practical and audible.',
          'Anv\u00e4nd gitarr som ankarroll i senare ensemblearbete. Han \u00e4r s\u00e4ker n\u00e4r st\u00e4mman \u00e4r praktisk och h\u00f6rbar.',
        ),
      },
      {
        id: 'music-8a-elias-timeline-response-2',
        type: 'timeline-comment',
        studentId: 'elias-nilsson',
        date: '2026-02-12',
        label: localized('Drum routine', 'Trumrutin'),
        comment: localized(
          'Keep drums at a steady pattern level: count-in, repeat, then short transition practice.',
          'H\u00e5ll trummor p\u00e5 stabil komp-niv\u00e5: inr\u00e4kning, repetition och kort \u00f6vning p\u00e5 \u00f6verg\u00e5ngar.',
        ),
      },
      {
        id: 'music-8a-elias-timeline-response-3',
        type: 'timeline-comment',
        studentId: 'elias-nilsson',
        date: '2026-04-09',
        label: localized('Composition support', 'Kompositionsst\u00f6d'),
        comment: localized(
          'Reduce the written demand first: let him record two sound ideas, then name the musical choice afterwards.',
          'Minska skrivkravet f\u00f6rst: l\u00e5t honom spela in tv\u00e5 ljudid\u00e9er och s\u00e4tta ord p\u00e5 musikvalet efter\u00e5t.',
        ),
      },
      {
        id: 'music-8a-elias-timeline-response-4',
        type: 'timeline-comment',
        studentId: 'elias-nilsson',
        date: '2026-05-07',
        label: localized('Showcase scaffold', 'St\u00f6d inf\u00f6r visning'),
        comment: localized(
          'Offer a short extract or paired presentation. Keep the focus on the musical idea rather than extended written explanation.',
          'Erbjud kort utdrag eller parvis presentation. H\u00e5ll fokus p\u00e5 den musikaliska id\u00e9n snarare \u00e4n l\u00e5ng skriftlig f\u00f6rklaring.',
        ),
      },
    ]
    : subjectId === 'physical-education'
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
      ...englishEliasActivityTimeline,
      ...swedishEliasActivityTimeline,
      ...mathematicsEliasObservationClusters,
      ...mathematicsEliasActivityTimeline,
      ...physicalEducationEliasObservationClusters,
      ...physicalEducationEliasActivityTimeline,
      ...musicEliasProjectTimeline,
      ...mathematicsEliasAssessments,
      ...englishEliasHomeworkAssessments,
      ...swedishEliasHomeworkAssessments,
      ...assessments,
    ],
    learningObservations,
    timelineResponses,
  };
}

function buildPlanning(subjectId, curriculum) {
  if (subjectId === 'music') {
    const contextById = new Map(musicLearningContexts.map((context) => [context.id, context]));
    const projectBlocks = [
      ['guitar-performance', 'jan-2026', '2026-01-12', '2026-01-30', 'completed', 'guitar-foundations', localized('Guitar foundations', 'Gitarrgrunder'), localized('Build a shared base in guitar technique, chord changes, pulse and individual part security.', 'Bygg en gemensam grund i gitarrteknik, ackordbyten, puls och s\u00e4kerhet i egen st\u00e4mma.')],
      ['drum-performance', 'feb-2026', '2026-02-02', '2026-02-20', 'completed', 'drum-rhythm', localized('Drum patterns and pulse', 'Trumkomp och puls'), localized('Develop rhythmic security, continuity and ensemble timing through simple drum patterns.', 'Utveckla rytmisk s\u00e4kerhet, kontinuitet och tajming i ensemble genom enkla trumkomp.')],
      ['band-performance', 'mar-2026', '2026-02-23', '2026-03-20', 'completed', 'band-ensemble', localized('Band performance: ensemble', 'Bandspel: ensemble'), localized('Bring guitar, drums and vocal or instrumental parts together with focus on balance, entries and musical form.', 'Samla gitarr, trummor och vokala eller instrumentala st\u00e4mmor med fokus p\u00e5 balans, insatser och musikalisk form.')],
      ['scary-music-composition', 'apr-2026', '2026-03-23', '2026-04-24', 'current', 'scary-composition', localized('Writing scary music', 'Skapa skr\u00e4ckmusik'), localized('Compose short pieces that use sound, rhythm, harmony, dynamics and form to create suspense.', 'Komponera korta stycken som anv\u00e4nder klang, rytm, harmonik, dynamik och form f\u00f6r att skapa sp\u00e4nning.')],
      ['scary-music-composition', 'may-2026', '2026-05-04', '2026-05-29', 'planned', 'composition-showcase', localized('Composition showcase and reflection', 'Kompositionsvisning och reflektion'), localized('Refine, share and discuss compositions using musical concepts and comparisons.', 'Bearbeta, visa och samtala om kompositioner med musikbegrepp och j\u00e4mf\u00f6relser.')],
    ].map(([contextId, periodId, startDate, endDate, status, blockSlug, title, description]) => {
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
        id: `${subjectId}-8a-plan-${blockSlug}`,
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
        groupAdaptations: [],
        notes: null,
        createdAt: '2026-01-08',
        updatedAt: status === 'current' ? '2026-04-21' : endDate,
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
      blocks: projectBlocks,
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
        teaching: localized('Projects', 'Projekt'),
      },
      curriculumNotes: [],
    };
  }

  if (subjectId === 'mathematics') {
    const contextById = new Map(mathsLearningContexts.map((context) => [context.id, context]));
    const unitById = new Map((curriculum.teachingUnits || []).map((unit) => [unit.id, unit]));
    const skillById = new Map((curriculum.skills || []).map((skill) => [skill.id, skill]));
    const mathsBlocks = [
      {
        contextId: 'fractions-decimals-percentages',
        periodId: 'jan-2026',
        startDate: '2026-01-12',
        endDate: '2026-01-30',
        status: 'completed',
        blockSlug: 'fractions-confidence',
        title: localized('Fractions, decimals and percentages', 'Br\u00e5k, decimaler och procent'),
        description: localized(
          'Start with visual models and frequent homework checks. Elias builds confidence here and uses representations well.',
          'Starta med visuella modeller och t\u00e4ta l\u00e4xkontroller. Elias bygger trygghet h\u00e4r och anv\u00e4nder representationer v\u00e4l.',
        ),
        assessmentAnchor: localized('Short quiz 30 Jan', 'Kort quiz 30 jan'),
      },
      {
        contextId: 'equations',
        periodId: 'feb-2026',
        startDate: '2026-02-03',
        endDate: '2026-02-27',
        status: 'completed',
        blockSlug: 'equations-dip',
        title: localized('Equations: one step at a time', 'Ekvationer: ett steg i taget'),
        description: localized(
          'Plan for repeated lesson checks because Elias dips during equations. Keep transformations visible and verbalised.',
          'Planera f\u00f6r upprepade lektionskontroller eftersom Elias f\u00e5r en svacka i ekvationer. H\u00e5ll omformningar synliga och uttalade.',
        ),
        assessmentAnchor: localized('Equation checkpoint 27 Feb', 'Ekvationskontroll 27 feb'),
        groupAdaptations: [
          {
            id: 'maths-elias-equation-scaffold',
            workingGroupId: 'needs-check-in',
            instruction: localized('One transformation per line; pair with a student who verbalises each step.', 'En omformning per rad; para ihop med elev som s\u00e4ger varje steg.'),
          },
        ],
        notes: localized(
          'Watch for reduced independence during multi-step equations.',
          'Var uppm\u00e4rksam p\u00e5 minskad sj\u00e4lvst\u00e4ndighet vid flerstegsekvationer.',
        ),
      },
      {
        contextId: 'equations',
        periodId: 'mar-2026',
        startDate: '2026-03-02',
        endDate: '2026-03-13',
        status: 'completed',
        blockSlug: 'equations-recheck',
        title: localized('Equations: re-check and method security', 'Ekvationer: omkontroll och metods\u00e4kerhet'),
        description: localized(
          'Short consolidation block after the dip: re-check equation methods before moving into geometry.',
          'Kort bef\u00e4standemoment efter svackan: omkontrollera ekvationsmetoder innan geometri.',
        ),
        blockType: 'consolidation',
        assessmentAnchor: localized('Lesson test 13 Mar', 'Lektionstest 13 mars'),
      },
      {
        contextId: 'geometry-investigation',
        periodId: 'mar-2026',
        startDate: '2026-03-17',
        endDate: '2026-04-17',
        status: 'completed',
        blockSlug: 'geometry-recovery',
        title: localized('Geometry investigation', 'Geometrisk unders\u00f6kning'),
        description: localized(
          'Practical diagrams first, then reasoning sentences. Elias recovers strongly when the work is visual and concrete.',
          'Praktiska diagram f\u00f6rst, sedan resonemangsmeningar. Elias h\u00e4mtar sig tydligt n\u00e4r arbetet \u00e4r visuellt och konkret.',
        ),
        assessmentAnchor: localized('Investigation hand-in 17 Apr', 'Inl\u00e4mning 17 apr'),
      },
      {
        unitId: 'probability-statistics',
        periodId: 'apr-2026',
        startDate: '2026-04-21',
        endDate: '2026-05-01',
        status: 'completed',
        blockSlug: 'data-handling',
        title: localized('Statistics and data handling', 'Statistik och datahantering'),
        description: localized(
          'Bridge from diagrams into data: tables, averages, spread and interpretation with quick checks.',
          'Bygg bro fr\u00e5n diagram till data: tabeller, l\u00e4gesm\u00e5tt, spridning och tolkning med snabba kontroller.',
        ),
        assessmentAnchor: localized('Data checkpoint 24 Apr', 'Datakontroll 24 apr'),
      },
      {
        unitId: 'relationships-change',
        periodId: 'may-2026',
        startDate: '2026-05-05',
        endDate: '2026-05-29',
        status: 'current',
        blockSlug: 'graphs-functions',
        title: localized('Graphs, proportionality and functions', 'Grafer, proportionalitet och funktioner'),
        description: localized(
          'Use the successful geometry structure again: graph first, method second, explanation last.',
          'Anv\u00e4nd den lyckade strukturen fr\u00e5n geometri igen: graf f\u00f6rst, metod sedan, f\u00f6rklaring sist.',
        ),
        assessmentAnchor: localized('Term checkpoint 29 May', 'Terminskontroll 29 maj'),
      },
      {
        unitId: 'mathematical-abilities',
        periodId: 'june-2026',
        startDate: '2026-06-01',
        endDate: '2026-06-12',
        status: 'planned',
        blockSlug: 'methods-reasoning-review',
        title: localized('Methods and reasoning review', 'Repetition av metoder och resonemang'),
        description: localized(
          'Revisit method explanation, reasoning and communication using examples from the term.',
          'Repetera metodf\u00f6rklaring, resonemang och kommunikation med exempel fr\u00e5n terminen.',
        ),
        blockType: 'consolidation',
      },
    ].map((block, index) => {
      const context = block.contextId ? contextById.get(block.contextId) : null;
      const unit = unitById.get(block.unitId || context?.primaryCurriculumAreaId) || curriculum.teachingUnits[index % curriculum.teachingUnits.length];
      const curriculumAreaIds = [...new Set([
        unit?.id,
        unit?.curriculumAreaId,
        context?.primaryCurriculumAreaId,
        ...(context?.possibleCurriculumAreaIds || []),
        ...(context?.capturePoints || []).flatMap((point) => point.curriculumAreaIds || []),
      ].filter(Boolean))];
      const abilityIds = [...new Set([
        ...(context?.capturePoints || []).map((point) => point.observationDimensionId),
        ...(unit?.skillIds || []).slice(0, 5),
      ].filter(Boolean))];

      return {
        id: `${subjectId}-8a-plan-${block.blockSlug}`,
        subjectId,
        classId: '8a',
        title: block.title,
        description: block.description,
        teachingUnitId: unit?.id || context?.primaryCurriculumAreaId || '',
        sourceTemplateId: block.contextId || unit?.id || '',
        templateId: block.contextId || unit?.id || '',
        periodId: block.periodId,
        startDate: block.startDate,
        endDate: block.endDate,
        status: block.status,
        curriculumAreaIds,
        evidenceTopicIds: curriculumAreaIds.map((areaId) => `${areaId}-observations`),
        abilityIds,
        blockType: block.blockType || 'teaching',
        assessmentAnchor: block.assessmentAnchor || null,
        quickCaptureOptions: context?.capturePoints?.length
          ? context.capturePoints.map((point) => ({ id: point.id, label: point.label }))
          : (unit?.skillIds || []).slice(0, 4).map((skillId) => {
            const skill = skillById.get(skillId);
            return { id: skillId, label: skill?.title || localized(skillId, skillId) };
          }),
        groupAdaptations: block.groupAdaptations || [],
        notes: block.notes || null,
        createdAt: '2026-01-08',
        updatedAt: block.status === 'current' ? '2026-05-18' : block.endDate,
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
      blocks: mathsBlocks,
      tools: [
        ...mathsLearningContexts.map((context) => ({
          id: context.id,
          title: context.label,
          blockType: 'teaching',
          description: localized('Use this maths topic as a planned capture focus.', 'Anv\u00e4nd detta matematikomr\u00e5de som planerat observationsfokus.'),
          curriculumAreaIds: [context.primaryCurriculumAreaId, ...(context.possibleCurriculumAreaIds || [])].filter(Boolean),
          evidenceTopicIds: [context.primaryCurriculumAreaId, ...(context.possibleCurriculumAreaIds || [])].filter(Boolean).map((areaId) => `${areaId}-observations`),
          abilityIds: (context.capturePoints || []).map((point) => point.observationDimensionId).filter(Boolean),
          quickCaptureOptions: (context.capturePoints || []).map((point) => ({ id: point.id, label: point.label })),
        })),
        { id: 'blank-block', title: localized('Blank block', 'Tomt block'), blockType: 'teaching', description: '', curriculumAreaIds: [], evidenceTopicIds: [], abilityIds: [], quickCaptureOptions: [] },
        { id: 'revision-consolidation', title: localized('Revision and consolidation', 'Repetition och bef\u00e4stande'), blockType: 'consolidation', description: localized('Create time to revisit and secure earlier learning.', 'Skapa tid f\u00f6r att repetera och bef\u00e4sta tidigare l\u00e4rande.'), curriculumAreaIds: [], evidenceTopicIds: [], abilityIds: [], quickCaptureOptions: [] },
        { id: 'assessment-point', title: localized('Assessment point', 'Bed\u00f6mningspunkt'), blockType: 'assessment', description: localized('Add a planned assessment or checkpoint.', 'L\u00e4gg till en planerad bed\u00f6mning eller kontrollpunkt.'), curriculumAreaIds: [], evidenceTopicIds: [], abilityIds: [], quickCaptureOptions: [] },
      ],
      curriculumAreaTypeLabels: {
        content: localized('Content', 'Inneh\u00e5ll'),
        ability: localized('Skills', 'F\u00e4rdigheter'),
      },
      blockTypeLabels: {
        teaching: localized('Teaching', 'Undervisning'),
      },
      storageVersion: 'maths-curriculum-v3-elias-term',
      curriculumNotes: [],
    };
  }

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

  if (subjectId === 'swedish') {
    const swedishActivityBlocks = [
      {
        slug: 'reading-novel-discussion',
        periodId: 'jan-2026',
        startDate: '2026-01-12',
        endDate: '2026-01-30',
        status: 'completed',
        title: localized('Novel reading and discussion', 'Romanl\u00e4sning och textsamtal'),
        description: localized(
          'Students read selected chapters, summarise key events and reason about character choices and themes.',
          'Eleverna l\u00e4ser utvalda kapitel, sammanfattar viktiga h\u00e4ndelser och resonerar om karakt\u00e4rers val och teman.',
        ),
        teachingUnitId: 'reading-comprehension',
        curriculumAreaIds: ['reading-comprehension', 'literature-text-analysis'],
        abilityIds: ['reading-comprehension', 'summarising', 'interpreting-content', 'reasoning-about-text', 'message-theme'],
        quickCaptureSkillIds: ['summarising', 'interpreting-content', 'reasoning-about-text'],
      },
      {
        slug: 'argumentative-writing',
        periodId: 'feb-2026',
        startDate: '2026-02-02',
        endDate: '2026-02-20',
        status: 'completed',
        title: localized('Argumentative writing', 'Argumenterande text'),
        description: localized(
          'Students write an argumentative text with a clear viewpoint, supporting arguments and adaptation to purpose and audience.',
          'Eleverna skriver en argumenterande text med en tydlig st\u00e5ndpunkt, underbyggda argument och anpassning till syfte och mottagare.',
        ),
        teachingUnitId: 'writing',
        curriculumAreaIds: ['writing', 'language-usage'],
        abilityIds: ['writing-content', 'writing-structure', 'linguistic-variety-writing', 'adaptation-text-type-purpose-recipient', 'language-correctness', 'supporting-arguments'],
        quickCaptureSkillIds: ['writing-structure', 'supporting-arguments', 'adaptation-text-type-purpose-recipient', 'language-correctness'],
        createdAt: '2026-01-29',
      },
      {
        slug: 'source-research-presentation',
        periodId: 'mar-2026',
        startDate: '2026-03-02',
        endDate: '2026-03-20',
        status: 'completed',
        title: localized('Research and oral presentation', 'Informationss\u00f6kning och muntlig presentation'),
        description: localized(
          'Students research a chosen topic using several sources, evaluate the information and present their findings to the class.',
          'Eleverna unders\u00f6ker ett valt \u00e4mne med hj\u00e4lp av flera k\u00e4llor, v\u00e4rderar informationen och presenterar sina resultat f\u00f6r klassen.',
        ),
        teachingUnitId: 'information-search-source-criticism',
        curriculumAreaIds: ['information-search-source-criticism', 'speaking-conversation'],
        abilityIds: ['searching-information', 'selecting-relevant-sources', 'processing-own-words', 'credibility-relevance', 'oral-presentation-adaptation'],
        quickCaptureSkillIds: ['selecting-relevant-sources', 'credibility-relevance', 'processing-own-words', 'oral-presentation-adaptation'],
        createdAt: '2026-02-26',
      },
      {
        slug: 'class-debate',
        periodId: 'apr-2026',
        startDate: '2026-04-13',
        endDate: '2026-05-15',
        status: 'current',
        title: localized('Class debate', 'Klassdebatt'),
        description: localized(
          'Students prepare and take part in a structured debate, presenting viewpoints, responding to others and supporting their arguments.',
          'Eleverna f\u00f6rbereder och deltar i en strukturerad debatt d\u00e4r de framf\u00f6r \u00e5sikter, bem\u00f6ter andra och underbygger sina argument.',
        ),
        teachingUnitId: 'speaking-conversation',
        curriculumAreaIds: ['speaking-conversation', 'information-search-source-criticism'],
        abilityIds: ['participating-in-conversation', 'developing-conversation', 'expressing-opinions', 'supporting-arguments', 'credibility-relevance'],
        quickCaptureSkillIds: ['participating-in-conversation', 'developing-conversation', 'expressing-opinions', 'supporting-arguments'],
        createdAt: '2026-04-08',
      },
    ];
    const swedishBlocks = swedishActivityBlocks.map((block) => ({
      id: `swedish-8a-plan-${block.slug}`,
      subjectId,
      classId: '8a',
      title: block.title,
      description: block.description,
      teachingUnitId: block.teachingUnitId,
      sourceTemplateId: block.slug,
      templateId: block.slug,
      periodId: block.periodId,
      startDate: block.startDate,
      endDate: block.endDate,
      status: block.status,
      curriculumAreaIds: block.curriculumAreaIds,
      evidenceTopicIds: block.curriculumAreaIds.map((areaId) => `${areaId}-observations`),
      abilityIds: block.abilityIds,
      blockType: block.blockType || 'teaching',
      assessmentAnchor: block.assessmentAnchor || null,
      quickCaptureOptions: (block.quickCaptureSkillIds || block.abilityIds).map((skillId) => {
        const skill = curriculum.skills.find((item) => item.id === skillId);
        return { id: skillId, label: skill?.title || localized(skillId, skillId) };
      }),
      groupAdaptations: block.groupAdaptations || [],
      notes: block.notes || null,
      createdAt: block.createdAt || '2026-01-08',
      updatedAt: block.updatedAt || (block.status === 'current' ? '2026-05-18' : block.endDate),
      createdBy: 'teacher',
    }));

    return {
      periods: [
        { id: 'jan-2026', label: localized('January', 'Januari'), startDate: '2026-01-08', endDate: '2026-01-31', order: 1 },
        { id: 'feb-2026', label: localized('February', 'Februari'), startDate: '2026-02-01', endDate: '2026-02-28', order: 2 },
        { id: 'mar-2026', label: localized('March', 'Mars'), startDate: '2026-03-01', endDate: '2026-03-31', order: 3 },
        { id: 'apr-2026', label: localized('April', 'April'), startDate: '2026-04-01', endDate: '2026-04-30', order: 4 },
        { id: 'may-2026', label: localized('May', 'Maj'), startDate: '2026-05-01', endDate: '2026-05-31', order: 5 },
        { id: 'june-2026', label: localized('June', 'Juni'), startDate: '2026-06-01', endDate: '2026-06-19', order: 6 },
      ],
      blocks: swedishBlocks,
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
      storageVersion: 'swedish-activities-v2',
      curriculumNotes: [],
    };
  }

  if (subjectId === 'english') {
    const englishActivityBlocks = [
      {
        slug: 'reading-text-work',
        periodId: 'jan-2026',
        startDate: '2026-01-12',
        endDate: '2026-01-30',
        status: 'completed',
        title: localized('Reading / text work', 'L\u00e4sning / textarbete'),
        description: localized(
          'Students work with written English such as fiction, articles, extracts, instructions or other texts.',
          'Eleverna arbetar med skriven engelska, till exempel sk\u00f6nlitteratur, artiklar, utdrag, instruktioner eller andra texter.',
        ),
        teachingUnitId: 'reading',
        curriculumAreaIds: ['reading', 'interaction'],
        abilityIds: ['reading-main-ideas', 'reading-details', 'reading-interpretation', 'reading-strategies', 'reading-text-types-context', 'interaction-responding-developing'],
        quickCaptureSkillIds: ['reading-main-ideas', 'reading-details', 'reading-interpretation', 'reading-strategies'],
      },
      {
        slug: 'writing-task',
        periodId: 'feb-2026',
        startDate: '2026-02-02',
        endDate: '2026-02-20',
        status: 'completed',
        title: localized('Writing task', 'Skrivuppgift'),
        description: localized(
          'Students produce written English in any form chosen by the teacher.',
          'Eleverna producerar skriven engelska i den form som l\u00e4raren v\u00e4ljer.',
        ),
        teachingUnitId: 'writing',
        curriculumAreaIds: ['writing'],
        abilityIds: ['writing-content-development', 'writing-structure-coherence', 'writing-vocabulary-variation', 'writing-grammar-accuracy', 'writing-purpose-audience-context', 'writing-revision'],
        quickCaptureSkillIds: ['writing-content-development', 'writing-structure-coherence', 'writing-vocabulary-variation', 'writing-grammar-accuracy'],
        createdAt: '2026-01-29',
      },
      {
        slug: 'speaking-presentation',
        periodId: 'mar-2026',
        startDate: '2026-03-02',
        endDate: '2026-03-20',
        status: 'completed',
        title: localized('Speaking / presentation', 'Tal / presentation'),
        description: localized(
          'Students communicate orally through presentations, explanations, recordings or other spoken tasks.',
          'Eleverna kommunicerar muntligt genom presentationer, f\u00f6rklaringar, inspelningar eller andra muntliga uppgifter.',
        ),
        teachingUnitId: 'speaking',
        curriculumAreaIds: ['speaking'],
        abilityIds: ['speaking-content-development', 'speaking-clarity', 'speaking-fluency', 'speaking-vocabulary-variation', 'speaking-pronunciation', 'speaking-purpose-audience'],
        quickCaptureSkillIds: ['speaking-clarity', 'speaking-fluency', 'speaking-vocabulary-variation', 'speaking-pronunciation'],
        createdAt: '2026-02-26',
      },
      {
        slug: 'discussion-interaction',
        periodId: 'apr-2026',
        startDate: '2026-04-13',
        endDate: '2026-05-15',
        status: 'current',
        title: localized('Discussion / interaction', 'Diskussion / interaktion'),
        description: localized(
          'Students communicate with others in pairs, groups or whole-class situations.',
          'Eleverna kommunicerar med andra i par, grupper eller helklassituationer.',
        ),
        teachingUnitId: 'interaction',
        curriculumAreaIds: ['interaction', 'speaking'],
        abilityIds: ['interaction-participating', 'interaction-responding-developing', 'interaction-expressing-opinions', 'interaction-communication-strategies', 'interaction-adaptation', 'interaction-keeping-going'],
        quickCaptureSkillIds: ['interaction-participating', 'interaction-responding-developing', 'interaction-expressing-opinions', 'interaction-communication-strategies'],
        createdAt: '2026-04-08',
      },
    ];
    const englishBlocks = englishActivityBlocks.map((block) => ({
      id: `english-8a-plan-${block.slug}`,
      subjectId,
      classId: '8a',
      title: block.title,
      description: block.description,
      teachingUnitId: block.teachingUnitId,
      sourceTemplateId: block.slug,
      templateId: block.slug,
      periodId: block.periodId,
      startDate: block.startDate,
      endDate: block.endDate,
      status: block.status,
      curriculumAreaIds: block.curriculumAreaIds,
      evidenceTopicIds: block.curriculumAreaIds.map((areaId) => `${areaId}-observations`),
      abilityIds: block.abilityIds,
      blockType: block.blockType || 'teaching',
      assessmentAnchor: block.assessmentAnchor || null,
      quickCaptureOptions: (block.quickCaptureSkillIds || block.abilityIds).map((skillId) => {
        const skill = curriculum.skills.find((item) => item.id === skillId);
        return { id: skillId, label: skill?.title || localized(skillId, skillId) };
      }),
      groupAdaptations: block.groupAdaptations || [],
      notes: block.notes || null,
      createdAt: block.createdAt || '2026-01-08',
      updatedAt: block.updatedAt || (block.status === 'current' ? '2026-05-18' : block.endDate),
      createdBy: 'teacher',
    }));

    return {
      periods: [
        { id: 'jan-2026', label: localized('January', 'Januari'), startDate: '2026-01-08', endDate: '2026-01-31', order: 1 },
        { id: 'feb-2026', label: localized('February', 'Februari'), startDate: '2026-02-01', endDate: '2026-02-28', order: 2 },
        { id: 'mar-2026', label: localized('March', 'Mars'), startDate: '2026-03-01', endDate: '2026-03-31', order: 3 },
        { id: 'apr-2026', label: localized('April', 'April'), startDate: '2026-04-01', endDate: '2026-04-30', order: 4 },
        { id: 'may-2026', label: localized('May', 'Maj'), startDate: '2026-05-01', endDate: '2026-05-31', order: 5 },
        { id: 'june-2026', label: localized('June', 'Juni'), startDate: '2026-06-01', endDate: '2026-06-19', order: 6 },
      ],
      blocks: englishBlocks,
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
      storageVersion: 'english-activities-v2',
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
      ['apr-2026', '2026-04-07', '2026-04-30', 3, 'completed'],
      ['may-2026', '2026-05-04', '2026-05-22', 4, 'current'],
      ['june-2026', '2026-06-01', '2026-06-12', 5, 'planned'],
    ].slice(0, Math.max(1, curriculum.teachingUnits.length)).map(([periodId, startDate, endDate, unitIndex, status], index) => {
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
    storageVersion: subjectId === 'mathematics'
      ? 'maths-curriculum-v2'
      : '',
    curriculumNotes: [],
  };
}

function buildLearningContextsFromPlanning(planning, curriculum) {
  const unitsBySkillId = new Map();
  (curriculum.teachingUnits || []).forEach((unit) => {
    (unit.skillIds || []).forEach((skillId) => {
      const units = unitsBySkillId.get(skillId) || [];
      units.push(unit.id);
      unitsBySkillId.set(skillId, units);
    });
  });

  return (planning.blocks || [])
    .filter((block) => block.blockType === 'teaching' && (block.quickCaptureOptions || []).length)
    .map((block) => {
      const contextId = block.templateId || block.sourceTemplateId || block.id;
      const curriculumAreaIds = [...new Set([
        block.teachingUnitId,
        ...(block.curriculumAreaIds || []),
      ].filter(Boolean))];

      return {
        id: contextId,
        type: 'activity',
        label: block.title,
        primaryCurriculumAreaId: block.teachingUnitId || curriculumAreaIds[0] || '',
        possibleCurriculumAreaIds: curriculumAreaIds,
        capturePoints: (block.quickCaptureOptions || []).map((option) => {
          const skillId = option.observationDimensionId || option.skillId || option.id;
          const linkedUnitIds = (unitsBySkillId.get(skillId) || [])
            .filter((unitId) => curriculumAreaIds.includes(unitId));

          return {
            id: `${contextId}-${option.id}`,
            label: option.label,
            observationDimensionId: skillId,
            curriculumAreaIds: linkedUnitIds.length
              ? linkedUnitIds
              : [block.teachingUnitId || curriculumAreaIds[0]].filter(Boolean),
          };
        }),
      };
    });
}

function buildLearningContexts(subjectId, planning, curriculum) {
  if (subjectId === 'mathematics') {
    return mathsLearningContexts;
  }
  if (subjectId === 'music') {
    return musicLearningContexts;
  }
  if (subjectId === 'physical-education') {
    return physicalEducationLearningContexts;
  }

  return buildLearningContextsFromPlanning(planning, curriculum);
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
  const planning = buildPlanning(subjectId, curriculum);
  const learningContexts = buildLearningContexts(subjectId, planning, curriculum);
  const configVersion = subjectId === 'mathematics' ? 'v2' : '';
  const moduleId = [subjectId, '8a', configVersion].filter(Boolean).join('-');

  return {
    id: moduleId,
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
    planning,
    learningContexts,
    navigation,
    screens: {
      'class-picture': {
        title: localized('Class Overview', 'Klass\u00f6versikt'),
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
