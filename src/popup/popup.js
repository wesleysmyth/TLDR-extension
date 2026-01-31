/**
 * TLDR Extension - Popup Script
 * Handles UI state management and communication with background service worker
 */

// ============================================
// State Management
// ============================================

const State = {
  LOADING: 'loading',
  SUCCESS: 'success',
  NOT_ARTICLE: 'not-article',
  ERROR: 'error',
  NO_PROVIDER: 'no-provider',
};

let currentSummary = null;

// ============================================
// DOM Elements
// ============================================

const elements = {
  // States
  loadingState: document.getElementById('loadingState'),
  successState: document.getElementById('successState'),
  notArticleState: document.getElementById('notArticleState'),
  errorState: document.getElementById('errorState'),
  noProviderState: document.getElementById('noProviderState'),

  // Success content
  articleTitle: document.getElementById('articleTitle'),
  articleMeta: document.getElementById('articleMeta'),
  summaryText: document.getElementById('summaryText'),
  keyPointsList: document.getElementById('keyPointsList'),
  keyPointsSection: document.getElementById('keyPointsSection'),
  providerBadge: document.getElementById('providerBadge'),

  // Error content
  errorTitle: document.getElementById('errorTitle'),
  errorMessage: document.getElementById('errorMessage'),

  // Actions
  actionsFooter: document.getElementById('actionsFooter'),
  copyBtn: document.getElementById('copyBtn'),
  regenerateBtn: document.getElementById('regenerateBtn'),
  retryBtn: document.getElementById('retryBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  setupBtn: document.getElementById('setupBtn'),
};

// ============================================
// UI Functions
// ============================================

function showState(state) {
  // Hide all states
  Object.values(elements)
    .filter((el) => el?.classList?.contains('state'))
    .forEach((el) => el?.classList.add('hidden'));

  // Hide actions by default
  elements.actionsFooter.classList.add('hidden');

  // Show requested state
  switch (state) {
    case State.LOADING:
      elements.loadingState.classList.remove('hidden');
      break;
    case State.SUCCESS:
      elements.successState.classList.remove('hidden');
      elements.actionsFooter.classList.remove('hidden');
      break;
    case State.NOT_ARTICLE:
      elements.notArticleState.classList.remove('hidden');
      break;
    case State.ERROR:
      elements.errorState.classList.remove('hidden');
      break;
    case State.NO_PROVIDER:
      elements.noProviderState.classList.remove('hidden');
      break;
  }
}

function renderSummary(data) {
  const { article, summary, provider, fromCache } = data;

  // Article info
  elements.articleTitle.textContent = article.title || 'Untitled';

  const metaParts = [];
  if (article.siteName) metaParts.push(article.siteName);
  if (article.readingTime) metaParts.push(`${article.readingTime} min read`);
  elements.articleMeta.textContent = metaParts.join(' • ') || article.url;

  // Summary
  elements.summaryText.textContent = summary.summary;

  // Key points
  if (summary.keyPoints && summary.keyPoints.length > 0) {
    elements.keyPointsSection.classList.remove('hidden');
    elements.keyPointsList.innerHTML = summary.keyPoints
      .map((point) => `<li>${escapeHtml(point)}</li>`)
      .join('');
  } else {
    elements.keyPointsSection.classList.add('hidden');
  }

  // Provider badge
  const cacheLabel = fromCache ? ' (cached)' : '';
  elements.providerBadge.textContent = `✨ ${provider}${cacheLabel}`;

  showState(State.SUCCESS);
}

function renderError(error) {
  if (error.code === 'not_article') {
    showState(State.NOT_ARTICLE);
    return;
  }

  if (error.code === 'no_provider') {
    showState(State.NO_PROVIDER);
    return;
  }

  elements.errorTitle.textContent = error.title || 'Something went wrong';
  elements.errorMessage.textContent =
    error.message || 'Please try again or check your settings.';
  showState(State.ERROR);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// API Communication
// ============================================

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function extractArticle(tabId) {
  try {
    // Send message to content script to extract article
    const result = await chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_ARTICLE' });
    return result;
  } catch (error) {
    console.error('Failed to extract article:', error);
    // Content script might not be loaded yet, try injecting it
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js'],
      });
      // Retry after injection
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retryResult = await chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_ARTICLE' });
      return retryResult;
    } catch (retryError) {
      return { success: false, error: 'extraction_failed', message: retryError.message };
    }
  }
}

async function summarize(forceRefresh = false) {
  showState(State.LOADING);

  try {
    // FIRST: Check if we have a provider configured
    // This prevents confusing "Not an Article" errors during setup
    const providers = await chrome.runtime.sendMessage({ type: 'CHECK_PROVIDERS' });
    if (!providers?.data?.hasAnyProvider) {
      throw { code: 'no_provider' };
    }

    const tab = await getCurrentTab();

    if (!tab?.id) {
      throw { code: 'no_tab', message: 'Could not access current tab' };
    }

    // Check if we have a cached summary and not forcing refresh
    if (!forceRefresh) {
      const cached = await chrome.runtime.sendMessage({
        type: 'GET_CACHED_SUMMARY',
        url: tab.url,
      });

      if (cached?.success) {
        currentSummary = cached.data;
        renderSummary(cached.data);
        return;
      }
    }

    // Extract article from page
    const article = await extractArticle(tab.id);

    if (!article?.success) {
      throw {
        code: article?.error || 'extraction_failed',
        message: article?.message || 'Could not extract article content',
      };
    }

    // Send to background for summarization
    const response = await chrome.runtime.sendMessage({
      type: 'SUMMARIZE',
      article: article.data,
      forceRefresh,
    });

    if (!response?.success) {
      throw {
        code: response?.error?.code || 'summarize_failed',
        title: response?.error?.title,
        message: response?.error?.message || 'Failed to generate summary',
      };
    }

    currentSummary = response.data;
    renderSummary(response.data);
  } catch (error) {
    console.error('Summarization failed:', error);
    renderError(error);
  }
}

async function copyToClipboard() {
  if (!currentSummary) return;

  const { article, summary } = currentSummary;
  const text = [
    `📰 ${article.title}`,
    '',
    `💡 ${summary.summary}`,
    '',
    ...(summary.keyPoints || []).map((p) => `• ${p}`),
    '',
    `🔗 ${article.url}`,
  ].join('\n');

  try {
    await navigator.clipboard.writeText(text);

    // Visual feedback
    const copyBtn = elements.copyBtn;
    const originalHtml = copyBtn.innerHTML;
    copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Copied!</span>`;
    copyBtn.classList.add('copied');

    setTimeout(() => {
      copyBtn.innerHTML = originalHtml;
      copyBtn.classList.remove('copied');
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
}

// ============================================
// Event Listeners
// ============================================

elements.copyBtn.addEventListener('click', copyToClipboard);

elements.regenerateBtn.addEventListener('click', () => {
  summarize(true);
});

elements.retryBtn.addEventListener('click', () => {
  summarize(false);
});

elements.settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

elements.setupBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  summarize(false);
});
