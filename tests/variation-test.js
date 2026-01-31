/**
 * TLDR Extension - Summary Variation Test
 * Tests regeneration variation across diverse articles
 *
 * Usage: GROQ_API_KEY=gsk_xxx node tests/variation-test.js [--full]
 *   --full: Run full 1000 article test (otherwise runs 50 article sample)
 */

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

// ============================================
// Configuration
// ============================================

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = process.env.GROQ_API_KEY;
const REGENERATIONS = 5;
const FULL_TEST = process.argv.includes('--full');
const RATE_LIMIT_DELAY = 12000; // 12s between API calls to stay under 6000 TPM free tier

// Import the same prompts used by the extension
const SYSTEM_PROMPT = `You are TLDR, a brilliant summarizer with a knack for distilling articles into their essence while keeping things clever and engaging.

Your summaries should be:
- CLEVER: Use wordplay, analogies, or unexpected framings when they fit naturally
- CONCISE: The main insight in 1-2 punchy sentences max
- HONEST: Never misrepresent or exaggerate the article's actual content
- VARIED: Don't start every summary the same way

You MUST respond with valid JSON in this exact format:
{
  "summary": "Your clever 1-2 sentence summary here",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "tone": "informative"
}

The "tone" field should be one of: informative, opinion, news, technical, entertainment, analysis

Examples of GOOD summaries:
- "Scientists confirmed what cat owners always suspected: your pet is definitely ignoring you on purpose, and yes, it knows its name."
- "Another billion-dollar startup discovered that 'move fast and break things' works better as a motto than a legal defense."
- "The housing market explained: everything costs too much, unless you already own it, in which case everything is fine."

Examples of BAD summaries:
- "This article discusses..." (boring, passive)
- "In this piece, the author..." (too formal)
- "The key takeaways are..." (robotic)

Keep key points brief (under 15 words each). Aim for 3 points unless the article only has 1-2 main ideas.`;

// Diverse article URLs across categories
const ARTICLE_URLS = [
  // News
  'https://en.wikipedia.org/wiki/Readability',
  'https://en.wikipedia.org/wiki/Artificial_intelligence',
  'https://en.wikipedia.org/wiki/Climate_change',
  'https://en.wikipedia.org/wiki/Electric_vehicle',
  'https://en.wikipedia.org/wiki/Cryptocurrency',

  // Technology
  'https://en.wikipedia.org/wiki/Machine_learning',
  'https://en.wikipedia.org/wiki/Quantum_computing',
  'https://en.wikipedia.org/wiki/Blockchain',
  'https://en.wikipedia.org/wiki/Internet_of_things',
  'https://en.wikipedia.org/wiki/5G',

  // Science
  'https://en.wikipedia.org/wiki/CRISPR_gene_editing',
  'https://en.wikipedia.org/wiki/Black_hole',
  'https://en.wikipedia.org/wiki/Mars_exploration',
  'https://en.wikipedia.org/wiki/Vaccine',
  'https://en.wikipedia.org/wiki/Nuclear_fusion',

  // Business/Economics
  'https://en.wikipedia.org/wiki/Stock_market',
  'https://en.wikipedia.org/wiki/Inflation',
  'https://en.wikipedia.org/wiki/Supply_chain',
  'https://en.wikipedia.org/wiki/Remote_work',
  'https://en.wikipedia.org/wiki/Startup_company',

  // Society
  'https://en.wikipedia.org/wiki/Social_media',
  'https://en.wikipedia.org/wiki/Mental_health',
  'https://en.wikipedia.org/wiki/Privacy',
  'https://en.wikipedia.org/wiki/Misinformation',
  'https://en.wikipedia.org/wiki/Artificial_general_intelligence',

  // Culture/Entertainment
  'https://en.wikipedia.org/wiki/Streaming_media',
  'https://en.wikipedia.org/wiki/Video_game',
  'https://en.wikipedia.org/wiki/Podcast',
  'https://en.wikipedia.org/wiki/Virtual_reality',
  'https://en.wikipedia.org/wiki/E-sports',

  // Health
  'https://en.wikipedia.org/wiki/Nutrition',
  'https://en.wikipedia.org/wiki/Sleep',
  'https://en.wikipedia.org/wiki/Exercise',
  'https://en.wikipedia.org/wiki/Meditation',
  'https://en.wikipedia.org/wiki/Longevity',

  // Environment
  'https://en.wikipedia.org/wiki/Renewable_energy',
  'https://en.wikipedia.org/wiki/Biodiversity',
  'https://en.wikipedia.org/wiki/Deforestation',
  'https://en.wikipedia.org/wiki/Ocean_acidification',
  'https://en.wikipedia.org/wiki/Sustainable_development',

  // Politics/Law
  'https://en.wikipedia.org/wiki/Democracy',
  'https://en.wikipedia.org/wiki/Human_rights',
  'https://en.wikipedia.org/wiki/Freedom_of_speech',
  'https://en.wikipedia.org/wiki/Intellectual_property',
  'https://en.wikipedia.org/wiki/Net_neutrality',

  // History/Philosophy
  'https://en.wikipedia.org/wiki/Industrial_Revolution',
  'https://en.wikipedia.org/wiki/Renaissance',
  'https://en.wikipedia.org/wiki/Existentialism',
  'https://en.wikipedia.org/wiki/Utilitarianism',
  'https://en.wikipedia.org/wiki/Scientific_method',
];

// Extended URL list for full test (generated programmatically)
const EXTENDED_TOPICS = [
  'Programming', 'Python_(programming_language)', 'JavaScript', 'Rust_(programming_language)',
  'Database', 'SQL', 'NoSQL', 'API', 'REST', 'GraphQL',
  'Cloud_computing', 'Amazon_Web_Services', 'Microsoft_Azure', 'Docker_(software)',
  'Kubernetes', 'DevOps', 'Agile_software_development', 'Scrum_(software_development)',
  'Open_source', 'Linux', 'Git', 'GitHub', 'Version_control',
  'Cybersecurity', 'Encryption', 'Firewall_(computing)', 'Malware', 'Phishing',
  'Big_data', 'Data_science', 'Neural_network', 'Deep_learning', 'Natural_language_processing',
  'Computer_vision', 'Robotics', 'Autonomous_vehicle', 'Drone', 'Smart_city',
  'Fintech', 'Mobile_banking', 'Digital_currency', 'Central_bank_digital_currency',
  'E-commerce', 'Online_shopping', 'Digital_marketing', 'Search_engine_optimization',
  'Content_creation', 'Influencer_marketing', 'Brand_management', 'Customer_experience',
  'Human_resources', 'Talent_management', 'Employee_engagement', 'Corporate_culture',
  'Leadership', 'Management', 'Decision-making', 'Strategic_planning', 'Innovation',
  'Entrepreneurship', 'Venture_capital', 'Angel_investor', 'Initial_public_offering',
  'Merger', 'Acquisition', 'Bankruptcy', 'Recession', 'Economic_growth',
  'Globalization', 'International_trade', 'Tariff', 'Free_trade', 'Protectionism',
  'Immigration', 'Refugee', 'Citizenship', 'Visa', 'Asylum',
  'Education', 'Online_learning', 'MOOC', 'Homeschooling', 'Higher_education',
  'University', 'College', 'Scholarship', 'Student_loan', 'Academic_research',
  'Science_fiction', 'Fantasy', 'Horror_fiction', 'Mystery_fiction', 'Romance_novel',
  'Film', 'Television', 'Music_industry', 'Art', 'Photography',
  'Architecture', 'Urban_planning', 'Transportation', 'Aviation', 'Railway',
  'Automobile', 'Bicycle', 'Public_transport', 'Traffic', 'Parking',
  'Agriculture', 'Organic_farming', 'Genetically_modified_food', 'Food_security',
  'Water_scarcity', 'Pollution', 'Waste_management', 'Recycling', 'Circular_economy',
  'Nuclear_power', 'Solar_power', 'Wind_power', 'Hydropower', 'Geothermal_energy',
  'Battery', 'Energy_storage', 'Smart_grid', 'Carbon_capture', 'Hydrogen_economy',
  'Space_exploration', 'NASA', 'SpaceX', 'Satellite', 'Asteroid_mining',
  'Astronomy', 'Cosmology', 'Exoplanet', 'Extraterrestrial_life', 'SETI',
  'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Statistics',
  'Psychology', 'Sociology', 'Anthropology', 'Economics', 'Political_science',
  'Philosophy', 'Ethics', 'Logic', 'Epistemology', 'Metaphysics',
  'Religion', 'Spirituality', 'Atheism', 'Secularism', 'Humanism',
  'Marriage', 'Family', 'Parenting', 'Childhood', 'Aging',
  'Gender', 'Feminism', 'LGBTQ', 'Diversity', 'Inclusion',
  'Race', 'Ethnicity', 'Culture', 'Language', 'Translation',
  'Communication', 'Journalism', 'Mass_media', 'Public_relations', 'Advertising',
  'Law', 'Court', 'Judge', 'Lawyer', 'Criminal_justice',
  'Police', 'Prison', 'Crime', 'Violence', 'War',
  'Peace', 'Diplomacy', 'United_Nations', 'NATO', 'European_Union',
  'Capitalism', 'Socialism', 'Communism', 'Libertarianism', 'Conservatism',
  'Liberalism', 'Nationalism', 'Populism', 'Authoritarianism', 'Totalitarianism',
  'Voting', 'Election', 'Political_party', 'Lobbying', 'Corruption',
  'Transparency', 'Accountability', 'Governance', 'Public_policy', 'Regulation',
];

// ============================================
// Utility Functions
// ============================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate Jaccard similarity between two strings
 */
function jaccardSimilarity(str1, str2) {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Calculate average pairwise similarity for a set of summaries
 */
function calculateVariationMetrics(summaries) {
  if (summaries.length < 2) return { avgSimilarity: 1, minSimilarity: 1, maxSimilarity: 1 };

  const similarities = [];
  for (let i = 0; i < summaries.length; i++) {
    for (let j = i + 1; j < summaries.length; j++) {
      similarities.push(jaccardSimilarity(summaries[i], summaries[j]));
    }
  }

  return {
    avgSimilarity: similarities.reduce((a, b) => a + b, 0) / similarities.length,
    minSimilarity: Math.min(...similarities),
    maxSimilarity: Math.max(...similarities),
    stdDev: standardDeviation(similarities),
  };
}

function standardDeviation(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const squareDiffs = arr.map(value => Math.pow(value - mean, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / arr.length);
}

/**
 * Check for common "bad" patterns in summaries
 */
function detectBadPatterns(summary) {
  const badPatterns = [
    /^this article/i,
    /^in this (article|piece)/i,
    /^the (article|author)/i,
    /^here('s| is) (a|the)/i,
    /^the key takeaway/i,
    /discusses how/i,
    /explores the/i,
  ];

  return badPatterns.filter(p => p.test(summary)).length;
}

/**
 * Analyze summary quality
 */
function analyzeQuality(summary) {
  return {
    length: summary.length,
    wordCount: summary.split(/\s+/).length,
    hasPunctuation: /[.!?]$/.test(summary),
    startsWithCapital: /^[A-Z]/.test(summary),
    badPatternCount: detectBadPatterns(summary),
    hasQuote: /"/.test(summary),
    hasNumber: /\d/.test(summary),
  };
}

// ============================================
// API Functions
// ============================================

async function fetchArticle(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent || article.textContent.length < 500) {
      return null;
    }

    return {
      title: article.title,
      content: article.textContent.slice(0, 6000),
      url,
    };
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error.message);
    return null;
  }
}

async function summarizeArticle(article, temperature = 0.7) {
  const userPrompt = `Summarize this article:\n\nTITLE: ${article.title}\n\nCONTENT:\n${article.content}`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    return JSON.parse(content);
  } catch {
    return { summary: content, keyPoints: [], tone: 'unknown' };
  }
}

// ============================================
// Main Test Runner
// ============================================

async function runTest() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 TLDR Summary Variation Test');
  console.log('='.repeat(70));

  if (!API_KEY) {
    console.error('\n❌ Missing GROQ_API_KEY environment variable');
    console.log('Usage: GROQ_API_KEY=gsk_xxx node tests/variation-test.js [--full]');
    process.exit(1);
  }

  // Build URL list
  let urls = ARTICLE_URLS;
  if (FULL_TEST) {
    const extended = EXTENDED_TOPICS.map(t => `https://en.wikipedia.org/wiki/${t}`);
    urls = [...ARTICLE_URLS, ...extended].slice(0, 1000);
  }

  console.log(`\n📝 Test Configuration:`);
  console.log(`   Articles: ${urls.length}`);
  console.log(`   Regenerations per article: ${REGENERATIONS}`);
  console.log(`   Total API calls: ${urls.length * REGENERATIONS}`);
  console.log(`   Temperature: 0.7 (current setting)`);
  console.log(`   Estimated time: ~${Math.ceil(urls.length * REGENERATIONS * 0.3 / 60)} minutes\n`);

  const results = [];
  const temperatureComparison = { 0.5: [], 0.7: [], 0.9: [] };
  let processed = 0;
  let failed = 0;

  // Process articles
  for (const url of urls) {
    processed++;
    const shortUrl = url.split('/wiki/')[1] || url;
    process.stdout.write(`\r[${processed}/${urls.length}] Processing: ${shortUrl.padEnd(40).slice(0, 40)}`);

    try {
      const article = await fetchArticle(url);
      if (!article) {
        failed++;
        continue;
      }

      // Generate multiple summaries
      const summaries = [];
      for (let i = 0; i < REGENERATIONS; i++) {
        await sleep(RATE_LIMIT_DELAY);
        const result = await summarizeArticle(article);
        summaries.push(result.summary);
      }

      // Calculate metrics
      const metrics = calculateVariationMetrics(summaries);
      const qualities = summaries.map(s => analyzeQuality(s));

      results.push({
        url: shortUrl,
        title: article.title,
        summaries,
        metrics,
        avgBadPatterns: qualities.reduce((a, q) => a + q.badPatternCount, 0) / qualities.length,
        avgWordCount: qualities.reduce((a, q) => a + q.wordCount, 0) / qualities.length,
      });

      // For first 10 articles, also test different temperatures
      if (processed <= 10) {
        for (const temp of [0.5, 0.9]) {
          await sleep(RATE_LIMIT_DELAY);
          const result = await summarizeArticle(article, temp);
          temperatureComparison[temp].push({
            url: shortUrl,
            summary: result.summary,
          });
        }
        temperatureComparison[0.7].push({
          url: shortUrl,
          summary: summaries[0],
        });
      }

    } catch (error) {
      failed++;
      console.error(`\n   Error: ${error.message}`);
    }
  }

  // ============================================
  // Generate Report
  // ============================================

  console.log('\n\n' + '='.repeat(70));
  console.log('📈 RESULTS');
  console.log('='.repeat(70));

  // Overall statistics
  const avgSimilarity = results.reduce((a, r) => a + r.metrics.avgSimilarity, 0) / results.length;
  const avgBadPatterns = results.reduce((a, r) => a + r.avgBadPatterns, 0) / results.length;
  const avgWordCount = results.reduce((a, r) => a + r.avgWordCount, 0) / results.length;

  console.log(`\n📊 Overall Statistics (${results.length} articles, ${REGENERATIONS} regenerations each):`);
  console.log(`   Average similarity between regenerations: ${(avgSimilarity * 100).toFixed(1)}%`);
  console.log(`   Average bad pattern count: ${avgBadPatterns.toFixed(2)} per summary`);
  console.log(`   Average word count: ${avgWordCount.toFixed(1)} words`);
  console.log(`   Failed fetches: ${failed}`);

  // Variation distribution
  const lowVariation = results.filter(r => r.metrics.avgSimilarity > 0.7).length;
  const medVariation = results.filter(r => r.metrics.avgSimilarity >= 0.4 && r.metrics.avgSimilarity <= 0.7).length;
  const highVariation = results.filter(r => r.metrics.avgSimilarity < 0.4).length;

  console.log(`\n📊 Variation Distribution:`);
  console.log(`   Low variation (>70% similar):  ${lowVariation} articles (${(lowVariation/results.length*100).toFixed(1)}%)`);
  console.log(`   Medium variation (40-70%):     ${medVariation} articles (${(medVariation/results.length*100).toFixed(1)}%)`);
  console.log(`   High variation (<40% similar): ${highVariation} articles (${(highVariation/results.length*100).toFixed(1)}%)`);

  // Quality assessment
  console.log(`\n📊 Quality Assessment:`);
  const badPatternArticles = results.filter(r => r.avgBadPatterns > 0.5).length;
  console.log(`   Articles with frequent bad patterns: ${badPatternArticles} (${(badPatternArticles/results.length*100).toFixed(1)}%)`);

  // Sample summaries
  console.log(`\n📝 Sample Regenerations (first 3 articles):`);
  for (let i = 0; i < Math.min(3, results.length); i++) {
    const r = results[i];
    console.log(`\n   [${r.url}]`);
    console.log(`   Similarity: ${(r.metrics.avgSimilarity * 100).toFixed(1)}%`);
    r.summaries.forEach((s, j) => {
      console.log(`   ${j + 1}. "${s.slice(0, 100)}${s.length > 100 ? '...' : ''}"`);
    });
  }

  // Temperature comparison
  if (temperatureComparison[0.5].length > 0) {
    console.log(`\n🌡️  Temperature Comparison (first 10 articles):`);
    console.log(`   Temp 0.5 avg length: ${(temperatureComparison[0.5].reduce((a, s) => a + s.summary.length, 0) / temperatureComparison[0.5].length).toFixed(0)} chars`);
    console.log(`   Temp 0.7 avg length: ${(temperatureComparison[0.7].reduce((a, s) => a + s.summary.length, 0) / temperatureComparison[0.7].length).toFixed(0)} chars`);
    console.log(`   Temp 0.9 avg length: ${(temperatureComparison[0.9].reduce((a, s) => a + s.summary.length, 0) / temperatureComparison[0.9].length).toFixed(0)} chars`);
  }

  // ============================================
  // Recommendations
  // ============================================

  console.log('\n' + '='.repeat(70));
  console.log('💡 RECOMMENDATIONS');
  console.log('='.repeat(70));

  if (avgSimilarity > 0.6) {
    console.log(`\n⚠️  Regenerations are quite similar (${(avgSimilarity * 100).toFixed(1)}% avg)`);
    console.log('   Consider: Increasing temperature from 0.7 to 0.8-0.9');
    console.log('   Or: Adding more variation instructions to the prompt');
  } else if (avgSimilarity < 0.3) {
    console.log(`\n⚠️  Regenerations vary significantly (${(avgSimilarity * 100).toFixed(1)}% avg)`);
    console.log('   Consider: Decreasing temperature from 0.7 to 0.5-0.6');
    console.log('   Or: Making the prompt more specific about desired output');
  } else {
    console.log(`\n✅ Variation level looks good (${(avgSimilarity * 100).toFixed(1)}% avg similarity)`);
    console.log('   Users get meaningfully different summaries on regenerate');
    console.log('   while maintaining consistent quality');
  }

  if (avgBadPatterns > 0.3) {
    console.log(`\n⚠️  Bad patterns detected in ${(avgBadPatterns * 100).toFixed(0)}% of summaries`);
    console.log('   Consider: Strengthening negative examples in prompt');
  }

  console.log(`\n📋 Suggested User Settings:`);
  console.log(`   Temperature slider: Would allow users to control variation`);
  console.log(`   - "Consistent" (0.5): More predictable, similar regenerations`);
  console.log(`   - "Balanced" (0.7): Current default, moderate variety`);
  console.log(`   - "Creative" (0.9): More diverse, unexpected phrasings`);

  console.log('\n' + '='.repeat(70) + '\n');
}

runTest().catch(console.error);
