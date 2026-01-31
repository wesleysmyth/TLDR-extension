/**
 * TLDR Extension - AI Provider Factory
 * Simplified: Groq-only provider
 */

import { GroqProvider } from './groq.js';

/**
 * Get the AI provider (Groq)
 * @param {Object} settings - User settings from storage (includes variation settings)
 * @returns {Promise<Object|null>} Provider instance or null if not configured
 */
export async function getProvider(settings = {}) {
  if (settings.groqApiKey) {
    // Extract variation settings to pass to the provider
    const variationSettings = {
      tone: settings.tone || 'witty',
      length: settings.length || 'brief',
      focus: settings.focus || 'key-facts',
      creativity: settings.creativity || 'balanced',
    };
    return new GroqProvider(settings.groqApiKey, variationSettings);
  }
  return null;
}

/**
 * Check if Groq is configured
 * @param {Object} settings - User settings
 * @returns {Promise<Object>} Availability status
 */
export async function checkProviderAvailability(settings = {}) {
  const hasGroq = Boolean(settings.groqApiKey);
  return {
    groq: hasGroq,
    hasAnyProvider: hasGroq,
  };
}

export const ProviderErrorCodes = {
  NO_PROVIDER: 'no_provider',
  RATE_LIMITED: 'rate_limited',
  INVALID_KEY: 'invalid_key',
  API_ERROR: 'api_error',
};
