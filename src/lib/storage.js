/**
 * TLDR Extension - Storage Wrapper
 * Handles settings persistence and summary caching
 */

const STORAGE_KEYS = {
  SETTINGS: 'tldr_settings',
  SUMMARY_CACHE: 'tldr_cache',
};

const DEFAULT_SETTINGS = {
  // AI Provider preference
  provider: 'auto', // 'auto', 'chrome', 'groq'
  groqApiKey: null,

  // Cache settings
  enableCache: true,
  cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours in ms

  // Variation settings for summary customization
  tone: 'witty',           // 'witty', 'professional', 'casual', 'academic'
  length: 'brief',         // 'one-liner', 'brief', 'detailed'
  focus: 'key-facts',      // 'key-facts', 'opinions', 'implications'
  creativity: 'balanced',  // 'consistent', 'balanced', 'creative'

  // UI preferences
  theme: 'system',
};

const MAX_CACHE_ENTRIES = 100;

/**
 * Storage wrapper for Chrome extension storage APIs
 */
export const storage = {
  /**
   * Get user settings
   * @returns {Promise<Object>} Settings object with defaults applied
   */
  async getSettings() {
    try {
      const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
      return { ...DEFAULT_SETTINGS, ...result[STORAGE_KEYS.SETTINGS] };
    } catch (error) {
      console.error('[TLDR] Failed to load settings:', error);
      return { ...DEFAULT_SETTINGS };
    }
  },

  /**
   * Save user settings
   * @param {Object} settings - Settings to save (merged with existing)
   */
  async setSettings(settings) {
    try {
      const current = await this.getSettings();
      const merged = { ...current, ...settings };
      await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: merged });
    } catch (error) {
      console.error('[TLDR] Failed to save settings:', error);
      throw error;
    }
  },

  /**
   * Get cached summary for a URL
   * @param {string} url - Page URL
   * @returns {Promise<Object|null>} Cached summary or null
   */
  async getCachedSummary(url) {
    try {
      const settings = await this.getSettings();
      if (!settings.enableCache) return null;

      const result = await chrome.storage.local.get(STORAGE_KEYS.SUMMARY_CACHE);
      const cache = result[STORAGE_KEYS.SUMMARY_CACHE] || {};

      const cacheKey = this._hashUrl(url);
      const entry = cache[cacheKey];

      if (!entry) return null;

      // Check if expired
      if (Date.now() - entry.timestamp > settings.cacheExpiry) {
        // Clean up expired entry
        delete cache[cacheKey];
        await chrome.storage.local.set({ [STORAGE_KEYS.SUMMARY_CACHE]: cache });
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('[TLDR] Failed to get cached summary:', error);
      return null;
    }
  },

  /**
   * Cache a summary for a URL
   * @param {string} url - Page URL
   * @param {Object} data - Summary data to cache
   */
  async cacheSummary(url, data) {
    try {
      const settings = await this.getSettings();
      if (!settings.enableCache) return;

      const result = await chrome.storage.local.get(STORAGE_KEYS.SUMMARY_CACHE);
      const cache = result[STORAGE_KEYS.SUMMARY_CACHE] || {};

      // Enforce max cache size
      const keys = Object.keys(cache);
      if (keys.length >= MAX_CACHE_ENTRIES) {
        // Remove oldest entry
        const oldest = keys.reduce((a, b) =>
          cache[a].timestamp < cache[b].timestamp ? a : b
        );
        delete cache[oldest];
      }

      const cacheKey = this._hashUrl(url);
      cache[cacheKey] = {
        data,
        timestamp: Date.now(),
        url, // Store original URL for debugging
      };

      await chrome.storage.local.set({ [STORAGE_KEYS.SUMMARY_CACHE]: cache });
    } catch (error) {
      console.error('[TLDR] Failed to cache summary:', error);
    }
  },

  /**
   * Clear all cached summaries
   */
  async clearCache() {
    try {
      await chrome.storage.local.remove(STORAGE_KEYS.SUMMARY_CACHE);
    } catch (error) {
      console.error('[TLDR] Failed to clear cache:', error);
      throw error;
    }
  },

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache stats
   */
  async getCacheStats() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.SUMMARY_CACHE);
      const cache = result[STORAGE_KEYS.SUMMARY_CACHE] || {};
      const entries = Object.values(cache);

      return {
        count: entries.length,
        maxEntries: MAX_CACHE_ENTRIES,
        oldestEntry: entries.length
          ? new Date(Math.min(...entries.map((e) => e.timestamp)))
          : null,
        newestEntry: entries.length
          ? new Date(Math.max(...entries.map((e) => e.timestamp)))
          : null,
      };
    } catch (error) {
      console.error('[TLDR] Failed to get cache stats:', error);
      return { count: 0, maxEntries: MAX_CACHE_ENTRIES };
    }
  },

  /**
   * Simple hash function for URLs (for cache keys)
   * @private
   */
  _hashUrl(url) {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return 'url_' + Math.abs(hash).toString(36);
  },
};

export { DEFAULT_SETTINGS, STORAGE_KEYS };
