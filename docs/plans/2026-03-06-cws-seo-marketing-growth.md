# CWS SEO & Marketing Growth Engine

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Take TLDR from invisible (0 search results, 39 installs, 0 reviews) to top-10 for "tldr", "article summarizer", and "ai summarizer" on the Chrome Web Store.

**Architecture:** Six parallel workstreams — CWS listing SEO, in-extension review prompt, landing page, GitHub README overhaul, directory submission list, and marketing launch playbook. The review prompt requires a version bump (1.1.0) which also triggers the CWS freshness signal.

**Tech Stack:** HTML/CSS (landing page), Chrome Extension APIs (review prompt), Markdown (README, marketing docs)

---

## Current State Analysis

| Metric | Current | Target |
|---|---|---|
| CWS search visibility | Not in top results | Top 10 for 3 keywords |
| Installs | 39 | 200+ |
| Reviews | 0 | 5+ (breaks algorithm threshold) |
| Weekly active users | 1 | 20+ |
| External traffic sources | 0 | 5+ directories/pages |

**Key files:**
- `manifest.json` — extension name, description, version
- `store/STORE_LISTING.md` — CWS listing copy
- `src/popup/popup.js` — popup logic (review prompt goes here)
- `src/popup/popup.html` — popup UI (review prompt markup)
- `src/popup/popup.css` — popup styles
- `src/lib/storage.js` — storage wrapper (summary count tracking)

---

## Task 1: CWS Listing SEO Optimization

**Files:**
- Modify: `manifest.json:3-5` (name, description)
- Modify: `store/STORE_LISTING.md` (complete rewrite)

**Context:** The Chrome Web Store algorithm weights the extension **name** most heavily for search ranking, followed by the **short description** (132 chars), then the **detailed description**. Our current name "TLDR - Article Summarizer" misses high-value keywords like "AI", "web", "news", and "free". Competitors that rank #1 pack their names with search terms.

### Step 1: Update manifest.json name and description

Update `manifest.json` lines 3-5:

```json
{
  "name": "TLDR - AI Article Summarizer for Web & News",
  "description": "Summarize any article in 2 seconds with AI. Free, fast, private. Customize tone & length. Works on news, blogs, Wikipedia. No ChatGPT needed."
}
```

**Keyword analysis for the new name (44 chars, under 45 limit):**
- "TLDR" — exact match for #1 search term
- "AI" — matches "ai summarizer" queries
- "Article Summarizer" — exact match for #2 search term
- "Web" — matches "web summarizer" queries
- "News" — matches "news summarizer" queries

**Short description keyword hits (132 chars):**
- "summarize", "article", "AI", "free", "fast", "private", "news", "blogs", "ChatGPT"

### Step 2: Rewrite store listing for SEO density

Rewrite `store/STORE_LISTING.md` with the updated copy. Key changes:
- Extension name: "TLDR - AI Article Summarizer for Web & News"
- Front-load high-value keywords in first paragraph (CWS indexes early content more heavily)
- Add "YouTube" mention even if not supported yet (future-proofing keyword claim)
- Mention competitor alternatives naturally: "ChatGPT alternative", "better than copying into AI"
- Add more site name drops for long-tail: "Medium summarizer", "Substack summarizer"
- Expand keyword footer with ALL relevant search terms

### Step 3: Update version to 1.1.0

Update `manifest.json` line 4 and `package.json` line 3:
```json
"version": "1.1.0"
```

This triggers the CWS freshness signal which boosts ranking.

### Step 4: Commit

```bash
git add manifest.json store/STORE_LISTING.md package.json
git commit -m "feat: SEO-optimize CWS listing name, description, and keywords"
```

---

## Task 2: In-Extension Review Prompt

**Files:**
- Modify: `src/lib/storage.js` (add summary count tracking + review dismissed flag)
- Modify: `src/popup/popup.html` (add review banner markup)
- Modify: `src/popup/popup.css` (add review banner styles)
- Modify: `src/popup/popup.js` (add review prompt logic)

**Context:** Zero reviews is the single biggest algorithmic blocker. Extensions with 5+ reviews get a massive ranking boost. We'll add a tasteful, non-intrusive banner that appears after the user's 5th successful summary — at that point they're clearly getting value and most likely to leave a positive review. The banner is dismissable and never shows again.

### Step 1: Add summary count tracking to storage.js

Add to `STORAGE_KEYS` object:
```javascript
SUMMARY_COUNT: 'tldr_summary_count',
REVIEW_DISMISSED: 'tldr_review_dismissed',
```

Add new methods to the `storage` object:
```javascript
async incrementSummaryCount() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SUMMARY_COUNT);
    const count = (result[STORAGE_KEYS.SUMMARY_COUNT] || 0) + 1;
    await chrome.storage.local.set({ [STORAGE_KEYS.SUMMARY_COUNT]: count });
    return count;
  } catch (error) {
    console.error('[TLDR] Failed to increment summary count:', error);
    return 0;
  }
},

async getSummaryCount() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SUMMARY_COUNT);
    return result[STORAGE_KEYS.SUMMARY_COUNT] || 0;
  } catch (error) {
    return 0;
  }
},

async isReviewDismissed() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.REVIEW_DISMISSED);
    return result[STORAGE_KEYS.REVIEW_DISMISSED] === true;
  } catch (error) {
    return false;
  }
},

async dismissReview() {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.REVIEW_DISMISSED]: true });
  } catch (error) {
    console.error('[TLDR] Failed to dismiss review:', error);
  }
},
```

### Step 2: Add INCREMENT_SUMMARY message handler to service-worker.js

Add case to the `handleMessage` switch in `src/background/service-worker.js`:
```javascript
case 'INCREMENT_SUMMARY':
  return handleIncrementSummary();
```

Add handler function:
```javascript
async function handleIncrementSummary() {
  const count = await storage.incrementSummaryCount();
  return { success: true, data: { count } };
}
```

### Step 3: Add review banner HTML to popup.html

Add after the `actionsFooter` element (before closing `</div>` of `.container`), around line 123:

```html
<!-- Review Prompt (shown after 5+ summaries) -->
<div class="review-banner hidden" id="reviewBanner">
  <button class="review-dismiss" id="reviewDismiss" title="Dismiss">&times;</button>
  <p class="review-text">Enjoying TLDR? A quick review helps others find it too.</p>
  <a href="https://chromewebstore.google.com/detail/tldr-article-summarizer/hmphaahhfmfdebdjedigdmjjnbcdpjkm/reviews"
     target="_blank" rel="noopener" class="btn btn--review" id="reviewBtn">
    Leave a Review
  </a>
</div>
```

### Step 4: Add review banner CSS to popup.css

Add at end of popup.css:

```css
/* ============================================
   Review Banner
   ============================================ */

.review-banner {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-top: 1px solid #fbbf24;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.review-text {
  flex: 1;
  font-size: var(--font-size-xs);
  color: #92400e;
  line-height: 1.3;
}

.btn--review {
  flex-shrink: 0;
  background: #f59e0b;
  color: white;
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-sm);
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s ease;
}

.btn--review:hover {
  background: #d97706;
}

.review-dismiss {
  background: none;
  border: none;
  color: #92400e;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.6;
}

.review-dismiss:hover {
  opacity: 1;
}
```

### Step 5: Add review prompt logic to popup.js

Add at the top, after `let currentSummary = null;`:
```javascript
const REVIEW_THRESHOLD = 5;
const CWS_REVIEW_URL = 'https://chromewebstore.google.com/detail/tldr-article-summarizer/hmphaahhfmfdebdjedigdmjjnbcdpjkm/reviews';
```

Add new DOM elements to the `elements` object:
```javascript
reviewBanner: document.getElementById('reviewBanner'),
reviewDismiss: document.getElementById('reviewDismiss'),
reviewBtn: document.getElementById('reviewBtn'),
```

Add review check function:
```javascript
async function checkReviewPrompt() {
  try {
    const [countResult, dismissedResult] = await Promise.all([
      chrome.runtime.sendMessage({ type: 'GET_SUMMARY_COUNT' }),
      chrome.runtime.sendMessage({ type: 'IS_REVIEW_DISMISSED' }),
    ]);

    const count = countResult?.data?.count || 0;
    const dismissed = dismissedResult?.data?.dismissed || false;

    if (count >= REVIEW_THRESHOLD && !dismissed) {
      elements.reviewBanner.classList.remove('hidden');
    }
  } catch (error) {
    // Silently fail - review prompt is non-critical
  }
}
```

Add corresponding message handlers in service-worker.js:
```javascript
case 'GET_SUMMARY_COUNT':
  return handleGetSummaryCount();

case 'IS_REVIEW_DISMISSED':
  return handleIsReviewDismissed();

case 'DISMISS_REVIEW':
  return handleDismissReview();
```

```javascript
async function handleGetSummaryCount() {
  const count = await storage.getSummaryCount();
  return { success: true, data: { count } };
}

async function handleIsReviewDismissed() {
  const dismissed = await storage.isReviewDismissed();
  return { success: true, data: { dismissed } };
}

async function handleDismissReview() {
  await storage.dismissReview();
  return { success: true };
}
```

In the `renderSummary` function in popup.js, after `showState(State.SUCCESS);`, add:
```javascript
// Increment summary count and check for review prompt
chrome.runtime.sendMessage({ type: 'INCREMENT_SUMMARY' }).then(() => {
  checkReviewPrompt();
});
```

Add event listeners for review banner (after existing event listeners):
```javascript
elements.reviewDismiss.addEventListener('click', () => {
  elements.reviewBanner.classList.add('hidden');
  chrome.runtime.sendMessage({ type: 'DISMISS_REVIEW' });
});
```

### Step 6: Commit

```bash
git add src/lib/storage.js src/popup/popup.html src/popup/popup.css src/popup/popup.js src/background/service-worker.js
git commit -m "feat: Add tasteful review prompt after 5th summary"
```

---

## Task 3: Landing Page

**Files:**
- Create: `site/index.html`
- Create: `site/style.css`

**Context:** External traffic is a major CWS ranking signal, and a landing page creates an SEO-indexable destination that can rank on Google for "tldr article summarizer", "free article summarizer chrome extension", etc. It also serves as a shareable link for Product Hunt, Reddit, Twitter, etc.

### Step 1: Create site directory and landing page

Create `site/index.html` — a single-page, fast-loading landing page with:
- Hero section: Name, tagline, CWS install button, hero screenshot
- Features section: Key differentiators (free, fast, private, customizable)
- How it works: 3-step visual
- Social proof: Placeholder for reviews/ratings when they come in
- SEO: Proper meta tags, Open Graph, structured data (SoftwareApplication schema)
- CTA: Chrome Web Store install button (linked to store listing)

Key SEO elements in the HTML:
```html
<title>TLDR - Free AI Article Summarizer Chrome Extension</title>
<meta name="description" content="Summarize any article in 2 seconds with AI. Free Chrome extension with customizable tone, length, and focus. Works on news, blogs, Wikipedia, and more.">
<meta name="keywords" content="article summarizer, AI summarizer, chrome extension, TLDR, summarize articles, free article summary, news summarizer, web summarizer">
```

Open Graph tags for social sharing:
```html
<meta property="og:title" content="TLDR - Summarize Any Article in 2 Seconds">
<meta property="og:description" content="Free AI-powered Chrome extension that summarizes articles, news, and blog posts instantly.">
<meta property="og:type" content="website">
```

### Step 2: Create landing page CSS

Create `site/style.css` — minimal, fast-loading styles. No frameworks.
- Mobile-responsive
- Dark/light mode support
- Optimized for Core Web Vitals (no layout shift, fast LCP)

### Step 3: Commit

```bash
git add site/
git commit -m "feat: Add SEO-optimized landing page"
```

---

## Task 4: GitHub README Overhaul

**Files:**
- Modify: `README.md` (complete rewrite if exists, create if not)

**Context:** GitHub is a high-authority domain. A good README with CWS badges drives developer traffic and creates backlinks that boost both Google and CWS ranking. Developers who find it on GitHub are also more likely to leave reviews.

### Step 1: Create/rewrite README.md

Structure:
```markdown
# TLDR - AI Article Summarizer

[Chrome Web Store badge linking to install]
[GitHub stars badge]
[License badge]

> Summarize any article in 2 seconds. Free, fast, private.

[Hero screenshot/GIF]

## Features
- One-click AI summaries
- 36 customization combinations
- Works on news, blogs, docs, Wikipedia
- Free forever (uses Groq's free tier)
- Privacy-first: no tracking, no data collection

## Install
[Large CWS button/badge]

## How It Works
1. Click TLDR icon
2. Get your summary
3. That's it

## Customization
[Screenshot of options]

## Privacy
[Brief privacy statement]

## Development
[Brief dev setup for contributors]

## License
MIT
```

Key elements:
- CWS badge: `[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/hmphaahhfmfdebdjedigdmjjnbcdpjkm)](https://chromewebstore.google.com/detail/hmphaahhfmfdebdjedigdmjjnbcdpjkm)`
- Users badge: `![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/hmphaahhfmfdebdjedigdmjjnbcdpjkm)`
- Rating badge: `![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/hmphaahhfmfdebdjedigdmjjnbcdpjkm)`

### Step 2: Commit

```bash
git add README.md
git commit -m "docs: Overhaul README with CWS badges and marketing copy"
```

---

## Task 5: Extension Directory Submissions

**Files:**
- Create: `docs/marketing/directory-submissions.md`

**Context:** Extension directories create backlinks and drive discovery traffic. Each submission takes ~5 minutes and provides lasting value.

### Step 1: Create directory submission checklist

Create `docs/marketing/directory-submissions.md` with submission details for:

1. **Chrome Extension directories:**
   - crxcavator.io (security analysis, free)
   - extensionranking.com (listing)
   - chrome-stats.com (submit for tracking)

2. **Product directories:**
   - producthunt.com (launch post)
   - alternativeto.com (list as alternative to Eightify, TLDR competitor)
   - toolhunt.dev (free listing)
   - saashub.com (free listing)

3. **Content aggregators:**
   - dev.to (write article about building it)
   - hackernoon.com (technical article)
   - reddit.com/r/chrome, /r/ChatGPT, /r/productivity (launch posts)
   - Hacker News "Show HN" post

Each entry includes: URL, submission steps, optimal posting time, post template.

### Step 2: Commit

```bash
git add docs/marketing/
git commit -m "docs: Add extension directory submission checklist"
```

---

## Task 6: Marketing Launch Playbook

**Files:**
- Create: `docs/marketing/launch-playbook.md`

**Context:** A coordinated launch across multiple channels in one week creates an install velocity spike that signals to the CWS algorithm. Sustained drip doesn't work nearly as well as a concentrated burst.

### Step 1: Create launch playbook

Create `docs/marketing/launch-playbook.md` covering:

**Day 1 — Foundation:**
- Push optimized CWS listing (Task 1)
- Push version 1.1.0 with review prompt (Task 2)
- Deploy landing page (Task 3)
- Update GitHub README (Task 4)

**Day 2 — Seeding:**
- Ask 5-10 friends/family to install + review (the most important step)
- Submit to extension directories (Task 5)
- Post on personal social media

**Day 3 — Product Hunt:**
- Submit to Product Hunt
- Template for PH description and first comment
- Optimal posting time (12:01 AM PT Tuesday-Thursday)

**Day 4 — Reddit/HN:**
- "Show HN" post with compelling description
- Reddit posts in r/chrome, r/productivity, r/ChatGPT, r/InternetIsBeautiful
- Post templates for each community (don't spam, provide value)

**Day 5 — Content:**
- Dev.to article: "How I Built an AI Article Summarizer Chrome Extension"
- Twitter/X thread showing before/after screenshots
- LinkedIn post for professional network

**Day 6-7 — Respond & Iterate:**
- Reply to all Product Hunt comments
- Respond to any Reddit discussion
- Address any feedback/bugs immediately
- Monitor CWS analytics for impact

Include templates for:
- Product Hunt tagline and description
- Reddit post titles and bodies
- HN "Show HN" post
- Twitter/X thread (5 tweets)
- Dev.to article outline

### Step 2: Commit

```bash
git add docs/marketing/launch-playbook.md
git commit -m "docs: Add week-long marketing launch playbook"
```

---

## Execution Order

Tasks 1-2 modify extension code and should be done sequentially.
Tasks 3-6 are documentation/content and can be done in parallel.

```
Task 1 (CWS Listing) → Task 2 (Review Prompt) → Build & Package
                                                       ↓
                                              Task 3 (Landing Page)    ─┐
                                              Task 4 (README)          ─┤ parallel
                                              Task 5 (Directories)     ─┤
                                              Task 6 (Launch Playbook) ─┘
                                                       ↓
                                              Final commit & push
```

## Post-Implementation: Manual Steps (User Required)

After all code/docs are committed:

1. **Build the extension**: `npm run build`
2. **Upload to CWS**: Developer Dashboard → Package → Upload new version
3. **Update CWS listing**: Copy new description from `store/STORE_LISTING.md` into dashboard
4. **Deploy landing page**: Push `site/` to GitHub Pages or Vercel
5. **Execute launch playbook**: Follow day-by-day schedule in `docs/marketing/launch-playbook.md`
