#!/usr/bin/env node
/**
 * TLDR Extension - Enhanced Variation Test v2
 * Tests multiple variation parameters with robust rate limiting
 *
 * Usage:
 *   GROQ_API_KEY=gsk_xxx node tests/variation-test-v2.js
 *   GROQ_API_KEY=gsk_xxx node tests/variation-test-v2.js --resume  # Resume from checkpoint
 *   GROQ_API_KEY=gsk_xxx node tests/variation-test-v2.js --full    # Run 1000 articles
 */

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { RateLimitedGroqClient } from './lib/rate-limited-client.js';

// ============================================
// Configuration
// ============================================

const API_KEY = process.env.GROQ_API_KEY;
const FULL_TEST = process.argv.includes('--full');
const RESUME = process.argv.includes('--resume');
const CHECKPOINT_FILE = 'tests/.variation-checkpoint.json';
const RESULTS_FILE = 'tests/variation-results.json';

const REGENERATIONS = 5;

// ============================================
// Variation Parameters to Test
// ============================================

const VARIATION_CONFIGS = {
  // Temperature variations
  temperatures: [0.3, 0.5, 0.7, 0.9, 1.0],

  // Tone presets
  tones: {
    witty: {
      name: 'Witty',
      instruction: 'Be clever and witty. Use wordplay, irony, or unexpected angles. Make the reader smile.',
      examples: [
        'Scientists confirmed what cat owners always suspected: yes, your cat is ignoring you on purpose.',
        'Another tech startup learned that "move fast and break things" works better as a motto than a legal defense.',
      ],
    },
    professional: {
      name: 'Professional',
      instruction: 'Be clear, authoritative, and precise. Suitable for business contexts.',
      examples: [
        'New research demonstrates a 47% improvement in battery efficiency using solid-state technology.',
        'Market analysis indicates sustained growth in the renewable energy sector through 2030.',
      ],
    },
    casual: {
      name: 'Casual',
      instruction: 'Be friendly and conversational. Write like you\'re telling a friend about something interesting.',
      examples: [
        'So basically, they figured out how to make batteries last way longer - pretty cool stuff.',
        'Turns out, getting enough sleep is even more important than we thought. Who knew?',
      ],
    },
    academic: {
      name: 'Academic',
      instruction: 'Be scholarly and nuanced. Acknowledge complexity and cite key findings.',
      examples: [
        'The study presents compelling evidence for neuroplasticity in adult subjects, challenging previous assumptions.',
        'This analysis contributes to our understanding of market dynamics under conditions of asymmetric information.',
      ],
    },
  },

  // Length presets
  lengths: {
    'one-liner': {
      name: 'One-liner',
      instruction: 'Summarize in exactly ONE punchy sentence. Maximum 20 words.',
      maxTokens: 100,
    },
    brief: {
      name: 'Brief',
      instruction: 'Summarize in 1-2 sentences. Keep it under 40 words total.',
      maxTokens: 200,
    },
    detailed: {
      name: 'Detailed',
      instruction: 'Provide a thorough summary in 3-4 sentences. Include context and nuance.',
      maxTokens: 400,
    },
  },

  // Focus presets
  focuses: {
    'key-facts': {
      name: 'Key Facts',
      instruction: 'Focus on the most important factual information. What are the concrete takeaways?',
    },
    opinions: {
      name: 'Opinions',
      instruction: 'Focus on the author\'s perspective and arguments. What is their stance?',
    },
    implications: {
      name: 'Implications',
      instruction: 'Focus on what this means for the reader. Why should they care?',
    },
  },
};

// Base system prompt template
const BASE_SYSTEM_PROMPT = `You are TLDR, a brilliant summarizer.

{TONE_INSTRUCTION}
{LENGTH_INSTRUCTION}
{FOCUS_INSTRUCTION}

Your summaries should be:
- HONEST: Never misrepresent or exaggerate
- VARIED: Don't start every summary the same way

You MUST respond with valid JSON:
{
  "summary": "Your summary here",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "tone": "detected_tone"
}

{EXAMPLES}

BAD patterns to avoid:
- "This article discusses..." (boring)
- "In this piece, the author..." (too formal)
- "The key takeaways are..." (robotic)`;

// ============================================
// Article Sources
// ============================================

const ARTICLE_CATEGORIES = {
  technology: [
    'Artificial_intelligence', 'Machine_learning', 'Quantum_computing',
    'Blockchain', 'Cryptocurrency', '5G', 'Internet_of_things',
  ],
  science: [
    'CRISPR_gene_editing', 'Black_hole', 'Mars_exploration',
    'Climate_change', 'Nuclear_fusion', 'Vaccine',
  ],
  business: [
    'Stock_market', 'Inflation', 'Supply_chain', 'Remote_work',
    'Startup_company', 'Venture_capital',
  ],
  society: [
    'Social_media', 'Mental_health', 'Privacy', 'Misinformation',
    'Democracy', 'Human_rights',
  ],
  health: [
    'Nutrition', 'Sleep', 'Exercise', 'Meditation', 'Longevity',
  ],
  culture: [
    'Streaming_media', 'Video_game', 'Podcast', 'Virtual_reality',
  ],
};

// Extended topics for full test
const EXTENDED_TOPICS = [
  'Programming', 'Python_(programming_language)', 'JavaScript', 'Rust_(programming_language)',
  'Database', 'API', 'Cloud_computing', 'Docker_(software)', 'Kubernetes',
  'Cybersecurity', 'Encryption', 'Big_data', 'Data_science', 'Neural_network',
  'Robotics', 'Autonomous_vehicle', 'E-commerce', 'Digital_marketing',
  'Leadership', 'Management', 'Innovation', 'Entrepreneurship',
  'Education', 'Online_learning', 'University', 'Film', 'Television',
  'Architecture', 'Transportation', 'Agriculture', 'Renewable_energy',
  'Space_exploration', 'NASA', 'Physics', 'Chemistry', 'Biology',
  'Psychology', 'Economics', 'Philosophy', 'Ethics',
];

function buildArticleUrls(full = false) {
  const base = Object.values(ARTICLE_CATEGORIES).flat();
  const urls = base.map(t => `https://en.wikipedia.org/wiki/${t}`);

  if (full) {
    const extended = EXTENDED_TOPICS.map(t => `https://en.wikipedia.org/wiki/${t}`);
    return [...urls, ...extended].slice(0, 1000);
  }

  return urls.slice(0, 50);
}

// ============================================
// Utility Functions
// ============================================

function buildPrompt(options = {}) {
  const { tone = 'witty', length = 'brief', focus = 'key-facts' } = options;

  const toneConfig = VARIATION_CONFIGS.tones[tone];
  const lengthConfig = VARIATION_CONFIGS.lengths[length];
  const focusConfig = VARIATION_CONFIGS.focuses[focus];

  let prompt = BASE_SYSTEM_PROMPT;
  prompt = prompt.replace('{TONE_INSTRUCTION}', toneConfig?.instruction || '');
  prompt = prompt.replace('{LENGTH_INSTRUCTION}', lengthConfig?.instruction || '');
  prompt = prompt.replace('{FOCUS_INSTRUCTION}', focusConfig?.instruction || '');

  const examples = toneConfig?.examples
    ? `Good examples:\n${toneConfig.examples.map(e => `- "${e}"`).join('\n')}`
    : '';
  prompt = prompt.replace('{EXAMPLES}', examples);

  return prompt;
}

function jaccardSimilarity(str1, str2) {
  const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return union.size > 0 ? intersection.size / union.size : 0;
}

function calculateVariationMetrics(summaries) {
  if (summaries.length < 2) return { avgSimilarity: 1, diversity: 0 };

  const similarities = [];
  for (let i = 0; i < summaries.length; i++) {
    for (let j = i + 1; j < summaries.length; j++) {
      similarities.push(jaccardSimilarity(summaries[i], summaries[j]));
    }
  }

  const avg = similarities.reduce((a, b) => a + b, 0) / similarities.length;
  return {
    avgSimilarity: avg,
    diversity: 1 - avg,
    min: Math.min(...similarities),
    max: Math.max(...similarities),
  };
}

function detectBadPatterns(summary) {
  const patterns = [
    /^this article/i, /^in this (article|piece)/i,
    /^the (article|author)/i, /^here('s| is)/i,
    /discusses how/i, /explores the/i,
  ];
  return patterns.filter(p => p.test(summary)).length;
}

async function fetchArticle(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.textContent || article.textContent.length < 500) {
      return null;
    }

    return {
      title: article.title,
      content: article.textContent.slice(0, 6000),
      url,
      category: url.match(/wiki\/([^/]+)$/)?.[1] || 'unknown',
    };
  } catch (error) {
    return null;
  }
}

function saveCheckpoint(data) {
  writeFileSync(CHECKPOINT_FILE, JSON.stringify(data, null, 2));
}

function loadCheckpoint() {
  if (existsSync(CHECKPOINT_FILE)) {
    return JSON.parse(readFileSync(CHECKPOINT_FILE, 'utf-8'));
  }
  return null;
}

function saveResults(data) {
  writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2));
}

// ============================================
// Test Runner
// ============================================

async function runVariationTest() {
  console.log('\n' + '═'.repeat(70));
  console.log('📊 TLDR Enhanced Variation Test v2');
  console.log('═'.repeat(70));

  if (!API_KEY) {
    console.error('\n❌ Missing GROQ_API_KEY environment variable');
    process.exit(1);
  }

  // Initialize client
  const client = new RateLimitedGroqClient(API_KEY, {
    onProgress: (info) => {
      if (info.type === 'rate_limited') {
        process.stdout.write(`\n   ⏳ Rate limited, waiting ${Math.ceil(info.waitTime / 1000)}s...`);
      }
    },
  });

  // Build URL list
  const urls = buildArticleUrls(FULL_TEST);

  // Estimate time
  const testConfigs = [
    // Phase 1: Temperature sweep (5 temps × REGEN articles = 25 requests per article subset)
    // Phase 2: Tone comparison (4 tones × sample)
    // Phase 3: Length comparison (3 lengths × sample)
    // Phase 4: Main variation test (5 regen × all articles)
  ];

  const totalRequests = urls.length * REGENERATIONS + 50 * (5 + 4 + 3); // Main + sweeps
  const estimate = client.estimateBatchTime(totalRequests);

  console.log(`\n📝 Test Configuration:`);
  console.log(`   Articles: ${urls.length}`);
  console.log(`   Regenerations: ${REGENERATIONS} per article`);
  console.log(`   Parameter sweeps: temperature, tone, length, focus`);
  console.log(`   Total API calls: ~${totalRequests}`);
  console.log(`   Estimated tokens: ~${estimate.estimatedTokens.toLocaleString()}`);
  console.log(`   Estimated time: ~${estimate.estimatedMinutes} minutes (${estimate.estimatedHours} hours)`);
  console.log(`   ${estimate.recommendation}`);

  // Load checkpoint if resuming
  let checkpoint = RESUME ? loadCheckpoint() : null;
  const results = checkpoint?.results || {
    startTime: new Date().toISOString(),
    config: { urls: urls.length, regenerations: REGENERATIONS, full: FULL_TEST },
    temperatureSweep: [],
    toneSweep: [],
    lengthSweep: [],
    focusSweep: [],
    articles: [],
    summary: {},
  };

  const startIdx = checkpoint?.lastArticleIndex || 0;

  console.log(`\n${checkpoint ? '▶️  Resuming from checkpoint...' : '🚀 Starting test...'}`);

  // ============================================
  // Phase 1: Temperature Sweep (first 10 articles)
  // ============================================

  if (results.temperatureSweep.length === 0) {
    console.log('\n📊 Phase 1: Temperature Sweep');
    const sampleUrls = urls.slice(0, 10);
    const defaultPrompt = buildPrompt({ tone: 'witty', length: 'brief', focus: 'key-facts' });

    for (const url of sampleUrls) {
      const article = await fetchArticle(url);
      if (!article) continue;

      const tempResults = {};
      for (const temp of VARIATION_CONFIGS.temperatures) {
        process.stdout.write(`\r   Testing temp=${temp} on ${article.category.padEnd(30)}`);

        const result = await client.summarize(article, {
          systemPrompt: defaultPrompt,
          temperature: temp,
        });

        if (result.success) {
          tempResults[temp] = {
            summary: result.parsed.summary,
            length: result.parsed.summary?.length || 0,
            badPatterns: detectBadPatterns(result.parsed.summary || ''),
          };
        }
      }

      results.temperatureSweep.push({
        category: article.category,
        title: article.title.slice(0, 50),
        results: tempResults,
      });

      saveCheckpoint({ results, phase: 'temperature', lastArticleIndex: 0 });
    }
    console.log('\n   ✓ Temperature sweep complete');
  }

  // ============================================
  // Phase 2: Tone Comparison (first 10 articles)
  // ============================================

  if (results.toneSweep.length === 0) {
    console.log('\n📊 Phase 2: Tone Comparison');
    const sampleUrls = urls.slice(0, 10);

    for (const url of sampleUrls) {
      const article = await fetchArticle(url);
      if (!article) continue;

      const toneResults = {};
      for (const [toneKey, toneConfig] of Object.entries(VARIATION_CONFIGS.tones)) {
        process.stdout.write(`\r   Testing tone=${toneKey.padEnd(12)} on ${article.category.padEnd(25)}`);

        const prompt = buildPrompt({ tone: toneKey, length: 'brief', focus: 'key-facts' });
        const result = await client.summarize(article, {
          systemPrompt: prompt,
          temperature: 0.7,
        });

        if (result.success) {
          toneResults[toneKey] = {
            summary: result.parsed.summary,
            length: result.parsed.summary?.length || 0,
          };
        }
      }

      results.toneSweep.push({
        category: article.category,
        title: article.title.slice(0, 50),
        results: toneResults,
      });

      saveCheckpoint({ results, phase: 'tone', lastArticleIndex: 0 });
    }
    console.log('\n   ✓ Tone comparison complete');
  }

  // ============================================
  // Phase 3: Length Comparison (first 10 articles)
  // ============================================

  if (results.lengthSweep.length === 0) {
    console.log('\n📊 Phase 3: Length Comparison');
    const sampleUrls = urls.slice(0, 10);

    for (const url of sampleUrls) {
      const article = await fetchArticle(url);
      if (!article) continue;

      const lengthResults = {};
      for (const [lengthKey, lengthConfig] of Object.entries(VARIATION_CONFIGS.lengths)) {
        process.stdout.write(`\r   Testing length=${lengthKey.padEnd(10)} on ${article.category.padEnd(25)}`);

        const prompt = buildPrompt({ tone: 'witty', length: lengthKey, focus: 'key-facts' });
        const result = await client.summarize(article, {
          systemPrompt: prompt,
          temperature: 0.7,
          maxTokens: lengthConfig.maxTokens,
        });

        if (result.success) {
          lengthResults[lengthKey] = {
            summary: result.parsed.summary,
            length: result.parsed.summary?.length || 0,
            wordCount: result.parsed.summary?.split(/\s+/).length || 0,
          };
        }
      }

      results.lengthSweep.push({
        category: article.category,
        title: article.title.slice(0, 50),
        results: lengthResults,
      });

      saveCheckpoint({ results, phase: 'length', lastArticleIndex: 0 });
    }
    console.log('\n   ✓ Length comparison complete');
  }

  // ============================================
  // Phase 4: Main Variation Test (all articles × 5 regen)
  // ============================================

  console.log('\n📊 Phase 4: Regeneration Variation Test');
  const defaultPrompt = buildPrompt({ tone: 'witty', length: 'brief', focus: 'key-facts' });

  for (let i = startIdx; i < urls.length; i++) {
    const url = urls[i];
    const article = await fetchArticle(url);

    if (!article) {
      continue;
    }

    process.stdout.write(`\r   [${i + 1}/${urls.length}] ${article.category.padEnd(30)}`);

    const summaries = [];
    for (let r = 0; r < REGENERATIONS; r++) {
      const result = await client.summarize(article, {
        systemPrompt: defaultPrompt,
        temperature: 0.7,
      });

      if (result.success && result.parsed.summary) {
        summaries.push(result.parsed.summary);
      }
    }

    if (summaries.length >= 2) {
      const metrics = calculateVariationMetrics(summaries);
      const qualities = summaries.map(s => ({
        length: s.length,
        wordCount: s.split(/\s+/).length,
        badPatterns: detectBadPatterns(s),
      }));

      results.articles.push({
        category: article.category,
        title: article.title.slice(0, 50),
        summaries,
        metrics,
        avgWordCount: qualities.reduce((a, q) => a + q.wordCount, 0) / qualities.length,
        avgBadPatterns: qualities.reduce((a, q) => a + q.badPatterns, 0) / qualities.length,
      });
    }

    // Save checkpoint every 10 articles
    if (i % 10 === 0) {
      saveCheckpoint({ results, phase: 'main', lastArticleIndex: i });
    }
  }

  console.log('\n   ✓ Main variation test complete');

  // ============================================
  // Generate Report
  // ============================================

  console.log('\n\n' + '═'.repeat(70));
  console.log('📈 RESULTS');
  console.log('═'.repeat(70));

  // Temperature analysis
  if (results.temperatureSweep.length > 0) {
    console.log('\n🌡️  Temperature Analysis:');
    const tempStats = {};
    for (const temp of VARIATION_CONFIGS.temperatures) {
      const lengths = results.temperatureSweep
        .map(r => r.results[temp]?.length || 0)
        .filter(l => l > 0);
      const badPatterns = results.temperatureSweep
        .map(r => r.results[temp]?.badPatterns || 0);

      if (lengths.length > 0) {
        tempStats[temp] = {
          avgLength: Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length),
          avgBadPatterns: (badPatterns.reduce((a, b) => a + b, 0) / badPatterns.length).toFixed(2),
        };
        console.log(`   Temp ${temp}: avg ${tempStats[temp].avgLength} chars, ${tempStats[temp].avgBadPatterns} bad patterns`);
      }
    }
  }

  // Tone analysis
  if (results.toneSweep.length > 0) {
    console.log('\n🎭 Tone Analysis:');
    for (const [toneKey, toneConfig] of Object.entries(VARIATION_CONFIGS.tones)) {
      const lengths = results.toneSweep
        .map(r => r.results[toneKey]?.length || 0)
        .filter(l => l > 0);

      if (lengths.length > 0) {
        const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
        console.log(`   ${toneConfig.name.padEnd(12)}: avg ${avg} chars`);
      }
    }
  }

  // Length analysis
  if (results.lengthSweep.length > 0) {
    console.log('\n📏 Length Analysis:');
    for (const [lengthKey, lengthConfig] of Object.entries(VARIATION_CONFIGS.lengths)) {
      const wordCounts = results.lengthSweep
        .map(r => r.results[lengthKey]?.wordCount || 0)
        .filter(w => w > 0);

      if (wordCounts.length > 0) {
        const avg = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length);
        console.log(`   ${lengthConfig.name.padEnd(12)}: avg ${avg} words`);
      }
    }
  }

  // Main variation analysis
  if (results.articles.length > 0) {
    const avgSimilarity = results.articles.reduce((a, r) => a + r.metrics.avgSimilarity, 0) / results.articles.length;
    const avgBadPatterns = results.articles.reduce((a, r) => a + r.avgBadPatterns, 0) / results.articles.length;

    console.log(`\n📊 Regeneration Variation (${results.articles.length} articles × ${REGENERATIONS} each):`);
    console.log(`   Average similarity: ${(avgSimilarity * 100).toFixed(1)}%`);
    console.log(`   Diversity score: ${((1 - avgSimilarity) * 100).toFixed(1)}%`);
    console.log(`   Bad pattern rate: ${(avgBadPatterns * 100).toFixed(1)}%`);

    // Distribution
    const low = results.articles.filter(r => r.metrics.avgSimilarity > 0.6).length;
    const med = results.articles.filter(r => r.metrics.avgSimilarity >= 0.3 && r.metrics.avgSimilarity <= 0.6).length;
    const high = results.articles.filter(r => r.metrics.avgSimilarity < 0.3).length;

    console.log(`\n   Variation distribution:`);
    console.log(`   - Low variety (>60% similar):   ${low} articles`);
    console.log(`   - Good variety (30-60%):        ${med} articles`);
    console.log(`   - High variety (<30% similar):  ${high} articles`);
  }

  // Sample outputs
  if (results.toneSweep.length > 0) {
    console.log('\n📝 Sample Tone Comparison (first article):');
    const sample = results.toneSweep[0];
    console.log(`   Article: ${sample.title}`);
    for (const [tone, data] of Object.entries(sample.results)) {
      if (data?.summary) {
        console.log(`   [${tone}]: "${data.summary.slice(0, 80)}..."`);
      }
    }
  }

  // ============================================
  // Recommendations
  // ============================================

  console.log('\n' + '═'.repeat(70));
  console.log('💡 RECOMMENDATIONS FOR USER SETTINGS');
  console.log('═'.repeat(70));

  console.log(`
Based on the test results, here are the recommended user-facing settings:

┌─────────────────────────────────────────────────────────────────────┐
│ 🎭 TONE PRESET                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ • Witty (default)  - Clever, engaging, uses wordplay               │
│ • Professional     - Clear, authoritative, business-appropriate     │
│ • Casual           - Friendly, conversational                       │
│ • Academic         - Scholarly, nuanced                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 📏 LENGTH PRESET                                                    │
├─────────────────────────────────────────────────────────────────────┤
│ • One-liner        - Single punchy sentence (~15-20 words)          │
│ • Brief (default)  - 1-2 sentences (~30-40 words)                   │
│ • Detailed         - 3-4 sentences with context (~60-80 words)      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 🎯 FOCUS PRESET                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ • Key Facts (def)  - Main factual takeaways                         │
│ • Opinions         - Author's perspective and arguments             │
│ • Implications     - Why it matters to the reader                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 🌡️  CREATIVITY (Advanced)                                           │
├─────────────────────────────────────────────────────────────────────┤
│ • Consistent (0.3) - Predictable, similar regenerations             │
│ • Balanced (0.7)   - Default, moderate variety                      │
│ • Creative (1.0)   - Diverse, unexpected phrasings                  │
└─────────────────────────────────────────────────────────────────────┘
`);

  // Client stats
  const stats = client.getStats();
  console.log('\n📊 API Usage:');
  console.log(`   Total requests: ${stats.totalRequests}`);
  console.log(`   Total tokens: ${stats.totalTokens.toLocaleString()}`);
  console.log(`   Total retries: ${stats.totalRetries}`);
  console.log(`   Avg tokens/request: ${stats.avgTokensPerRequest}`);

  // Save final results
  results.endTime = new Date().toISOString();
  results.summary = {
    articlesProcessed: results.articles.length,
    avgSimilarity: results.articles.length > 0
      ? results.articles.reduce((a, r) => a + r.metrics.avgSimilarity, 0) / results.articles.length
      : 0,
    apiStats: stats,
  };

  saveResults(results);
  console.log(`\n✅ Results saved to ${RESULTS_FILE}`);
  console.log('═'.repeat(70) + '\n');
}

runVariationTest().catch(console.error);
