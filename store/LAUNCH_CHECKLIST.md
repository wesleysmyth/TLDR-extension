# Pre-Launch Checklist

## Before You Begin

### 1. Create GitHub Repository
```bash
# If not already done, push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/tldr-extension.git
git push -u origin main
```

### 2. Update Placeholders
Replace `[your-username]` in these files with your actual GitHub username:
- `store/STORE_LISTING.md` (2 places)
- `PRIVACY.md` (if applicable)

---

## Chrome Web Store Developer Account

### Create Account (if needed)
1. Go to: https://chrome.google.com/webstore/devconsole
2. Pay one-time $5 registration fee
3. Verify your email

---

## Upload Checklist

### Step 1: Prepare the ZIP
```bash
cd /Users/wesleysmith/Desktop/Ext/harness/tldr-extension
zip -r tldr-extension.zip dist/
```

Or manually:
1. Navigate to the `dist/` folder
2. Select all contents
3. Right-click → Compress

### Step 2: Create New Item
1. Go to: https://chrome.google.com/webstore/devconsole
2. Click "New Item"
3. Upload `tldr-extension.zip`

### Step 3: Store Listing
Copy from `store/STORE_LISTING.md`:

| Field | Source |
|-------|--------|
| Name | "TLDR - AI Article Summarizer" |
| Summary | Short Description section |
| Description | Detailed Description section |
| Category | Productivity |
| Language | English (United States) |

### Step 4: Upload Screenshots
- Upload 1-5 screenshots (see SCREENSHOT_GUIDE.md)
- Add captions for each

### Step 5: Upload Promotional Images
- Small tile (440x280) - Required
- Large tile (920x680) - Optional
- Marquee (1400x560) - Optional

### Step 6: Privacy Tab

**Privacy Policy URL:**
```
https://github.com/YOUR_USERNAME/tldr-extension/blob/main/PRIVACY.md
```

**Single Purpose:**
> This extension summarizes web articles using AI, allowing users to quickly understand article content without reading the full text.

**Permission Justifications:**
Copy from store/STORE_LISTING.md "Permission Justifications" section

**Data Usage:**
- Check "Article title and text content"
- Purpose: "AI summarization processing"
- Leave all other boxes unchecked

### Step 7: Distribution
- Visibility: Public
- Regions: All regions (or select specific ones)

---

## Pre-Submission Verification

### Extension Package
- [ ] `manifest.json` version is correct (1.0.0)
- [ ] All icons present (16, 32, 48, 128)
- [ ] No console errors when loaded unpacked
- [ ] Extension works on test articles

### Store Listing
- [ ] Name ≤ 45 characters
- [ ] Summary ≤ 132 characters
- [ ] No spelling/grammar errors
- [ ] All placeholder usernames replaced

### Screenshots
- [ ] At least 1 screenshot uploaded
- [ ] Dimensions: 1280x800 or 640x400
- [ ] No promotional text overlays
- [ ] Shows actual extension functionality

### Privacy
- [ ] Privacy policy URL accessible
- [ ] All permissions justified
- [ ] Data usage accurately described

---

## Submit for Review

1. Click "Submit for Review"
2. Review takes 1-3 business days typically
3. You'll get email notification

### Common Rejection Reasons & Fixes

| Reason | Fix |
|--------|-----|
| "Broad host permissions" | Explain in justification that user initiates |
| "Missing privacy policy" | Ensure URL is accessible |
| "Promotional screenshots" | Remove text overlays |
| "Functionality not clear" | Better description/screenshots |

---

## Post-Launch

### Monitor
- Check reviews daily for first week
- Respond to feedback quickly
- Monitor crash reports in developer console

### Iterate
- Address negative feedback in updates
- Add requested features
- Keep changelog updated

---

## Quick Commands

```bash
# Build for production
npm run build

# Create upload ZIP
cd dist && zip -r ../tldr-extension.zip . && cd ..

# Check manifest
cat dist/manifest.json | jq '.version, .name'
```

---

## Support Links

- Chrome Developer Docs: https://developer.chrome.com/docs/webstore
- Publishing Guide: https://developer.chrome.com/docs/webstore/publish
- Review FAQ: https://developer.chrome.com/docs/webstore/review-process
