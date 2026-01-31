/**
 * TLDR Extension - Summary Prompts
 * Configurable prompts with variation parameters for personalized summaries
 */

// ============================================
// Variation Presets
// ============================================

export const TONE_PRESETS = {
  witty: {
    name: 'Witty',
    description: 'Clever and engaging with wordplay',
    instruction: 'Be clever and witty. Use wordplay, irony, or unexpected angles when they fit naturally. Make the reader smile.',
    examples: [
      'Scientists confirmed what cat owners always suspected: your pet is definitely ignoring you on purpose.',
      'Another tech startup learned that "move fast and break things" works better as a motto than a legal defense.',
    ],
  },
  professional: {
    name: 'Professional',
    description: 'Clear and authoritative',
    instruction: 'Be clear, authoritative, and precise. Write for a business or professional context. Focus on accuracy and clarity.',
    examples: [
      'New research demonstrates a 47% improvement in battery efficiency using solid-state technology.',
      'Market analysis indicates sustained growth in the renewable energy sector through 2030.',
    ],
  },
  casual: {
    name: 'Casual',
    description: 'Friendly and conversational',
    instruction: 'Be friendly and conversational. Write like you\'re telling a friend about something interesting you read.',
    examples: [
      'So basically, they figured out how to make batteries last way longer - pretty cool stuff.',
      'Turns out, getting enough sleep is even more important than we thought. Who knew?',
    ],
  },
  academic: {
    name: 'Academic',
    description: 'Scholarly and nuanced',
    instruction: 'Be scholarly and nuanced. Acknowledge complexity, use precise terminology, and maintain intellectual rigor.',
    examples: [
      'The study presents compelling evidence for neuroplasticity in adult subjects, challenging prior assumptions.',
      'This analysis contributes to our understanding of market dynamics under asymmetric information conditions.',
    ],
  },
};

export const LENGTH_PRESETS = {
  'one-liner': {
    name: 'One-liner',
    description: '~15-20 words',
    instruction: 'Summarize in exactly ONE punchy sentence. Maximum 20 words. Make every word count.',
    maxTokens: 100,
    targetWords: 20,
  },
  brief: {
    name: 'Brief',
    description: '~30-40 words',
    instruction: 'Summarize in 1-2 sentences. Keep it under 40 words total. Be concise but complete.',
    maxTokens: 200,
    targetWords: 35,
  },
  detailed: {
    name: 'Detailed',
    description: '~60-80 words',
    instruction: 'Provide a thorough summary in 3-4 sentences. Include context, nuance, and key implications.',
    maxTokens: 400,
    targetWords: 70,
  },
};

export const FOCUS_PRESETS = {
  'key-facts': {
    name: 'Key Facts',
    description: 'Main factual takeaways',
    instruction: 'Focus on the most important factual information. What are the concrete, verifiable takeaways?',
  },
  opinions: {
    name: 'Opinions',
    description: "Author's perspective",
    instruction: 'Focus on the author\'s perspective, arguments, and stance. What position are they advocating?',
  },
  implications: {
    name: 'Implications',
    description: 'Why it matters',
    instruction: 'Focus on implications and relevance. Why should the reader care? What does this mean for them?',
  },
};

export const CREATIVITY_PRESETS = {
  consistent: {
    name: 'Consistent',
    description: 'Predictable outputs',
    temperature: 0.3,
  },
  balanced: {
    name: 'Balanced',
    description: 'Moderate variety',
    temperature: 0.7,
  },
  creative: {
    name: 'Creative',
    description: 'More diverse',
    temperature: 1.0,
  },
};

// ============================================
// Default Settings
// ============================================

export const DEFAULT_VARIATION_SETTINGS = {
  tone: 'witty',
  length: 'brief',
  focus: 'key-facts',
  creativity: 'balanced',
};

// ============================================
// Prompt Builder
// ============================================

/**
 * Build the system prompt based on variation settings
 * @param {Object} settings - Variation settings
 * @returns {string} Constructed system prompt
 */
export function buildSystemPrompt(settings = {}) {
  const {
    tone = 'witty',
    length = 'brief',
    focus = 'key-facts',
  } = settings;

  const tonePreset = TONE_PRESETS[tone] || TONE_PRESETS.witty;
  const lengthPreset = LENGTH_PRESETS[length] || LENGTH_PRESETS.brief;
  const focusPreset = FOCUS_PRESETS[focus] || FOCUS_PRESETS['key-facts'];

  const examples = tonePreset.examples
    .map(e => `- "${e}"`)
    .join('\n');

  return `You are TLDR, a brilliant summarizer that distills articles into their essence.

STYLE: ${tonePreset.instruction}

LENGTH: ${lengthPreset.instruction}

FOCUS: ${focusPreset.instruction}

Your summaries should be:
- HONEST: Never misrepresent or exaggerate the article's actual content
- VARIED: Don't start every summary the same way
- ENGAGING: Capture attention from the first word

You MUST respond with valid JSON in this exact format:
{
  "summary": "Your summary here",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "tone": "detected_tone"
}

The "tone" field should reflect the article's tone: informative, opinion, news, technical, entertainment, or analysis

Good examples of ${tonePreset.name.toLowerCase()} summaries:
${examples}

BAD patterns to avoid:
- "This article discusses..." (boring, passive)
- "In this piece, the author..." (too formal, meta)
- "The key takeaways are..." (robotic, predictable)

Keep key points brief (under 15 words each). Aim for 3 points unless the article only has 1-2 main ideas.`;
}

// Legacy export for backwards compatibility
export const SYSTEM_PROMPT = buildSystemPrompt(DEFAULT_VARIATION_SETTINGS);

export const USER_PROMPT_TEMPLATE = `Summarize this article:

TITLE: {title}

CONTENT:
{content}`;

/**
 * Build the user prompt for summarization
 * @param {Object} article - Article data
 * @returns {string} Formatted prompt
 */
export function buildUserPrompt(article) {
  // Truncate content to ~6000 chars to stay within token limits
  const maxContentLength = 6000;
  const content =
    article.content.length > maxContentLength
      ? article.content.slice(0, maxContentLength) + '...[truncated]'
      : article.content;

  return USER_PROMPT_TEMPLATE.replace('{title}', article.title).replace(
    '{content}',
    content
  );
}

/**
 * Get temperature value from creativity preset
 * @param {string} creativity - Creativity preset name
 * @returns {number} Temperature value
 */
export function getTemperature(creativity = 'balanced') {
  return CREATIVITY_PRESETS[creativity]?.temperature ?? 0.7;
}

/**
 * Get max tokens from length preset
 * @param {string} length - Length preset name
 * @returns {number} Max tokens
 */
export function getMaxTokens(length = 'brief') {
  return LENGTH_PRESETS[length]?.maxTokens ?? 200;
}
