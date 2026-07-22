export const teacherSettings = {
  allowTaskExplanation: true,
  allowPlanningHelp: true,
  allowGuidingQuestions: true,
  allowDraftRewriting: false,
  allowFullAnswers: false,
};

const blockedPatterns = [
  /\bwrite\s+(the|my|an|a)?\s*(essay|paragraph|introduction|intro|conclusion)\b/i,
  /\bwrite\s+.*\bfor me\b/i,
  /\bgive me\s+(the|a|an)?\s*(answer|essay|paragraph|introduction|conclusion)\b/i,
  /\b(rewrite|polish|finish)\s+(this|my|the)?\s*(draft|essay|paragraph|introduction|conclusion|work|text)\b/i,
  /\bcompleted?\s+(answer|essay|paragraph|introduction|conclusion)\b/i,
  /\bfinal\s+(answer|essay|paragraph|introduction|conclusion|text)\b/i,
];

export const refusalMessage =
  "I can't write this for you, but I can help you think it through. Let's start with your main idea.";

export function detectBlockedRequest(text) {
  return blockedPatterns.some((pattern) => pattern.test(text));
}

export function getMockAiResponse(action, assignment, idea) {
  const combinedInput = `${assignment} ${idea}`;

  // Boundary logic lives here so both student and teacher views can share it.
  // Requests for complete essays, paragraphs, introductions, conclusions,
  // polished rewrites, or final answers are refused and redirected to thinking.
  if (detectBlockedRequest(combinedInput) || action === 'blocked-test') {
    return {
      stage: 'Blocked Request',
      blocked: true,
      message: refusalMessage,
    };
  }

  if (action === 'understand') {
    return {
      stage: 'Understanding',
      blocked: false,
      message:
        'This task is asking you to make a clear argument about the assignment question, support it with evidence, and explain your reasoning in your own words.',
      template: [
        'What topic is the assignment focused on?',
        'What kind of opinion or argument do you need to form?',
        'What evidence might help you support that idea?',
      ],
    };
  }

  if (action === 'plan') {
    return {
      stage: 'Planning',
      blocked: false,
      message: 'Use this planning frame with blanks. Keep the wording rough and personal for now.',
      template: [
        'Main idea: I think ___ because ___.',
        'Reason 1: One reason is ___. Evidence I could use: ___.',
        'Reason 2: Another reason is ___. Evidence I could use: ___.',
        'So what?: This matters because ___.',
      ],
    };
  }

  return {
    stage: 'Guiding Questions',
    blocked: false,
    message: 'Answer these questions in notes before trying to draft.',
    template: [
      'What do you already believe about this topic?',
      'Where might someone disagree with you?',
      'Which quote, scene, fact, or example best supports your strongest point?',
      'What do you want the reader to understand by the end?',
    ],
  };
}
