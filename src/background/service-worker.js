/**
 * TLDR Extension - Service Worker (Background Script)
 * Orchestrates summarization flow and manages state
 */

import { storage } from '../lib/storage.js';
import { getProvider, ProviderErrorCodes } from '../lib/ai/provider.js';

// ============================================
// Message Handler Registration
// IMPORTANT: Must be at top level for MV3
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle messages asynchronously
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error('[TLDR] Message handler error:', error);
      sendResponse({
        success: false,
        error: {
          code: error.code || 'unknown',
          title: error.title || 'Error',
          message: error.message || 'An unexpected error occurred',
        },
      });
    });

  // Return true to indicate async response
  return true;
});

// ============================================
// Message Router
// ============================================

async function handleMessage(message, sender) {
  console.log('[TLDR] Received message:', message.type);

  switch (message.type) {
    case 'SUMMARIZE':
      return handleSummarize(message.article, message.forceRefresh);

    case 'GET_CACHED_SUMMARY':
      return handleGetCached(message.url);

    case 'GET_SETTINGS':
      return handleGetSettings();

    case 'SAVE_SETTINGS':
      return handleSaveSettings(message.settings);

    case 'CHECK_PROVIDERS':
      return handleCheckProviders();

    case 'CLEAR_CACHE':
      return handleClearCache();

    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

// ============================================
// Handlers
// ============================================

/**
 * Main summarization handler
 */
async function handleSummarize(article, forceRefresh = false) {
  const settings = await storage.getSettings();

  // Check cache first (unless forcing refresh)
  if (!forceRefresh) {
    const cached = await storage.getCachedSummary(article.url);
    if (cached) {
      console.log('[TLDR] Returning cached summary');
      return {
        success: true,
        data: {
          ...cached,
          fromCache: true,
        },
      };
    }
  }

  // Get AI provider
  const provider = await getProvider(settings);

  if (!provider) {
    return {
      success: false,
      error: {
        code: ProviderErrorCodes.NO_PROVIDER,
        title: 'Setup Required',
        message: 'Add your free Groq API key to start summarizing articles!',
      },
    };
  }

  try {
    // Generate summary
    console.log(`[TLDR] Summarizing with ${provider.name}...`);
    const summary = await provider.summarize(article);

    // Build response data
    const data = {
      article: {
        title: article.title,
        url: article.url,
        siteName: article.siteName,
        readingTime: article.readingTime,
      },
      summary,
      provider: provider.name,
      fromCache: false,
    };

    // Cache the result
    await storage.cacheSummary(article.url, data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[TLDR] Summarization failed:', error);

    // Clean up provider if needed
    if (typeof provider.destroy === 'function') {
      provider.destroy();
    }

    return {
      success: false,
      error: {
        code: error.code || 'summarize_failed',
        title: error.title || 'Summarization Failed',
        message: error.message || 'Failed to generate summary. Please try again.',
      },
    };
  }
}

/**
 * Get cached summary for URL
 */
async function handleGetCached(url) {
  const cached = await storage.getCachedSummary(url);

  if (cached) {
    return {
      success: true,
      data: {
        ...cached,
        fromCache: true,
      },
    };
  }

  return { success: false };
}

/**
 * Get current settings
 */
async function handleGetSettings() {
  const settings = await storage.getSettings();
  return { success: true, data: settings };
}

/**
 * Save settings
 */
async function handleSaveSettings(settings) {
  await storage.setSettings(settings);
  return { success: true };
}

/**
 * Check provider availability
 */
async function handleCheckProviders() {
  const settings = await storage.getSettings();
  const { checkProviderAvailability } = await import('../lib/ai/provider.js');
  const availability = await checkProviderAvailability(settings);

  return {
    success: true,
    data: availability,
  };
}

/**
 * Clear summary cache
 */
async function handleClearCache() {
  await storage.clearCache();
  return { success: true };
}

// ============================================
// Extension Events
// ============================================

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[TLDR] Extension installed/updated:', details.reason);

  if (details.reason === 'install') {
    // First install - could show onboarding
    console.log('[TLDR] First install - welcome!');
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('[TLDR] Updated from version:', details.previousVersion);
  }
});

// Log when service worker starts
console.log('[TLDR] Service worker initialized');
