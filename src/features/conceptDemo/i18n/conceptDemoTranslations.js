export const conceptDemoLanguages = {
  en: {
    code: 'en',
    shortLabel: 'EN',
    label: 'English',
  },
  sv: {
    code: 'sv',
    shortLabel: 'SV',
    label: 'Svenska',
  },
};

export const defaultConceptDemoLanguage = 'en';

export const conceptDemoTranslations = {
  en: {
    common: {
      language: 'Language',
      english: 'English',
      swedish: 'Swedish',
      close: 'Close',
    },
    subjects: {
      mathematics: 'Mathematics',
      english: 'English',
      'physical-education': 'Physical Education',
    },
    home: {
      teacherWorkspace: 'Teacher workspace',
      openAnnaWeek: "Open Anna's week",
      currentWeekday: 'Monday',
      weekSummary: 'Monday \u00b7 3 lessons \u00b7 1 follow-up',
      statusLine: 'V4 - Nothing pressing. {{eventSummary}}.',
      teachingDayReady: 'Your teaching day is ready',
      teachingEventBegins: '{{title}} {{className}} begins at {{start}}',
      modules: {
        mentor: {
          title: 'Mentor',
          detail: '1 conversation',
        },
        notebook: {
          title: 'Notebook',
          detail: '3 recent notes',
        },
        mathematics: {
          shortTitle: 'Maths',
        },
        english: {
          shortTitle: 'English',
        },
        'physical-education': {
          shortTitle: 'PE',
        },
      },
      classCount_one: '{{count}} class',
      classCount_other: '{{count}} classes',
      openClass: 'Open {{subject}} {{className}}',
      insightTitle: 'SmartDesk noticed',
      insightText: "Anna's week includes {{subjectCount}} teaching areas. The next teaching block is {{nextBlock}}.",
      nextTeachingBlock: '{{title}} {{className}} at {{start}}',
      nextTeachingBlockReady: 'ready when you are',
      viewWeeklyPicture: 'View weekly picture',
      askSmartDesk: 'Ask SmartDesk',
      homeBackground: 'Home background',
      chooseHomeBackground: 'Choose home background image',
      noHomeBackground: 'No home background image',
      noBackground: 'None',
      useBackground: 'Use background image {{number}}',
      backgroundShort: 'BG {{number}}',
      whatIsSmartDesk: 'What is SmartDesk?',
      openSmartDeskStore: 'Open SmartDeskStore',
      drawer: 'Drawer',
      floating: 'Floating',
      toggleSmartDeskSurface: 'Toggle SmartDesk surface',
      focusedWorkspaceSubtitle: 'Reusable module prototype',
      smartDeskInfoBody: 'Your smart diary and personal assistant.',
      smartDeskInfoImageAlt: 'SmartDesk concept overview',
    },
    floatingSmartDesk: {
      askSmartDesk: 'Ask SmartDesk',
      selectContext: 'Select context for SmartDesk',
      microphone: 'Use SmartDesk microphone',
      minimize: 'Minimize floating SmartDesk',
      expand: 'Expand floating SmartDesk',
      capturedContext: 'Captured context',
      listening: 'Listening...',
      releaseToCapture: 'Release over something to capture it.',
      looking: 'Looking...',
      ask: 'Ask',
      askPlaceholder: 'Ask about {{context}}...',
      thisContext: 'this',
      sendMessage: 'Send message',
      noCaptureText: 'I could not capture anything at that point.',
      noCaptureFollowUp: 'Try the cursor again and release over a visible item.',
      capturedText: 'Captured: {{type}} - {{label}}',
      noStructuredIdentifier: 'No structured identifier yet.',
      contextWelcome: 'Good morning, Anna. {{title}} {{className}} begins at {{start}}. What would be useful right now?',
      contextHome: 'home',
    },
  },
  sv: {
    common: {
      language: 'Spr\u00e5k',
      english: 'Engelska',
      swedish: 'Svenska',
      close: 'St\u00e4ng',
    },
    subjects: {
      mathematics: 'Matematik',
      english: 'Engelska',
      'physical-education': 'Idrott och h\u00e4lsa',
    },
    home: {
      teacherWorkspace: 'L\u00e4rararbetsyta',
      openAnnaWeek: '\u00d6ppna Annas vecka',
      currentWeekday: 'M\u00e5ndag',
      weekSummary: 'M\u00e5ndag \u00b7 3 lektioner \u00b7 1 uppf\u00f6ljning',
      statusLine: 'V4 - Inget akut. {{eventSummary}}.',
      teachingDayReady: 'Din undervisningsdag \u00e4r redo',
      teachingEventBegins: '{{title}} {{className}} b\u00f6rjar {{start}}',
      modules: {
        mentor: {
          title: 'Mentor',
          detail: '1 samtal',
        },
        notebook: {
          title: 'Anteckningar',
          detail: '3 senaste anteckningar',
        },
        mathematics: {
          shortTitle: 'Matematik',
        },
        english: {
          shortTitle: 'Engelska',
        },
        'physical-education': {
          shortTitle: 'Idrott',
        },
      },
      classCount_one: '{{count}} klass',
      classCount_other: '{{count}} klasser',
      openClass: '\u00d6ppna {{subject}} {{className}}',
      insightTitle: 'SmartDesk noterade',
      insightText: 'Annas vecka inneh\u00e5ller {{subjectCount}} undervisningsomr\u00e5den. N\u00e4sta undervisningspass \u00e4r {{nextBlock}}.',
      nextTeachingBlock: '{{title}} {{className}} kl. {{start}}',
      nextTeachingBlockReady: 'redo n\u00e4r du \u00e4r',
      viewWeeklyPicture: 'Visa veckobild',
      askSmartDesk: 'Fr\u00e5ga SmartDesk',
      homeBackground: 'Startbakgrund',
      chooseHomeBackground: 'V\u00e4lj bakgrundsbild f\u00f6r startsidan',
      noHomeBackground: 'Ingen bakgrundsbild p\u00e5 startsidan',
      noBackground: 'Ingen',
      useBackground: 'Anv\u00e4nd bakgrundsbild {{number}}',
      backgroundShort: 'BG {{number}}',
      whatIsSmartDesk: 'Vad \u00e4r SmartDesk?',
      openSmartDeskStore: '\u00d6ppna SmartDeskStore',
      drawer: 'Panel',
      floating: 'Flytande',
      toggleSmartDeskSurface: 'V\u00e4xla SmartDesk-yta',
      focusedWorkspaceSubtitle: '\u00c5teranv\u00e4ndbar modulprototyp',
      smartDeskInfoBody: 'Din smarta kalender och personliga assistent.',
      smartDeskInfoImageAlt: '\u00d6versikt av SmartDesk-konceptet',
    },
    floatingSmartDesk: {
      askSmartDesk: 'Fr\u00e5ga SmartDesk',
      selectContext: 'V\u00e4lj sammanhang f\u00f6r SmartDesk',
      microphone: 'Anv\u00e4nd SmartDesk-mikrofon',
      minimize: 'Minimera flytande SmartDesk',
      expand: 'Expandera flytande SmartDesk',
      capturedContext: 'F\u00e5ngat sammanhang',
      listening: 'Lyssnar...',
      releaseToCapture: 'Sl\u00e4pp \u00f6ver n\u00e5got f\u00f6r att f\u00e5nga det.',
      looking: 'Letar...',
      ask: 'Fr\u00e5ga',
      askPlaceholder: 'Fr\u00e5ga om {{context}}...',
      thisContext: 'detta',
      sendMessage: 'Skicka meddelande',
      noCaptureText: 'Jag kunde inte f\u00e5nga n\u00e5got vid den punkten.',
      noCaptureFollowUp: 'F\u00f6rs\u00f6k med mark\u00f6ren igen och sl\u00e4pp \u00f6ver ett synligt objekt.',
      capturedText: 'F\u00e5ngat: {{type}} - {{label}}',
      noStructuredIdentifier: 'Ingen strukturerad identifierare \u00e4n.',
      contextWelcome: 'God morgon, Anna. {{title}} {{className}} b\u00f6rjar {{start}}. Vad vore anv\u00e4ndbart just nu?',
      contextHome: 'startsidan',
    },
  },
};

export function getTranslationValue(translations, key) {
  return key.split('.').reduce((currentValue, keyPart) => currentValue?.[keyPart], translations);
}

export function interpolateTranslation(template, values = {}) {
  if (typeof template !== 'string') {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (match, name) => {
    const value = values[name];
    return value == null ? match : String(value);
  });
}

export function resolveLocalizedValue(value, language, fallbackLanguage = defaultConceptDemoLanguage) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[language] ?? value[fallbackLanguage] ?? '';
  }

  return value;
}
