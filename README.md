<div align="center">

# TLDR - AI Article Summarizer

**Summarize any article in 2 seconds. Free, fast, private.**

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/hmphaahhfmfdebdjedigdmjjnbcdpjkm?label=Chrome%20Web%20Store&logo=googlechrome&logoColor=white&color=4285F4)](https://chromewebstore.google.com/detail/hmphaahhfmfdebdjedigdmjjnbcdpjkm)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/hmphaahhfmfdebdjedigdmjjnbcdpjkm?label=Users&logo=googlechrome&logoColor=white&color=34A853)](https://chromewebstore.google.com/detail/hmphaahhfmfdebdjedigdmjjnbcdpjkm)
[![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/hmphaahhfmfdebdjedigdmjjnbcdpjkm?label=Rating&logo=googlechrome&logoColor=white&color=FBBC04)](https://chromewebstore.google.com/detail/hmphaahhfmfdebdjedigdmjjnbcdpjkm)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[**Install from Chrome Web Store**](https://chromewebstore.google.com/detail/hmphaahhfmfdebdjedigdmjjnbcdpjkm)

</div>

---

## Features

- **Instant AI Summaries** — Get the gist of any article in ~2 seconds
- **36 Style Combinations** — Customize tone (witty, professional, casual, academic), length (one-liner, brief, detailed), and focus (key facts, opinions, implications)
- **Works Everywhere** — News sites, blogs, docs, Wikipedia, and more
- **Free Forever** — Powered by Groq's free LLM tier
- **Privacy First** — No tracking, no analytics, no data collection. Your API key stays in your browser.
- **Smart Caching** — Revisit articles load instantly from local cache
- **One-Click Copy** — Share summaries with a single click

## How It Works

1. Click the TLDR icon on any article
2. Get your AI-powered summary instantly
3. Copy, regenerate, or customize the style

## Getting Started

1. **Install** from the [Chrome Web Store](https://chromewebstore.google.com/detail/hmphaahhfmfdebdjedigdmjjnbcdpjkm)
2. **Get a free API key** at [console.groq.com](https://console.groq.com/keys)
3. **Paste your key** in the extension settings
4. **Click TLDR** on any article!

## Customization

| Setting | Options | Description |
|---------|---------|-------------|
| **Tone** | Witty, Professional, Casual, Academic | How the summary reads |
| **Length** | One-liner (~20 words), Brief (~35 words), Detailed (~70 words) | How much detail |
| **Focus** | Key Facts, Opinions, Implications | What to emphasize |
| **Creativity** | Consistent, Balanced, Creative | Variation between regenerations |

## Privacy

- No tracking, no analytics, no data collection
- API key stored locally in your browser only
- Article text sent to Groq for processing, then immediately discarded
- Summaries cached locally — never on external servers
- [Full Privacy Policy](https://github.com/wesleysmyth/TLDR-extension/blob/main/PRIVACY.md)

## Development

```bash
# Install dependencies
npm install

# Development build (watch mode)
npm run dev

# Production build
npm run build
```

## Tech Stack

- **Chrome Extension Manifest V3**
- **Groq API** (Llama 3) for AI summarization
- **Mozilla Readability** for article extraction
- **DOMPurify** for sanitization
- **Vite** for building

## Contributing

Issues and PRs welcome! See [Issues](https://github.com/wesleysmyth/TLDR-extension/issues).

## License

MIT
