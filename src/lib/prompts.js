/**
 * TLDR Extension - Summary Prompts
 * Configurable prompts with variation parameters for personalized summaries
 *
 * TUNED based on variation test results (34 articles, 283 API calls):
 * - Length presets adjusted to hit word count targets
 * - Opening variety emphasized to avoid "[Topic] is..." patterns
 * - Examples updated to demonstrate varied sentence structures
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
      'Turns out "move fast and break things" works better as a startup motto than a legal defense.',
      'Your brain literally cleans house while you sleep – scrubbing away waste like a night-shift janitor.',
    ],
  },
  professional: {
    name: 'Professional',
    description: 'Clear and authoritative',
    instruction: 'Be clear, authoritative, and precise. Write for a business or professional context. Focus on accuracy and clarity.',
    examples: [
      'New research demonstrates a 47% improvement in battery efficiency using solid-state technology.',
      'Market analysis indicates sustained growth in the renewable energy sector through 2030.',
      'Recent findings challenge conventional assumptions about remote work productivity metrics.',
    ],
  },
  casual: {
    name: 'Casual',
    description: 'Friendly and conversational',
    instruction: 'Be friendly and conversational. Write like you\'re telling a friend about something interesting you read.',
    examples: [
      'So basically, they figured out how to make batteries last way longer - pretty cool stuff.',
      'Turns out getting enough sleep is even more important than we thought. Who knew?',
      'Here\'s a wild one: scientists just proved that plants can actually "hear" themselves being eaten.',
    ],
  },
  academic: {
    name: 'Academic',
    description: 'Scholarly and nuanced',
    instruction: 'Be scholarly and nuanced. Acknowledge complexity, use precise terminology, and maintain intellectual rigor.',
    examples: [
      'The study presents compelling evidence for neuroplasticity in adult subjects, challenging prior assumptions.',
      'This analysis contributes to our understanding of market dynamics under asymmetric information conditions.',
      'Contemporary research reveals significant heterogeneity in treatment response across demographic cohorts.',
    ],
  },
};

// Length presets tuned based on test results:
// - One-liner was hitting 15 words (target: 20) → added minimum
// - Brief was hitting 21 words (target: 35) → explicit range with minimum
// - Detailed was hitting 63 words (target: 70) → added explicit range
export const LENGTH_PRESETS = {
  'one-liner': {
    name: 'One-liner',
    description: '~18-22 words',
    instruction: 'Summarize in exactly ONE punchy sentence. Use 18-22 words (not fewer). Pack meaning into every word.',
    maxTokens: 100,
    targetWords: 20,
  },
  brief: {
    name: 'Brief',
    description: '~30-40 words',
    instruction: 'Summarize in 2 complete sentences. Use 30-40 words (NOT fewer than 30). Provide enough context to understand the main point and its significance.',
    maxTokens: 200,
    targetWords: 35,
  },
  detailed: {
    name: 'Detailed',
    description: '~60-80 words',
    instruction: 'Provide a thorough summary in 3-4 sentences. Use 60-80 words. Include context, nuance, key implications, and why it matters.',
    maxTokens: 400,
    targetWords: 70,
  },
};

export const FOCUS_PRESETS = {
  'key-facts': {
    name: 'Key Facts',
    description: 'Main factual takeaways',
    instruction: 'Focus on the most important factual information. Lead with concrete data, numbers, or verifiable claims. What are the headline facts?',
  },
  opinions: {
    name: 'Opinions',
    description: "Author's perspective",
    instruction: 'Focus on the author\'s perspective and arguments. What position are they advocating? What\'s their thesis? Capture their stance.',
  },
  implications: {
    name: 'Implications',
    description: 'Why it matters',
    instruction: 'Focus on implications and relevance. Lead with why the reader should care. What does this mean for them? What changes?',
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
// Opening Variety Strategies
// ============================================

// These sentence starters help avoid the "[Topic] is..." pattern
// that appeared frequently in test results
const OPENING_STRATEGIES = [
  'Lead with the most surprising or important finding',
  'Start with an action, consequence, or change',
  'Open with a number, statistic, or concrete detail',
  'Begin with who/what is affected and how',
  'Use a contrast, irony, or unexpected angle',
];

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

CRITICAL RULES for your summaries:
1. HONEST: Never misrepresent or exaggerate the article's actual content
2. VARIED OPENINGS: NEVER start with "[Topic] is..." or "[Topic] are..." - this is boring and repetitive
3. ENGAGING: Capture attention from the first word
4. HIT THE WORD COUNT: Meet the minimum word requirement - don't be too brief

Opening strategies (pick one):
- Lead with the most surprising finding or statistic
- Start with an action, consequence, or change happening
- Open with who/what is affected and how
- Begin with a contrast, irony, or unexpected angle

You MUST respond with valid JSON in this exact format:
{
  "summary": "Your summary here",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "tone": "detected_tone"
}

The "tone" field should reflect the article's tone: informative, opinion, news, technical, entertainment, or analysis

Good examples of ${tonePreset.name.toLowerCase()} summaries (notice the VARIED openings):
${examples}

BAD patterns to NEVER use:
- "[Topic] is..." or "[Topic] are..." (boring, every AI does this)
- "This article discusses..." (passive, meta)
- "In this piece, the author..." (too formal, meta)
- "The key takeaways are..." (robotic, predictable)
- Starting multiple summaries the same way

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
