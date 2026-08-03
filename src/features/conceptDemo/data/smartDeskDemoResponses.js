export const smartDeskDemoResponses = {
  home: {
    welcome: {
      id: 'home-welcome',
      role: 'assistant',
      text: {
        en: 'Good morning, Anna. Mathematics 7A begins at 08:40. What would be useful right now?',
        sv: 'God morgon, Anna. Matematik 7A b\u00f6rjar 08:40. Vad vore anv\u00e4ndbart just nu?',
      },
    },

    suggestedPrompts: [
      {
        id: 'prepare-maths-7a',
        label: {
          en: 'Help me prepare for Maths 7A',
          sv: 'Hj\u00e4lp mig f\u00f6rbereda Matematik 7A',
        },
        userText: {
          en: 'Help me prepare for Maths 7A.',
          sv: 'Hj\u00e4lp mig f\u00f6rbereda Matematik 7A.',
        },
        response: {
          text: {
            en: 'Maths 7A is working with fractions and percentages. Recent saved information suggests that written problem-solving may be more difficult than calculations for some students.',
            sv: 'Matematik 7A arbetar med br\u00e5k och procent. Senast sparad information tyder p\u00e5 att skriftlig probleml\u00f6sning kan vara sv\u00e5rare \u00e4n ber\u00e4kningar f\u00f6r vissa elever.',
          },
          followUpText: {
            en: 'You could consider starting with one short verbal example before moving to a written question.',
            sv: 'Du kan \u00f6verv\u00e4ga att b\u00f6rja med ett kort muntligt exempel innan ni g\u00e5r vidare till en skriftlig fr\u00e5ga.',
          },
          actions: [
            {
              id: 'open-maths-7a',
              label: {
                en: 'Open Maths 7A',
                sv: '\u00d6ppna Matematik 7A',
              },
              action: 'open-maths-7a',
            },
            {
              id: 'view-related-lessons',
              label: {
                en: 'View related lessons',
                sv: 'Visa relaterade lektioner',
              },
              action: 'view-related-lessons',
            },
          ],
        },
      },
      {
        id: 'today-overview',
        label: {
          en: 'What should I keep in view today?',
          sv: 'Vad ska jag h\u00e5lla koll p\u00e5 idag?',
        },
        userText: {
          en: 'What should I keep in view today?',
          sv: 'Vad ska jag h\u00e5lla koll p\u00e5 idag?',
        },
        response: {
          text: {
            en: 'You have three teaching lessons today and one follow-up you chose to keep in view.',
            sv: 'Du har tre lektioner idag och en uppf\u00f6ljning som du valt att h\u00e5lla koll p\u00e5.',
          },
          followUpText: {
            en: 'Nothing is asking for immediate attention.',
            sv: 'Inget kr\u00e4ver omedelbar uppm\u00e4rksamhet.',
          },
          actions: [
            {
              id: 'open-today',
              label: {
                en: 'Open today',
                sv: '\u00d6ppna idag',
              },
              action: 'open-today',
            },
          ],
        },
      },
      {
        id: 'show-follow-ups',
        label: {
          en: 'Show my follow-ups',
          sv: 'Visa mina uppf\u00f6ljningar',
        },
        userText: {
          en: 'Show my follow-ups.',
          sv: 'Visa mina uppf\u00f6ljningar.',
        },
        response: {
          text: {
            en: 'You have one follow-up linked to Mathematics 7A and one mentor conversation later in the week.',
            sv: 'Du har en uppf\u00f6ljning kopplad till Matematik 7A och ett mentorssamtal senare i veckan.',
          },
          followUpText: {
            en: 'You can open either when it feels useful.',
            sv: 'Du kan \u00f6ppna dem n\u00e4r det k\u00e4nns anv\u00e4ndbart.',
          },
          actions: [],
        },
      },
      {
        id: 'week-overview',
        label: {
          en: 'Give me a quick overview of the week',
          sv: 'Ge mig en snabb \u00f6versikt av veckan',
        },
        userText: {
          en: 'Give me a quick overview of the week.',
          sv: 'Ge mig en snabb \u00f6versikt av veckan.',
        },
        response: {
          text: {
            en: 'Wednesday is your lightest teaching day. Tuesday and Thursday include useful spaces for follow-up work.',
            sv: 'Onsdag \u00e4r din lugnaste undervisningsdag. Tisdag och torsdag har anv\u00e4ndbara luckor f\u00f6r uppf\u00f6ljningsarbete.',
          },
          followUpText: {
            en: 'You have room in the week for the things you have chosen to keep in view.',
            sv: 'Du har utrymme i veckan f\u00f6r det du har valt att h\u00e5lla koll p\u00e5.',
          },
          actions: [
            {
              id: 'open-week',
              label: {
                en: 'Open my week',
                sv: '\u00d6ppna min vecka',
              },
              action: 'open-week',
            },
          ],
        },
      },
    ],

    voiceDemo: {
      transcript: {
        en: 'What should I know before Maths 7A?',
        sv: 'Vad b\u00f6r jag veta f\u00f6re Matematik 7A?',
      },
      responsePromptId: 'prepare-maths-7a',
    },

    fallback: {
      text: {
        en: 'For this demo, try asking about Maths 7A, today, your follow-ups, or the week.',
        sv: 'I den h\u00e4r demon kan du fr\u00e5ga om Matematik 7A, idag, dina uppf\u00f6ljningar eller veckan.',
      },
    },
  },
};
