/**
 * TLDR Extension - Content Script
 * Extracts article content from web pages using Readability
 */

import { extractArticle } from '../lib/extractor.js';

// Expose extraction function globally for popup to call
window.__tldrExtractArticle = extractArticle;

// Also listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACT_ARTICLE') {
    const result = extractArticle();
    sendResponse(result);
  }
  return true;
});

console.log('[TLDR] Content script loaded');
