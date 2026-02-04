# TLDR - One-Click Article Summaries

<p align="center">
  <img src="assets/icons/icon-128.png" alt="TLDR Logo" width="128" height="128">
</p>

<p align="center">
  <strong>Get the gist of any article in seconds.</strong><br>
  A Chrome extension that uses AI to summarize articles with customizable tone, length, and focus.
</p>

<p align="center">
  <a href="https://chrome.google.com/webstore/detail/hmphaahhfmfdebdjedigdmjjnbcdpjkm">
    <img src="https://img.shields.io/chrome-web-store/v/hmphaahhfmfdebdjedigdmjjnbcdpjkm?label=Chrome%20Web%20Store&logo=googlechrome&logoColor=white&color=4285F4" alt="Chrome Web Store">
  </a>
  <a href="https://github.com/wesleysmyth/TLDR-extension/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/wesleysmyth/TLDR-extension?color=blue" alt="License">
  </a>
  <a href="https://github.com/wesleysmyth/TLDR-extension/stargazers">
    <img src="https://img.shields.io/github/stars/wesleysmyth/TLDR-extension?style=social" alt="Stars">
  </a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#customization">Customization</a> •
  <a href="#development">Development</a>
</p>

---

## ✨ Features

- **One-Click Summaries** - Click the extension icon on any article to get an instant AI-powered summary
- **Regenerate** - Don't like the summary? Hit regenerate for a fresh take
- **Customizable Style** - Adjust tone, length, focus, and creativity to match your preferences
- **Smart Caching** - Previously summarized articles load instantly
- **Copy & Share** - One-click copy of summary with formatting
- **Privacy First** - Your data stays local; articles are sent only to the AI provider

### 🎭 Tone Presets

| Tone | Description | Example |
|------|-------------|---------|
| **Witty** | Clever and engaging with wordplay | *"Scientists confirmed what cat owners always suspected: your pet is definitely ignoring you on purpose."* |
| **Professional** | Clear and authoritative | *"New research demonstrates a 47% improvement in battery efficiency using solid-state technology."* |
| **Casual** | Friendly and conversational | *"So basically, they figured out how to make batteries last way longer - pretty cool stuff."* |
| **Academic** | Scholarly and nuanced | *"The study presents compelling evidence for neuroplasticity in adult subjects, challenging prior assumptions."* |

### 📏 Length Presets

| Length | Words | Best For |
|--------|-------|----------|
| **One-liner** | 18-22 | Quick glance, social sharing |
| **Brief** | 30-40 | Daily reading, email digests |
| **Detailed** | 60-80 | Deep understanding, research |

### 🎯 Focus Presets

| Focus | Description |
|-------|-------------|
| **Key Facts** | Main factual takeaways - the headline numbers and claims |
| **Opinions** | Author's perspective and arguments - what stance are they taking? |
| **Implications** | Why it matters - what does this mean for you? |

---

## 📦 Installation

### From Chrome Web Store

<a href="https://chrome.google.com/webstore/detail/hmphaahhfmfdebdjedigdmjjnbcdpjkm">
  <img src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/iNEddTyWiMfLSwFD6qGq.png" alt="Available in the Chrome Web Store" width="248">
</a>

1. Visit the [Chrome Web Store listing](https://chrome.google.com/webstore/detail/hmphaahhfmfdebdjedigdmjjnbcdpjkm)
2. Click "Add to Chrome"
3. Follow the setup wizard to get your free API key

### Manual Installation (Developer Mode)

1. Clone the repository:
   ```bash
   git clone https://github.com/wesleysmyth/TLDR-extension.git
   cd TLDR-extension
   ```

2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

3. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist/` folder

4. Get your API key:
   - Visit [console.groq.com/keys](https://console.groq.com/keys)
   - Create a free account
   - Generate an API key (name: `TLDR`, no expiration)
   - Click the TLDR extension icon → Settings → Paste your key

---

## 🚀 Usage

### Basic Usage

1. Navigate to any article (news, blog post, documentation)
2. Click the TLDR extension icon in your toolbar
3. Wait ~2 seconds for your summary
4. Use **Copy** to share or **Regenerate** for a different summary

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Click icon | Summarize current page |
| ⌘/Ctrl + Click | Open settings |

### Supported Sites

TLDR works on most article-based content:
- ✅ News sites (NYT, BBC, The Guardian, etc.)
- ✅ Blog platforms (Medium, Substack, WordPress)
- ✅ Documentation (MDN, docs sites)
- ✅ Wikipedia
- ❌ Social media feeds
- ❌ Video pages (YouTube)
- ❌ Interactive apps

---

## ⚙️ Customization

Access settings by clicking the ⚙️ icon in the popup or right-clicking the extension → Options.

### Variation Settings

| Setting | Options | Default |
|---------|---------|---------|
| Tone | Witty, Professional, Casual, Academic | Witty |
| Length | One-liner, Brief, Detailed | Brief |
| Focus | Key Facts, Opinions, Implications | Key Facts |
| Creativity | Consistent, Balanced, Creative | Balanced |

### Advanced Settings

- **Creativity Slider** - Controls how varied regenerations are
  - *Consistent*: Similar outputs each time
  - *Balanced*: Moderate variety
  - *Creative*: Diverse, unexpected phrasings

- **Caching** - Enable/disable saving summaries for faster loading
- **Clear Cache** - Remove all saved summaries

---

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Development build (with watch)
npm run dev

# Production build
npm run build

# Run tests
npm test
```

### Project Structure

```
tldr-extension/
├── src/
│   ├── background/       # Service worker
│   ├── content/          # Content script (article extraction)
│   ├── popup/            # Extension popup UI
│   ├── options/          # Settings page
│   └── lib/              # Shared utilities
│       ├── ai/           # AI provider integrations
│       ├── prompts.js    # Prompt templates (tuned from testing)
│       └── storage.js    # Chrome storage helpers
├── tests/
│   ├── variation-test-v2.js    # Comprehensive variation testing
│   ├── variation-results.json  # Test results data
│   └── VARIATION-TEST-REPORT.md
├── dist/                 # Built extension (load this in Chrome)
└── assets/               # Icons and images
```

### Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Popup     │────▶│ Service Worker  │────▶│  Groq API    │
│   (UI)      │◀────│ (Background)    │◀────│  (LLM)       │
└─────────────┘     └─────────────────┘     └──────────────┘
       │                    │
       │                    ▼
       │            ┌─────────────────┐
       │            │ Chrome Storage  │
       │            │ (Cache/Settings)│
       │            └─────────────────┘
       │
       ▼
┌─────────────────┐
│ Content Script  │
│ (Readability)   │
└─────────────────┘
```

### Testing

The variation system was tested with 34 articles across 283 API calls:

- **Temperature sweep**: 5 temperatures × 10 articles
- **Tone comparison**: 4 tones × 10 articles
- **Length comparison**: 3 lengths × 10 articles
- **Regeneration variation**: 34 articles × 5 regenerations

Results: 81.3% diversity score, 0% bad pattern rate. See `tests/VARIATION-TEST-REPORT.md` for details.

---

## 🔒 Privacy

- **No tracking**: We don't collect any analytics or usage data
- **No storage**: Articles are processed and discarded; only summaries are cached locally
- **Your API key**: Stored only in your browser's local storage
- **AI Provider**: Articles are sent to Groq for processing (see [Groq's privacy policy](https://groq.com/privacy))

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Mozilla Readability](https://github.com/mozilla/readability) - Article extraction
- [Groq](https://groq.com) - Lightning-fast LLM inference
- [Vite](https://vitejs.dev) - Build tooling

---

<p align="center">
  Made with ❤️ for people who read too much
</p>
