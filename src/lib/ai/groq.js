/**
 * TLDR Extension - Groq API Provider
 * Fast LLM inference using Groq's API (Llama 3.1)
 */

import { buildSystemPrompt, buildUserPrompt, getTemperature, getMaxTokens } from '../prompts.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

/**
 * Groq API Provider for article summarization
 */
export class GroqProvider {
  /**
   * @param {string} apiKey - Groq API key
   * @param {Object} variationSettings - Variation settings for summary customization
   */
  constructor(apiKey, variationSettings = {}) {
    this.name = 'Groq';
    this.apiKey = apiKey;
    this.variationSettings = variationSettings;
  }

  /**
   * Check if provider is available (has valid API key)
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  /**
   * Summarize article content using Groq API
   * @param {Object} article - Article data with title and content
   * @param {Object} options - Optional override settings
   * @returns {Promise<Object>} Summary result
   */
  async summarize(article, options = {}) {
    // Merge default variation settings with any overrides
    const settings = { ...this.variationSettings, ...options };

    const systemPrompt = buildSystemPrompt(settings);
    const userPrompt = buildUserPrompt(article);
    const temperature = getTemperature(settings.creativity);
    const maxTokens = getMaxTokens(settings.length);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new GroqError(
        error.error?.message || `API request failed: ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new GroqError('Empty response from API', 500);
    }

    return this._parseResponse(content);
  }

  /**
   * Parse JSON response from Groq
   * @private
   */
  _parseResponse(content) {
    try {
      const parsed = JSON.parse(content);

      // Validate required fields
      if (!parsed.summary) {
        throw new Error('Missing summary field');
      }

      return {
        summary: parsed.summary,
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        tone: parsed.tone || 'informative',
      };
    } catch (error) {
      console.error('[TLDR] Failed to parse Groq response:', error);

      // Fallback: treat raw content as summary
      return {
        summary: content.slice(0, 500),
        keyPoints: [],
        tone: 'informative',
      };
    }
  }
}

/**
 * Custom error class for Groq API errors
 */
export class GroqError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'GroqError';
    this.statusCode = statusCode;

    // Determine error type
    if (statusCode === 429) {
      this.code = 'rate_limited';
      this.title = 'Rate Limited';
      this.recoverable = true;
    } else if (statusCode === 401) {
      this.code = 'invalid_key';
      this.title = 'Invalid API Key';
      this.recoverable = false;
    } else if (statusCode >= 500) {
      this.code = 'server_error';
      this.title = 'Server Error';
      this.recoverable = true;
    } else {
      this.code = 'api_error';
      this.title = 'API Error';
      this.recoverable = true;
    }
  }
}
