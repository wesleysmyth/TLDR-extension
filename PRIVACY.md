# Privacy Policy for TLDR Extension

**Last Updated:** February 1, 2026

## Overview

TLDR ("the Extension") is a browser extension that summarizes web articles using AI. This privacy policy explains how we handle your data.

## Data Collection

### What We Collect

**Article Content**: When you click the TLDR icon, the extension reads the current page's article content (title and text) to generate a summary.

**User Preferences**: Your settings (tone, length, focus, creativity, API key, cache preference) are stored locally in your browser.

**Cached Summaries**: Generated summaries are cached locally to provide faster loading on repeat visits.

### What We Do NOT Collect

- Personal information (name, email, etc.)
- Browsing history
- Analytics or usage tracking
- Any data from pages you don't explicitly summarize

## Data Usage

### Article Processing

When you request a summary:
1. Article content is extracted from the current page
2. Content is sent to Groq's API for AI processing
3. The summary is returned and displayed
4. Article content is discarded (not stored)

### Local Storage

The following data is stored locally in your browser:
- Your Groq API key (encrypted by Chrome's storage API)
- User preferences (tone, length, focus, creativity settings)
- Cached summaries (can be cleared in settings)

## Third-Party Services

### Groq

We use Groq's API to generate summaries. When you summarize an article:
- Article content is sent to Groq for processing
- Groq's privacy policy applies: https://groq.com/privacy

No other third-party services receive your data.

## Data Sharing

We do not:
- Sell your data
- Share data with advertisers
- Use your data for any purpose other than generating summaries
- Store article content on any external servers

## Data Security

- Your API key is stored using Chrome's secure storage API
- All communication with Groq uses HTTPS encryption
- No data leaves your browser except for AI processing

## Your Rights

You can:
- **View your data**: Check chrome://extensions → TLDR → Details → Site access
- **Delete cached data**: Settings → Clear Cache
- **Remove all data**: Uninstall the extension
- **Control permissions**: Adjust site access in extension settings

## Children's Privacy

This extension is not intended for children under 13. We do not knowingly collect data from children.

## Changes to This Policy

We may update this policy occasionally. Changes will be posted to this page with an updated date.

## Contact

For privacy concerns or questions:
- GitHub Issues: https://github.com/wesleysmyth/TLDR-extension/issues
- Email: [Your contact email]

## Open Source

This extension is open source. You can review the code at:
https://github.com/wesleysmyth/TLDR-extension
