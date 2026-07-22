export const smartDeskDemoResponses = {
  home: {
    welcome: {
      id: 'home-welcome',
      role: 'assistant',
      text: 'Good morning, Anna. Mathematics 7A begins at 08:40. What would be useful right now?',
    },

    suggestedPrompts: [
      {
        id: 'prepare-maths-7a',
        label: 'Help me prepare for Maths 7A',
        userText: 'Help me prepare for Maths 7A.',
        response: {
          text: 'Maths 7A is working with fractions and percentages. Recent saved information suggests that written problem-solving may be more difficult than calculations for some students.',
          followUpText: 'You could consider starting with one short verbal example before moving to a written question.',
          actions: [
            {
              id: 'open-maths-7a',
              label: 'Open Maths 7A',
              action: 'open-maths-7a',
            },
            {
              id: 'view-related-lessons',
              label: 'View related lessons',
              action: 'view-related-lessons',
            },
          ],
        },
      },
      {
        id: 'today-overview',
        label: 'What should I keep in view today?',
        userText: 'What should I keep in view today?',
        response: {
          text: 'You have three teaching lessons today and one follow-up you chose to keep in view.',
          followUpText: 'Nothing is asking for immediate attention.',
          actions: [
            {
              id: 'open-today',
              label: 'Open today',
              action: 'open-today',
            },
          ],
        },
      },
      {
        id: 'show-follow-ups',
        label: 'Show my follow-ups',
        userText: 'Show my follow-ups.',
        response: {
          text: 'You have one follow-up linked to Mathematics 7A and one mentor conversation later in the week.',
          followUpText: 'You can open either when it feels useful.',
          actions: [],
        },
      },
      {
        id: 'week-overview',
        label: 'Give me a quick overview of the week',
        userText: 'Give me a quick overview of the week.',
        response: {
          text: 'Wednesday is your lightest teaching day. Tuesday and Thursday include useful spaces for follow-up work.',
          followUpText: 'You have room in the week for the things you have chosen to keep in view.',
          actions: [
            {
              id: 'open-week',
              label: 'Open my week',
              action: 'open-week',
            },
          ],
        },
      },
    ],

    voiceDemo: {
      transcript: 'What should I know before Maths 7A?',
      responsePromptId: 'prepare-maths-7a',
    },

    fallback: {
      text: 'For this demo, try asking about Maths 7A, today, your follow-ups, or the week.',
    },
  },
};
