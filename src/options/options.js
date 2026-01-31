/**
 * TLDR Extension - Options Page Script
 * Handles API key configuration and variation settings
 */

// ============================================
// DOM Elements
// ============================================

const elements = {
  // Status
  heroStatus: document.getElementById('heroStatus'),
  statusDot: document.getElementById('statusDot'),
  statusLabel: document.getElementById('statusLabel'),
  setupGuide: document.getElementById('setupGuide'),

  // Form inputs
  groqApiKey: document.getElementById('groqApiKey'),
  toggleKeyVisibility: document.getElementById('toggleKeyVisibility'),
  eyeIcon: document.getElementById('eyeIcon'),
  enableCache: document.getElementById('enableCache'),

  // Variation settings
  tonePresets: document.getElementById('tonePresets'),
  lengthPresets: document.getElementById('lengthPresets'),
  focusPresets: document.getElementById('focusPresets'),
  creativitySlider: document.getElementById('creativitySlider'),
  creativityHint: document.getElementById('creativityHint'),

  // Cache
  cacheCount: document.getElementById('cacheCount'),
  clearCacheBtn: document.getElementById('clearCacheBtn'),

  // Actions
  saveBtn: document.getElementById('saveBtn'),
  saveStatus: document.getElementById('saveStatus'),
};

// ============================================
// Current Settings State
// ============================================

let currentSettings = {
  tone: 'witty',
  length: 'brief',
  focus: 'key-facts',
  creativity: 'balanced',
};

const creativityValues = ['consistent', 'balanced', 'creative'];
const creativityHints = {
  consistent: 'Consistent: Predictable, similar regenerations',
  balanced: 'Balanced: Moderate variety in regenerations',
  creative: 'Creative: Diverse, unexpected phrasings',
};

// ============================================
// Status Display
// ============================================

function updateStatus(isConnected) {
  if (isConnected) {
    elements.heroStatus.classList.add('connected');
    elements.statusDot.classList.remove('status-dot--inactive');
    elements.statusDot.classList.add('status-dot--active');
    elements.statusLabel.textContent = 'Connected ✓';
    elements.setupGuide.style.display = 'none';
    elements.saveBtn.textContent = 'Update API Key';
  } else {
    elements.heroStatus.classList.remove('connected');
    elements.statusDot.classList.add('status-dot--inactive');
    elements.statusDot.classList.remove('status-dot--active');
    elements.statusLabel.textContent = 'Not connected';
    elements.setupGuide.style.display = 'block';
    elements.saveBtn.textContent = 'Save API Key';
  }
}

async function checkStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'CHECK_PROVIDERS' });
    if (response?.success) {
      updateStatus(response.data.groq);
    }
  } catch (error) {
    console.error('[TLDR Options] Failed to check status:', error);
  }
}

// ============================================
// Preset Button Management
// ============================================

function updatePresetButtons(setting, value) {
  const containerId = `${setting}Presets`;
  const container = document.getElementById(containerId);
  if (!container) return;

  // Remove active class from all buttons in this group
  container.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Add active class to selected button
  const activeBtn = container.querySelector(`[data-value="${value}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

function initPresetButtons() {
  // Handle all preset button clicks
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const setting = btn.dataset.setting;
      const value = btn.dataset.value;

      // Update UI immediately
      updatePresetButtons(setting, value);
      currentSettings[setting] = value;

      // Auto-save variation settings
      await saveVariationSettings();
    });
  });
}

// ============================================
// Creativity Slider
// ============================================

function updateCreativitySlider(value) {
  const index = creativityValues.indexOf(value);
  if (index >= 0) {
    elements.creativitySlider.value = index;
    elements.creativityHint.textContent = creativityHints[value];
  }
}

function initCreativitySlider() {
  elements.creativitySlider.addEventListener('input', async () => {
    const index = parseInt(elements.creativitySlider.value, 10);
    const value = creativityValues[index];
    currentSettings.creativity = value;
    elements.creativityHint.textContent = creativityHints[value];

    // Auto-save
    await saveVariationSettings();
  });
}

// ============================================
// Settings Management
// ============================================

async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });

    if (response.success) {
      const settings = response.data;

      // API key and cache
      elements.groqApiKey.value = settings.groqApiKey || '';
      elements.enableCache.checked = settings.enableCache !== false;

      // Variation settings
      currentSettings.tone = settings.tone || 'witty';
      currentSettings.length = settings.length || 'brief';
      currentSettings.focus = settings.focus || 'key-facts';
      currentSettings.creativity = settings.creativity || 'balanced';

      // Update UI
      updatePresetButtons('tone', currentSettings.tone);
      updatePresetButtons('length', currentSettings.length);
      updatePresetButtons('focus', currentSettings.focus);
      updateCreativitySlider(currentSettings.creativity);
    }
  } catch (error) {
    console.error('[TLDR Options] Failed to load settings:', error);
  }
}

async function saveVariationSettings() {
  try {
    await chrome.runtime.sendMessage({
      type: 'SAVE_SETTINGS',
      settings: {
        tone: currentSettings.tone,
        length: currentSettings.length,
        focus: currentSettings.focus,
        creativity: currentSettings.creativity,
      },
    });
    // Silent save for variation settings
  } catch (error) {
    console.error('[TLDR Options] Failed to save variation settings:', error);
  }
}

async function saveSettings() {
  const apiKey = elements.groqApiKey.value.trim();

  // Basic validation
  if (apiKey && !apiKey.startsWith('gsk_')) {
    showSaveStatus('API keys start with "gsk_" — please check your key', 'error');
    return;
  }

  const settings = {
    groqApiKey: apiKey || null,
    enableCache: elements.enableCache.checked,
    // Include variation settings
    tone: currentSettings.tone,
    length: currentSettings.length,
    focus: currentSettings.focus,
    creativity: currentSettings.creativity,
  };

  try {
    elements.saveBtn.disabled = true;
    elements.saveBtn.textContent = 'Saving...';

    const response = await chrome.runtime.sendMessage({
      type: 'SAVE_SETTINGS',
      settings,
    });

    if (response.success) {
      if (apiKey) {
        showSaveStatus('🎉 You\'re all set! Go summarize some articles!', 'success');
      } else {
        showSaveStatus('Settings saved', 'success');
      }
      await checkStatus();
    } else {
      throw new Error('Failed to save');
    }
  } catch (error) {
    console.error('[TLDR Options] Failed to save settings:', error);
    showSaveStatus('Failed to save — please try again', 'error');
  } finally {
    elements.saveBtn.disabled = false;
    // Button text updated by checkStatus()
  }
}

function showSaveStatus(message, type) {
  elements.saveStatus.textContent = message;
  elements.saveStatus.className = `save-status ${type}`;

  setTimeout(() => {
    elements.saveStatus.textContent = '';
    elements.saveStatus.className = 'save-status';
  }, 4000);
}

// ============================================
// Cache Management
// ============================================

async function loadCacheStats() {
  try {
    const result = await chrome.storage.local.get('tldr_cache');
    const cache = result.tldr_cache || {};
    const count = Object.keys(cache).length;
    elements.cacheCount.textContent = count;
  } catch (error) {
    console.error('[TLDR Options] Failed to load cache stats:', error);
    elements.cacheCount.textContent = '0';
  }
}

async function clearCache() {
  try {
    elements.clearCacheBtn.disabled = true;
    elements.clearCacheBtn.textContent = 'Clearing...';

    const response = await chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' });

    if (response.success) {
      elements.cacheCount.textContent = '0';
      showSaveStatus('Cache cleared!', 'success');
    }
  } catch (error) {
    console.error('[TLDR Options] Failed to clear cache:', error);
    showSaveStatus('Failed to clear cache', 'error');
  } finally {
    elements.clearCacheBtn.disabled = false;
    elements.clearCacheBtn.textContent = 'Clear';
  }
}

// ============================================
// UI Helpers
// ============================================

function toggleApiKeyVisibility() {
  const isPassword = elements.groqApiKey.type === 'password';
  elements.groqApiKey.type = isPassword ? 'text' : 'password';

  // Update icon
  if (isPassword) {
    elements.eyeIcon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    `;
  } else {
    elements.eyeIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    `;
  }
}

// ============================================
// Event Listeners
// ============================================

elements.saveBtn.addEventListener('click', saveSettings);
elements.toggleKeyVisibility.addEventListener('click', toggleApiKeyVisibility);
elements.clearCacheBtn.addEventListener('click', clearCache);

// Save on Enter key in API key input
elements.groqApiKey.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveSettings();
  }
});

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  initPresetButtons();
  initCreativitySlider();
  await loadSettings();
  await checkStatus();
  await loadCacheStats();
});
