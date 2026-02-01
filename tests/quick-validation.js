/**
 * Quick Validation Test
 * Tests 3 articles to verify the tuned prompts hit word count targets
 */

import { RateLimitedGroqClient } from './lib/rate-limited-client.js';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY environment variable required');
  process.exit(1);
}

// Test articles (short excerpts for speed)
const TEST_ARTICLES = [
  {
    title: 'Artificial Intelligence',
    content: `Artificial intelligence (AI), in its broadest sense, is intelligence exhibited by machines, particularly computer systems. It is a field of research in computer science that develops and studies methods and software that enable machines to perceive their environment and use learning and intelligence to take actions that maximize their chances of achieving defined goals. Such machines may be called AIs.`,
  },
  {
    title: 'Climate Change',
    content: `Present-day climate change includes both global warming—the ongoing increase in global average temperature—and its wider effects on Earth's climate. Climate change in a broader sense also includes previous long-term changes to Earth's climate. The current rise in global average temperature is primarily caused by humans burning fossil fuels since the Industrial Revolution.`,
  },
  {
    title: 'Blockchain Technology',
    content: `A blockchain is a distributed ledger with growing lists of records (blocks) that are securely linked together via cryptographic hashes. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data. Since each block contains information about the previous block, they effectively form a chain.`,
  },
];

const LENGTH_PRESETS = {
  'one-liner': { target: 20, range: [18, 22] },
  brief: { target: 35, range: [30, 40] },
  detailed: { target: 70, range: [60, 80] },
};

async function runValidation() {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('🧪 Quick Validation Test - Verifying Tuned Prompts');
  console.log('════════════════════════════════════════════════════════════\n');

  const client = new RateLimitedGroqClient(GROQ_API_KEY);
  const results = {
    'one-liner': [],
    brief: [],
    detailed: [],
  };

  for (const length of Object.keys(LENGTH_PRESETS)) {
    console.log(`\n📏 Testing "${length}" preset (target: ${LENGTH_PRESETS[length].target} words)...`);

    for (const article of TEST_ARTICLES) {
      try {
        // Build system prompt based on settings
        const { buildSystemPrompt, getTemperature, getMaxTokens } = await import('../src/lib/prompts.js');
        const settings = { length, tone: 'witty', focus: 'key-facts' };
        const systemPrompt = buildSystemPrompt(settings);
        const temperature = getTemperature('balanced');
        const maxTokens = getMaxTokens(length);

        const response = await client.summarize(article, {
          systemPrompt,
          temperature,
          maxTokens,
        });

        if (!response.success || !response.parsed?.summary) {
          throw new Error(response.error || 'No summary in response');
        }

        const wordCount = response.parsed.summary.split(/\s+/).length;
        const [min, max] = LENGTH_PRESETS[length].range;
        const inRange = wordCount >= min && wordCount <= max;

        results[length].push({
          article: article.title,
          wordCount,
          inRange,
          summary: response.parsed.summary,
        });

        const status = inRange ? '✅' : '⚠️';
        console.log(`   ${status} ${article.title}: ${wordCount} words`);
      } catch (error) {
        console.error(`   ❌ ${article.title}: ${error.message}`);
        results[length].push({
          article: article.title,
          error: error.message,
        });
      }
    }
  }

  // Summary
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('📊 RESULTS SUMMARY');
  console.log('════════════════════════════════════════════════════════════\n');

  for (const [preset, data] of Object.entries(results)) {
    const validResults = data.filter((r) => !r.error);
    const avgWordCount = validResults.length
      ? Math.round(validResults.reduce((sum, r) => sum + r.wordCount, 0) / validResults.length)
      : 0;
    const inRangeCount = validResults.filter((r) => r.inRange).length;
    const { target, range } = LENGTH_PRESETS[preset];

    console.log(`${preset.toUpperCase()}:`);
    console.log(`   Target: ${target} words (range: ${range[0]}-${range[1]})`);
    console.log(`   Average: ${avgWordCount} words`);
    console.log(`   In range: ${inRangeCount}/${validResults.length}`);
    console.log('');
  }

  // Show sample outputs
  console.log('════════════════════════════════════════════════════════════');
  console.log('📝 SAMPLE OUTPUTS');
  console.log('════════════════════════════════════════════════════════════\n');

  for (const [preset, data] of Object.entries(results)) {
    const sample = data.find((r) => !r.error);
    if (sample) {
      console.log(`[${preset}] (${sample.wordCount} words):`);
      console.log(`   "${sample.summary}"\n`);
    }
  }

  // Overall assessment
  const allInRange = Object.values(results)
    .flat()
    .filter((r) => !r.error)
    .every((r) => r.inRange);

  if (allInRange) {
    console.log('✅ All presets hitting word count targets!');
  } else {
    console.log('⚠️ Some presets still need tuning - see results above');
  }
}

runValidation().catch(console.error);
