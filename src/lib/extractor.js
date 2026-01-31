/**
 * TLDR Extension - Article Extractor
 * Uses Readability.js to extract article content from web pages
 */

import { Readability, isProbablyReaderable } from '@mozilla/readability';
import DOMPurify from 'dompurify';

/**
 * Estimate reading time in minutes
 * @param {string} text - Article text
 * @returns {number} Reading time in minutes
 */
function estimateReadingTime(text) {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Extract the domain name from URL
 * @param {string} url - Full URL
 * @returns {string} Domain name
 */
function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Extract article content from the current page
 * @returns {Object} Extraction result with success status and data/error
 */
export function extractArticle() {
  try {
    // Check if page is likely an article
    if (!isProbablyReaderable(document)) {
      return {
        success: false,
        error: 'not_article',
        message: "This page doesn't appear to be an article",
      };
    }

    // Clone document to avoid modifying the page
    const documentClone = document.cloneNode(true);

    // Remove script and style tags from clone
    const elementsToRemove = documentClone.querySelectorAll(
      'script, style, noscript, iframe'
    );
    elementsToRemove.forEach((el) => el.remove());

    // Extract article using Readability
    const reader = new Readability(documentClone, {
      charThreshold: 100, // Lower threshold for shorter articles
      keepClasses: false,
      nbTopCandidates: 5,
    });

    const article = reader.parse();

    if (!article || !article.textContent) {
      return {
        success: false,
        error: 'extraction_failed',
        message: 'Could not extract article content',
      };
    }

    // Check minimum content length
    const textContent = article.textContent.trim();
    if (textContent.length < 100) {
      return {
        success: false,
        error: 'not_article',
        message: 'Article content is too short',
      };
    }

    // Sanitize content
    const sanitizedTitle = DOMPurify.sanitize(article.title || document.title, {
      ALLOWED_TAGS: [],
    });

    // Build result
    const result = {
      title: sanitizedTitle || 'Untitled',
      content: textContent,
      excerpt: article.excerpt || textContent.slice(0, 200) + '...',
      byline: article.byline || null,
      siteName: article.siteName || extractDomain(window.location.href),
      url: window.location.href,
      readingTime: estimateReadingTime(textContent),
      wordCount: textContent.split(/\s+/).length,
      lang: article.lang || document.documentElement.lang || 'en',
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('[TLDR] Extraction error:', error);
    return {
      success: false,
      error: 'extraction_failed',
      message: error.message || 'Unknown extraction error',
    };
  }
}

/**
 * Check if the current page is likely readable
 * @returns {boolean}
 */
export function isReaderable() {
  return isProbablyReaderable(document);
}
