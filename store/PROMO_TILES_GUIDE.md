# Promotional Tiles Design Guide

## Overview

Chrome Web Store promotional tiles appear in:
- Search results (small tile)
- Featured sections (large tile)
- Homepage banners (marquee)

All images should be **PNG** format with clean, modern design.

---

## Color Palette (Suggested)

```
Primary:     #6366F1 (Indigo)
Secondary:   #8B5CF6 (Purple)
Accent:      #06B6D4 (Cyan)
Background:  #0F172A (Dark slate) or #FFFFFF (White)
Text:        #FFFFFF (on dark) or #1E293B (on light)
```

Or use your brand colors if you have them.

---

## Small Tile (440x280)

**Required:** Yes (appears in search results)

### Design Spec:
```
┌─────────────────────────────────────────┐
│                                         │
│              [TLDR LOGO]                │
│                                         │
│       "AI Summaries in Seconds"         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### Elements:
- **Logo:** Centered, ~100px height
- **Tagline:** Below logo, ~24px font
- **Background:** Gradient from #6366F1 to #8B5CF6

### Figma/Canva Setup:
1. Create 440x280 canvas
2. Add gradient background (diagonal, top-left to bottom-right)
3. Place logo centered
4. Add tagline in white, semibold font
5. Export as PNG

---

## Large Tile (920x680)

**Required:** Optional but recommended for featuring

### Design Spec:
```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│    [TLDR LOGO]              ┌─────────────────────────────┐   │
│                             │                             │   │
│    "Summarize Any           │   [Screenshot of popup      │   │
│     Article in              │    showing summary]         │   │
│     2 Seconds"              │                             │   │
│                             └─────────────────────────────┘   │
│    ───────────────────                                        │
│    Free • Fast • Private                                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Elements:
- **Left side (40%):** Logo + headline + feature badges
- **Right side (60%):** Screenshot mockup with drop shadow
- **Background:** Subtle gradient or solid dark

### Tips:
- Use a real screenshot in a browser frame mockup
- Keep text large and readable at thumbnail size
- Feature badges should be in pill/chip style

---

## Marquee (1400x560)

**Required:** Optional (for homepage featuring - rare)

### Design Spec:
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│   "Stop Reading.                          ┌─────────────────────────────────┐   │
│    Start Knowing."                        │                                 │   │
│                                           │   [Large screenshot mockup      │   │
│   AI article summaries in 2 seconds       │    of extension in action]      │   │
│                                           │                                 │   │
│   [Free] [Private] [Customizable]         └─────────────────────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Elements:
- **Left (45%):** Bold headline, subtext, feature badges
- **Right (55%):** Large screenshot in browser frame
- **Background:** Dark gradient for contrast

---

## Quick Creation with Canva

### 1. Go to canva.com
### 2. Create custom dimensions for each size
### 3. Use these templates as starting points:
   - Search "app promotional" or "software promo"
   - Customize colors and content

### 4. Export as PNG (high quality)

---

## Quick Creation with Figma

### 1. Create new file
### 2. Add frames:
   ```
   Frame 1: 440x280 (small)
   Frame 2: 920x680 (large)
   Frame 3: 1400x560 (marquee)
   ```
### 3. Design each following specs above
### 4. Export: Select frame → Export → PNG 1x

---

## Logo Assets

If you need to create a logo, here are specs:

**Icon (for extension):**
- Already exists: `icons/icon-128.png`

**Logo with text:**
- Text: "TLDR" in bold sans-serif (Inter, Poppins, or SF Pro)
- Optional: Small subtitle "Article Summarizer"

---

## File Checklist

```
store/promo/
├── small-tile-440x280.png
├── large-tile-920x680.png
└── marquee-1400x560.png
```

---

## Design Principles

1. **Readable at small sizes** - Test at 50% zoom
2. **Consistent branding** - Same colors, fonts across all
3. **Focus on benefit** - "2 seconds" is the hero message
4. **Show the product** - Include actual screenshots
5. **Clean & modern** - Avoid clutter, use whitespace

---

## Examples of Great Promo Tiles

Study these extensions for inspiration:
- Grammarly
- Momentum
- Notion Web Clipper
- Pocket
- Evernote Web Clipper

Note how they:
- Lead with benefit, not features
- Use high-contrast colors
- Show product screenshots
- Keep text minimal
