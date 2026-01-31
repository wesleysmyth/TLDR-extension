/**
 * Rate-Limited Groq Client
 * Handles API rate limits gracefully with exponential backoff and token tracking
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * @typedef {Object} RateLimitInfo
 * @property {number} limitRequests - Max requests per minute
 * @property {number} limitTokens - Max tokens per minute
 * @property {number} remainingRequests - Remaining requests this minute
 * @property {number} remainingTokens - Remaining tokens this minute
 * @property {number} resetRequests - Seconds until request limit resets
 * @property {number} resetTokens - Seconds until token limit resets
 */

/**
 * @typedef {Object} RequestResult
 * @property {boolean} success
 * @property {Object} data - Response data (if success)
 * @property {string} error - Error message (if failed)
 * @property {number} tokensUsed - Tokens consumed by this request
 * @property {RateLimitInfo} rateLimits - Current rate limit status
 * @property {number} retries - Number of retries needed
 */

export class RateLimitedGroqClient {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.model = options.model || 'llama-3.1-8b-instant';

    // Rate limit tracking
    this.rateLimits = {
      limitRequests: 30,     // Conservative default
      limitTokens: 6000,     // Free tier default
      remainingRequests: 30,
      remainingTokens: 6000,
      resetRequests: 60,
      resetTokens: 60,
    };

    // Backoff configuration
    this.maxRetries = options.maxRetries || 5;
    this.baseDelay = options.baseDelay || 1000; // 1 second
    this.maxDelay = options.maxDelay || 60000;  // 60 seconds

    // Request tracking
    this.totalRequests = 0;
    this.totalTokens = 0;
    this.totalRetries = 0;
    this.errors = [];

    // Progress callback
    this.onProgress = options.onProgress || null;
  }

  /**
   * Parse rate limit headers from Groq response
   * @param {Headers} headers - Response headers
   */
  _parseRateLimitHeaders(headers) {
    const parse = (key, defaultValue) => {
      const value = headers.get(key);
      return value ? parseInt(value, 10) : defaultValue;
    };

    const parseTime = (key, defaultValue) => {
      const value = headers.get(key);
      if (!value) return defaultValue;
      // Format: "1m30s" or "45s" or "2m"
      const match = value.match(/(?:(\d+)m)?(?:(\d+(?:\.\d+)?)s)?/);
      if (match) {
        const minutes = parseInt(match[1] || '0', 10);
        const seconds = parseFloat(match[2] || '0');
        return minutes * 60 + seconds;
      }
      return defaultValue;
    };

    this.rateLimits = {
      limitRequests: parse('x-ratelimit-limit-requests', this.rateLimits.limitRequests),
      limitTokens: parse('x-ratelimit-limit-tokens', this.rateLimits.limitTokens),
      remainingRequests: parse('x-ratelimit-remaining-requests', this.rateLimits.remainingRequests),
      remainingTokens: parse('x-ratelimit-remaining-tokens', this.rateLimits.remainingTokens),
      resetRequests: parseTime('x-ratelimit-reset-requests', this.rateLimits.resetRequests),
      resetTokens: parseTime('x-ratelimit-reset-tokens', this.rateLimits.resetTokens),
    };
  }

  /**
   * Calculate delay before next request based on rate limits
   * @returns {number} Milliseconds to wait
   */
  _calculateDelay() {
    // If we're low on tokens, wait for reset
    if (this.rateLimits.remainingTokens < 2000) {
      return Math.ceil(this.rateLimits.resetTokens * 1000) + 500;
    }

    // If we're low on requests, wait for reset
    if (this.rateLimits.remainingRequests < 2) {
      return Math.ceil(this.rateLimits.resetRequests * 1000) + 500;
    }

    // Otherwise, pace ourselves to avoid hitting limits
    // Aim for ~50% of capacity to leave room for bursts
    const tokensPerRequest = 1800; // Conservative estimate
    const safeRequestsPerMinute = Math.floor(this.rateLimits.limitTokens / tokensPerRequest / 2);
    const delayBetweenRequests = Math.ceil(60000 / Math.max(safeRequestsPerMinute, 1));

    return Math.max(delayBetweenRequests, 500); // Minimum 500ms between requests
  }

  /**
   * Calculate exponential backoff delay
   * @param {number} attempt - Retry attempt number (0-indexed)
   * @returns {number} Milliseconds to wait
   */
  _exponentialBackoff(attempt) {
    const delay = Math.min(
      this.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
      this.maxDelay
    );
    return Math.ceil(delay);
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make a single API request with retry logic
   * @param {Object} body - Request body
   * @returns {Promise<RequestResult>}
   */
  async _makeRequest(body) {
    let lastError = null;
    let retries = 0;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        // Parse rate limit headers regardless of success/failure
        this._parseRateLimitHeaders(response.headers);

        if (response.ok) {
          const data = await response.json();
          const tokensUsed = data.usage?.total_tokens || 0;

          this.totalRequests++;
          this.totalTokens += tokensUsed;

          return {
            success: true,
            data,
            tokensUsed,
            rateLimits: { ...this.rateLimits },
            retries,
          };
        }

        // Handle rate limiting
        if (response.status === 429) {
          retries++;
          this.totalRetries++;

          const backoff = this._exponentialBackoff(attempt);
          const resetDelay = Math.max(
            this.rateLimits.resetTokens * 1000,
            this.rateLimits.resetRequests * 1000
          );
          const waitTime = Math.max(backoff, resetDelay) + 1000;

          if (this.onProgress) {
            this.onProgress({
              type: 'rate_limited',
              attempt,
              waitTime,
              rateLimits: this.rateLimits,
            });
          }

          await this._sleep(waitTime);
          continue;
        }

        // Non-retryable error
        const errorData = await response.json().catch(() => ({}));
        lastError = errorData.error?.message || `HTTP ${response.status}`;

        // Only retry on 5xx errors
        if (response.status >= 500 && attempt < this.maxRetries) {
          retries++;
          this.totalRetries++;
          await this._sleep(this._exponentialBackoff(attempt));
          continue;
        }

        break;
      } catch (error) {
        lastError = error.message;
        if (attempt < this.maxRetries) {
          retries++;
          this.totalRetries++;
          await this._sleep(this._exponentialBackoff(attempt));
          continue;
        }
      }
    }

    this.errors.push(lastError);
    return {
      success: false,
      error: lastError,
      tokensUsed: 0,
      rateLimits: { ...this.rateLimits },
      retries,
    };
  }

  /**
   * Summarize article with rate limiting
   * @param {Object} article - Article with title and content
   * @param {Object} options - Summarization options
   * @returns {Promise<RequestResult>}
   */
  async summarize(article, options = {}) {
    const {
      systemPrompt,
      temperature = 0.7,
      maxTokens = 500,
    } = options;

    // Wait for safe window based on current rate limits
    const delay = this._calculateDelay();
    if (delay > 0) {
      await this._sleep(delay);
    }

    const userPrompt = `Summarize this article:\n\nTITLE: ${article.title}\n\nCONTENT:\n${article.content.slice(0, 6000)}`;

    const body = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    };

    const result = await this._makeRequest(body);

    if (result.success) {
      const content = result.data.choices?.[0]?.message?.content;
      try {
        result.parsed = JSON.parse(content);
      } catch {
        result.parsed = { summary: content, keyPoints: [], tone: 'unknown' };
      }
    }

    return result;
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      totalRequests: this.totalRequests,
      totalTokens: this.totalTokens,
      totalRetries: this.totalRetries,
      errorCount: this.errors.length,
      rateLimits: { ...this.rateLimits },
      avgTokensPerRequest: this.totalRequests > 0
        ? Math.round(this.totalTokens / this.totalRequests)
        : 0,
    };
  }

  /**
   * Estimate time for batch of requests
   * @param {number} requestCount - Number of requests to make
   * @returns {Object} Estimated duration and details
   */
  estimateBatchTime(requestCount) {
    const tokensPerRequest = 1800;
    const tokensNeeded = requestCount * tokensPerRequest;
    const tokensPerMinute = this.rateLimits.limitTokens;
    const minutesNeeded = Math.ceil(tokensNeeded / tokensPerMinute);

    return {
      requests: requestCount,
      estimatedTokens: tokensNeeded,
      tokensPerMinute,
      estimatedMinutes: minutesNeeded,
      estimatedHours: (minutesNeeded / 60).toFixed(1),
      recommendation: minutesNeeded > 60
        ? 'Consider running overnight or upgrading Groq tier'
        : 'Should complete in reasonable time',
    };
  }
}

export default RateLimitedGroqClient;
