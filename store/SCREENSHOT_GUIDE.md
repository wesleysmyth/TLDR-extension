# Screenshot Guide for Chrome Web Store

## Requirements
- **Dimensions:** 1280x800 or 640x400 pixels (1280x800 recommended)
- **Format:** PNG or JPEG
- **Minimum:** 1 screenshot required, up to 5 allowed
- **No promotional text overlays** (Chrome may reject)

---

## Screenshot 1: Hero Shot (REQUIRED)
**File name:** `screenshot-1-hero.png`

### What to capture:
1. Open a popular news article (NYT, BBC, or Medium work well)
2. Click the TLDR extension icon
3. Wait for a great summary to appear
4. Take screenshot showing:
   - The article headline visible in background
   - The TLDR popup with completed summary
   - Key points visible

### Tips:
- Use a visually appealing article (avoid cluttered pages)
- Make sure the summary is actually good (regenerate if needed)
- Browser should be clean (no extra toolbars, minimal tabs)

### Capture method:
```bash
# On Mac: Cmd + Shift + 4, then Space, click the window
# Or use Chrome DevTools: Cmd + Shift + P → "Capture screenshot"
```

---

## Screenshot 2: Customization
**File name:** `screenshot-2-options.png`

### What to capture:
1. Right-click extension icon → Options (or click gear in popup)
2. Show the Style Settings section with:
   - Tone selector (show "Witty" selected)
   - Length selector (show "Brief" selected)
   - Focus selector (show "Key Facts" selected)

### Tips:
- Expand the browser window so options aren't cramped
- Show the "Connected to Groq" status if visible
- Clean, professional look

---

## Screenshot 3: Before/After
**File name:** `screenshot-3-before-after.png`

### What to capture:
Create a side-by-side comparison:

**Option A (Easy):**
- Screenshot the article, then screenshot with popup open
- Combine in image editor with arrow between them

**Option B (Figma/Canva):**
- Left side: Article with highlighted "8 min read" or length indicator
- Right side: TLDR popup with summary
- Arrow or "→" between them
- Text: "8 minutes → 2 seconds"

---

## Screenshot 4: Multi-site Collage
**File name:** `screenshot-4-sites.png`

### What to capture:
Show TLDR working on multiple sites. Create a 2x2 grid:
- Top-left: Medium article with summary
- Top-right: News site with summary
- Bottom-left: Wikipedia with summary
- Bottom-right: Tech blog with summary

### Tips:
- Use same popup position for consistency
- Keep summaries visible and readable
- Can use Figma/Canva to arrange

---

## Screenshot 5: Easy Setup
**File name:** `screenshot-5-setup.png`

### What to capture:
1. Open Options page
2. Show the API Key section with:
   - "Groq API Key" input field
   - Link to get key visible
   - Status showing "✓ Connected" (green)

### Tips:
- Use a test key or blur the actual key
- Show the success state, not the empty state

---

## Quick Capture Workflow

### 1. Set up browser
```
- Use Chrome with clean profile (no extra extensions visible)
- Set window to 1280x800 or 1440x900
- Use incognito or guest mode for cleaner look
```

### 2. Prepare content
```
- Open 4-5 good articles in tabs
- Ensure API key is configured
- Test summaries to find good ones
```

### 3. Capture
```
Mac: Cmd + Shift + 4, then Space, click window
Win: Win + Shift + S
Or: DevTools → Cmd/Ctrl + Shift + P → "Capture full size screenshot"
```

### 4. Edit (optional but recommended)
```
- Crop to exact dimensions (1280x800)
- Add subtle drop shadow if floating
- Ensure text is readable
```

---

## Tools for Editing

**Free:**
- Figma (figma.com) - Great for layouts
- Canva (canva.com) - Easy templates
- GIMP - Full editor

**Paid:**
- Photoshop
- Sketch
- Affinity Designer

---

## File Checklist

```
store/screenshots/
├── screenshot-1-hero.png      (1280x800)
├── screenshot-2-options.png   (1280x800)
├── screenshot-3-before-after.png (1280x800)
├── screenshot-4-sites.png     (1280x800)
└── screenshot-5-setup.png     (1280x800)
```

---

## Common Rejection Reasons

❌ **Promotional text** - Don't add "Best Extension!" overlays
❌ **Misleading content** - Screenshots must show actual functionality
❌ **Low quality** - Blurry or pixelated images
❌ **Wrong dimensions** - Must be 1280x800 or 640x400
❌ **Offensive content** - Keep article content professional
