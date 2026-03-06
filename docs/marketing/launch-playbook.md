# Marketing Launch Playbook

> A day-by-day schedule to take TLDR from 39 installs to 200+ in one week.
> The key insight: a concentrated burst of activity across multiple channels creates an install velocity spike that signals quality to the CWS algorithm. Drip marketing does not work for extensions.

**Extension:** TLDR - AI Article Summarizer for Web & News
**CWS URL:** https://chromewebstore.google.com/detail/tldr-article-summarizer/hmphaahhfmfdebdjedigdmjjnbcdpjkm
**GitHub:** https://github.com/wesleysmyth/TLDR-extension
**Landing Page:** https://wesleysmyth.github.io/TLDR-extension/

---

## Day 1 -- Foundation

Everything launches from a solid base. Ship all technical improvements before any marketing begins.

### Checklist

- [ ] Push optimized CWS listing (updated name, description, keywords from `store/STORE_LISTING.md`)
- [ ] Push version 1.1.0 with review prompt to CWS
- [ ] Deploy landing page to GitHub Pages (from `site/` directory)
- [ ] Update GitHub README with CWS badges and marketing copy
- [ ] Verify CWS listing is live and searchable
- [ ] Verify landing page loads correctly and CWS install button works
- [ ] Verify review prompt triggers after 5 summaries

### How to Deploy Landing Page to GitHub Pages

```bash
# Option A: Deploy site/ directory from main branch
# In GitHub repo Settings > Pages > Source, select "Deploy from a branch"
# Set branch to "main" and folder to "/site"

# Option B: Use gh-pages branch
git subtree push --prefix site origin gh-pages
```

### How to Upload New Version to CWS

1. Run `npm run build` to create the production build
2. Zip the `dist/` directory
3. Go to https://chrome.google.com/webstore/devconsole
4. Select TLDR extension
5. Click "Package" > "Upload new package"
6. Upload the zip file
7. Update the store listing description from `store/STORE_LISTING.md`
8. Submit for review (usually approved within 1-3 hours)

---

## Day 2 -- Seeding (MOST IMPORTANT DAY)

This is the single most important day of the launch. Reviews are the #1 factor that determines CWS ranking. Five genuine 5-star reviews will break the algorithm threshold and dramatically increase search visibility.

### Checklist

- [ ] Send personal messages to 5-10 friends/family asking them to install and review
- [ ] Submit to extension directories (see `directory-submissions.md`)
- [ ] Post on personal social media accounts
- [ ] Submit to AlternativeTo as alternative to competitors
- [ ] Submit to SaaSHub
- [ ] Submit to Chrome-Stats
- [ ] Submit to CRXcavator
- [ ] Submit to ToolHunt.dev
- [ ] Submit article draft to HackerNoon (for publication later)

### Template Messages to Send to Friends

**Text message / iMessage (casual):**

```
Hey [Name] -- I just launched a Chrome extension and could really use your
help. It summarizes articles in 2 seconds using AI. Would you mind installing
it and leaving a quick review on the Chrome Web Store? It takes about 60
seconds total.

Install link: https://chromewebstore.google.com/detail/tldr-article-summarizer/hmphaahhfmfdebdjedigdmjjnbcdpjkm

To leave a review: click "Write a review" on the store page after installing.
Even just a sentence or two and a 5-star rating would be a huge help.

Thanks!
```

**Email (slightly more formal):**

```
Subject: Quick favor -- 60 seconds to help my Chrome extension launch

Hi [Name],

I just launched a Chrome extension called TLDR that summarizes articles using
AI. I have been working on this for a while and I am at the stage where reviews
make or break the extension's visibility in the Chrome Web Store.

Would you be willing to:
1. Install the extension (takes 10 seconds): [CWS URL]
2. Try it on any article (takes 10 seconds)
3. Leave a short review on the Chrome Web Store (takes 30 seconds)

You will need a free Groq API key to use it -- you can get one in 30 seconds
at https://console.groq.com. Or if you just want to leave a review based on
the listing, that works too.

Even a one-sentence review with 5 stars would help enormously. The Chrome Web
Store algorithm essentially ignores extensions with zero reviews, so every
single one counts right now.

Thanks so much,
Wesley
```

**Slack / Discord (tech-savvy friends):**

```
Hey -- I shipped a Chrome extension that uses Groq/LLaMA to summarize articles
in ~2 seconds. It is open source and completely free.

GitHub: https://github.com/wesleysmyth/TLDR-extension
Chrome Web Store: [CWS URL]

If you have 60 seconds, installing it and dropping a quick review on the CWS
would be a massive help. Zero reviews right now and the algorithm is
essentially hiding it.
```

### What to Tell Reviewers to Write

Do NOT script their reviews word-for-word (Google detects this). Instead, suggest they mention one of these genuine use cases:

- "I use it to quickly scan news articles in the morning"
- "Saves me time when researching topics"
- "Like having a quick summary before deciding if an article is worth reading"
- "The customization options are great -- I can get professional or casual summaries"
- "Finally a summarizer that is actually free and works well"

### How Many People to Ask

- Ask 10-15 people. Expect a 30-50% follow-through rate.
- Target: 5 reviews minimum by end of Day 2.
- Prioritize people who actually use Chrome and read articles online.

---

## Day 3 -- Product Hunt Launch

Product Hunt is the single highest-traffic launch platform. A top-10 daily finish can drive 200-500 visits to your CWS listing.

### Checklist

- [ ] Submit to Product Hunt at 12:01 AM Pacific Time
- [ ] Post maker comment within 60 seconds of launch
- [ ] Share PH link with friends and network (ask for comments, NOT upvotes)
- [ ] Monitor and respond to all comments throughout the day
- [ ] Update social media profiles with "Featured on Product Hunt" if applicable

### Product Hunt Submission Details

**Scheduling:** Product Hunt allows you to schedule launches in advance at https://www.producthunt.com/posts/new. Schedule it for 12:01 AM PT on a Tuesday, Wednesday, or Thursday. This gives you a full 24-hour voting cycle.

**Product name:** TLDR - AI Article Summarizer

**Tagline (60 characters max):**
```
Summarize any article in 2 seconds with free AI
```

**Description:**
```
TLDR is a free Chrome extension that summarizes any article, blog post, or
news story in about 2 seconds using AI.

How it works:
- Click the TLDR icon on any web page
- Get an AI-generated summary instantly
- Customize the tone (witty, professional, casual, academic), length
  (one-liner, brief, detailed), and focus (key facts, opinions, implications)

What makes it different:
- Completely free -- uses Groq's free LLM tier, no subscription needed
- Private -- no tracking, no analytics, no data collection
- Fast -- summaries in ~2 seconds, not 10-15 like most AI tools
- Customizable -- 36 style combinations so the summary matches how you read
- Open source -- full code on GitHub

It works on every site: news (NYT, BBC, CNN), blogs (Medium, Substack),
documentation, Wikipedia, research papers, and anything else with text.

No more copying and pasting articles into ChatGPT. Just click and read.
```

**First comment (the maker story -- post within 60 seconds of launch):**
```
Hey Product Hunt -- I am Wesley, the maker of TLDR.

I built this because I was tired of the copy-paste workflow: see an
interesting article, open ChatGPT, paste the whole thing in, wait for a
response. I did this dozens of times a day and it felt absurd.

So I built a Chrome extension that does it in one click. Click the icon, get a
summary in 2 seconds. Done.

A few things I am proud of:

1. It is genuinely free. Not "free trial" free -- actually free. It runs on
   Groq's free API tier which is fast and generous.

2. It is private. No tracking, no analytics, no data collection. Your reading
   habits are your business.

3. It is customizable. You can set the tone (I personally use "witty" for news
   and "professional" for work articles), the length, and what the summary
   focuses on. That gives you 36 different style combinations.

4. It is open source. The full code is on GitHub if you want to see how it
   works or contribute.

I would love to hear what you think. Happy to answer any questions about the
tech stack, the approach, or anything else.
```

**Topics to select:** Chrome Extensions, Artificial Intelligence, Productivity, Reading

**Gallery images (upload at least 3):**
1. Screenshot: Extension popup showing a completed summary over a news article
2. Screenshot: Options/customization page showing tone, length, and focus selectors
3. Screenshot: Before and after -- long article on left, clean summary on right

### Tips for Product Hunt Success

- The first 2 hours determine your trajectory. Be online and responsive from 12:01 AM PT.
- Share the PH link on social media, but frame it as "I launched today, would love your feedback" not "please upvote."
- Respond to every single comment, even negative ones. Thoughtful responses get upvoted.
- Do NOT ask anyone to upvote. Product Hunt actively detects coordinated voting and will penalize or remove your post.
- If you have access to any newsletters or communities, share the PH link on launch day.

---

## Day 4 -- Reddit and Hacker News

Reddit and HN are high-risk, high-reward. A post that resonates can drive more installs than Product Hunt. A post that feels like spam gets buried and your account flagged.

### Checklist

- [ ] Submit "Show HN" post on Hacker News (morning, 8-9 AM ET)
- [ ] Post to r/chrome (morning, 8-10 AM ET)
- [ ] Post to r/ChatGPT (afternoon, different day if possible)
- [ ] Save r/productivity and r/InternetIsBeautiful for Day 5

### Hacker News "Show HN" Post

**Submit at:** https://news.ycombinator.com/submit

**Title:**
```
Show HN: TLDR -- Free Chrome extension that summarizes any article in 2s with AI
```

**URL:** https://github.com/wesleysmyth/TLDR-extension
(Link to GitHub, not the CWS listing. HN respects open source and will look at the code.)

**Text (optional, appears below the title):**
```
I built a Chrome extension that summarizes articles in ~2 seconds using
Groq's free LLaMA API.

The problem: I kept copying articles into ChatGPT to get summaries. Dozens of
times a day. It felt like a workflow that should not exist.

The solution: Click an icon, get a summary. No copy-paste, no tab switching,
no subscription.

Tech stack:
- Chrome Extension Manifest V3
- Vanilla JS (no frameworks)
- Groq API (free tier, LLaMA 3)
- Mozilla Readability for article extraction
- DOMPurify for sanitization

It has 36 customization combinations (4 tones x 3 lengths x 3 focus areas),
smart caching, and costs nothing to run.

Chrome Web Store: [CWS URL]
GitHub: https://github.com/wesleysmyth/TLDR-extension

Happy to discuss the technical decisions or answer questions.
```

### Reddit Post Templates

**Important rules for all Reddit posts:**
- Use a personal, conversational tone. Never sound like a press release.
- Do not post to multiple subreddits on the same day. Stagger across Day 4-5.
- Engage with every comment, including criticism.
- If a moderator removes your post, do not repost. Message them politely.

---

**r/chrome Post**

*Subreddit:* https://www.reddit.com/r/chrome/
*Post type:* Text post

*Title:*
```
I built a free Chrome extension that summarizes articles in 2 seconds using AI
```

*Body:*
```
I have been working on a Chrome extension called TLDR that summarizes any
article or web page in about 2 seconds.

The idea came from my own workflow -- I was constantly copying articles into
ChatGPT to get quick summaries, and it felt like there had to be a better way.

How it works:
- Click the TLDR icon on any page
- Get an AI summary in ~2 seconds
- Customize the tone, length, and focus of summaries

It is free (uses Groq's free API tier), private (no tracking or data
collection), and open source.

Chrome Web Store: [CWS URL]
GitHub: https://github.com/wesleysmyth/TLDR-extension

I would love feedback from this community -- you all probably use more Chrome
extensions than anyone. What would make this more useful for you?
```

---

**r/ChatGPT Post**

*Subreddit:* https://www.reddit.com/r/ChatGPT/
*Post type:* Text post

*Title:*
```
I built a Chrome extension so you don't have to copy-paste articles into ChatGPT
```

*Body:*
```
Anyone else spend half their day copying articles into ChatGPT to get
summaries?

I got tired of the workflow:
1. Find interesting article
2. Select all, copy
3. Switch to ChatGPT tab
4. Paste, type "summarize this"
5. Wait 10-15 seconds
6. Read summary

So I built a Chrome extension that cuts this down to:
1. Click icon
2. Read summary (2 seconds)

It is called TLDR and it uses Groq's free LLaMA API to generate summaries.
You can customize the tone (witty, professional, casual, academic), length,
and what the summary focuses on.

It is not a replacement for ChatGPT for complex tasks. But for the specific
use case of "I just want to know what this article says" -- it is significantly
faster.

Free, no subscription, no tracking, open source.

Chrome Web Store: [CWS URL]

Curious if others have been doing the same copy-paste workflow or if I was
the only one.
```

---

**r/productivity Post**

*Subreddit:* https://www.reddit.com/r/productivity/
*Post type:* Text post

*Title:*
```
I saved 2+ hours per week by building an article summarizer -- now sharing it for free
```

*Body:*
```
I read 30-50 articles a week for work. Most of them turn out to be not worth
the full read, but I do not know that until I am 5 minutes in.

I built a Chrome extension called TLDR that summarizes any article in about 2
seconds using AI. Now my workflow is:

1. See an article that looks interesting
2. Click the TLDR icon
3. Read the 2-second summary
4. Decide if the full article is worth my time

This alone saves me about 2 hours per week because I stopped spending 5-10
minutes on articles that could have been summarized in a sentence.

You can customize the summaries -- I use "professional" tone with "key facts"
focus for work reading, and "casual" with "opinions" focus for general news.

It is completely free (uses a free AI API), private (no tracking), and open
source.

Chrome Web Store: [CWS URL]

What does your reading workflow look like? Curious how others handle
information overload.
```

---

**r/InternetIsBeautiful Post**

*Subreddit:* https://www.reddit.com/r/InternetIsBeautiful/
*Post type:* Link post (this subreddit only allows link submissions)

*Title:*
```
TLDR - A free tool that summarizes any article in 2 seconds using AI
```

*URL:* https://wesleysmyth.github.io/TLDR-extension/

*Note:* This subreddit requires a link post pointing to a website. Submit the landing page URL. Do not include a text body -- the landing page should speak for itself.

---

## Day 5 -- Content Marketing

Long-form content creates permanent, searchable assets that drive traffic for months.

### Checklist

- [ ] Publish Dev.to article
- [ ] Post Twitter/X launch thread
- [ ] Post LinkedIn announcement
- [ ] Schedule r/productivity post (if not posted on Day 4)
- [ ] Schedule r/InternetIsBeautiful post (if not posted on Day 4)

### Dev.to Article

**Title:** How I Built a Chrome Extension That Summarizes Any Article in 2 Seconds Using AI

**Tags:** #chromeextension #javascript #ai #productivity

**Full article outline:**

```
# How I Built a Chrome Extension That Summarizes Any Article in 2 Seconds Using AI

## The Problem

[2-3 paragraphs about the copy-paste-into-ChatGPT workflow problem. Make it
relatable. Everyone who reads articles online has experienced this.]

- The repetitive workflow: find article, copy, paste into ChatGPT, wait, read
- Doing this dozens of times per day
- There had to be a better way

## The Solution: One Click, Two Seconds

[Brief description of what TLDR does. Include a screenshot or GIF of the
extension in action.]

- Click the icon, get a summary
- 36 customization combinations
- Free, private, open source

## Architecture Overview

[Diagram or description of the system architecture.]

- Chrome Extension Manifest V3 structure
- Content script extracts article text using Mozilla Readability
- Background service worker handles API communication
- Popup renders the summary with DOMPurify sanitization
- Local storage for caching and user preferences

## Extracting Article Content: The Hard Part

[Technical deep-dive into article extraction.]

- Why naive DOM parsing fails (ads, navigation, comments, related articles)
- Mozilla Readability: how it works and why I chose it
- Handling edge cases: paywalled sites, SPAs, infinite scroll articles
- Code snippet showing the content extraction pipeline

## The AI Layer: Why Groq Over OpenAI

[Technical discussion of the AI integration choice.]

- Groq's free tier: generous rate limits at zero cost
- LLaMA 3 vs GPT-4 for summarization: quality comparison
- Speed advantage: ~2 second round-trip vs 10-15 seconds
- Prompt engineering for consistent, high-quality summaries
- How the 36 customization combinations map to different system prompts

## Building the Chrome Extension

[Technical walkthrough of the extension structure.]

- Manifest V3 vs Manifest V2: what changed and why it matters
- Service worker lifecycle gotchas
- Message passing between content script, service worker, and popup
- Storage API patterns for caching and preferences
- Code snippet showing the message passing architecture

## Smart Caching

[How the caching system works.]

- Hash-based cache keys from URL + settings combination
- Cache invalidation strategy
- Storage quota management

## What I Learned

[Lessons and reflections.]

- Chrome extension development has improved dramatically with Manifest V3
- Groq's free tier is genuinely viable for production use
- The hardest part was article extraction, not AI integration
- Users care about speed more than summary quality (2 seconds vs 10 seconds
  is the real differentiator)

## Try It Out

TLDR is free, open source, and available now.

- Chrome Web Store: [CWS URL]
- GitHub: https://github.com/wesleysmyth/TLDR-extension

If you build Chrome extensions or work with LLM APIs, I would love to hear
about your experience. Drop a comment or open an issue on GitHub.
```

---

### Twitter/X Launch Thread

Post between 8-10 AM ET on a Tuesday-Thursday. Pin to your profile.

**Tweet 1 (Hook):**
```
I was copying articles into ChatGPT 30+ times a day to get summaries.

So I built a Chrome extension that does it in one click, in 2 seconds.

It is free. Here is the story. [thread]
```

**Tweet 2 (The problem):**
```
The workflow was absurd:

1. Find interesting article
2. Select all, copy
3. Open ChatGPT tab
4. Paste
5. Type "summarize this"
6. Wait 15 seconds
7. Read summary

Multiply that by 30 articles a day. I was losing hours.
```

**Tweet 3 (The solution):**
```
So I built TLDR.

Click the icon. Get a summary in 2 seconds. Done.

No copy-paste. No tab switching. No subscription. No signup.

[Screenshot of extension popup with a summary]
```

**Tweet 4 (The details):**
```
What makes it different:

- 36 customization combos (tone, length, focus)
- Runs on Groq's free LLaMA API (actually free, not "free trial")
- Private: zero tracking, zero data collection
- Open source: full code on GitHub

[Screenshot of options/customization page]
```

**Tweet 5 (The tech):**
```
Tech stack for the curious:

- Chrome Extension Manifest V3
- Vanilla JS (no React, no frameworks)
- Mozilla Readability for article extraction
- Groq API with LLaMA 3
- DOMPurify for security

Total dependencies: minimal. Total cost to run: $0.
```

**Tweet 6 (The ask):**
```
If you read articles online and want to save time, give it a try:

Chrome Web Store: [CWS URL]
GitHub: https://github.com/wesleysmyth/TLDR-extension

And if you like it, a review on the Chrome Web Store would mean a lot. We
are just getting started and every review helps.
```

**Tweet 7 (Engagement hook):**
```
What is your current workflow for dealing with long articles you need to read?

Genuinely curious -- I have been in the "just summarize everything" camp but
I know some people have strong opinions about this.
```

---

### LinkedIn Post

Post between 7-9 AM ET on a Tuesday-Thursday.

```
I just shipped something I have been building for a while: a Chrome extension
that summarizes any article in 2 seconds using AI.

It is called TLDR, and here is why I built it.

I read 30-50 articles a week. Most of them are not worth the full read, but
the only way to know that is to spend 5-10 minutes reading. That adds up to
hours of wasted time every week.

The existing solutions all had the same problem: they required you to
copy-paste the article into ChatGPT or another AI tool, wait 15 seconds, and
then read the output. It worked, but the friction was high enough that I kept
falling back to just reading the full articles.

So I built an extension that reduces the workflow to one click. Click the
icon, get a summary in 2 seconds. You can customize the tone (professional
for work, casual for news), length, and what the summary focuses on.

A few decisions I am proud of:

1. It is genuinely free -- not a free trial. It runs on Groq's free API tier.
2. It is private -- no tracking, no analytics, no data collection.
3. It is open source -- the full code is on GitHub.

If you read articles as part of your work (and who doesn't), I think you will
find this useful.

Chrome Web Store: [CWS URL]
GitHub: https://github.com/wesleysmyth/TLDR-extension

What tools do you use to manage information overload? I am always looking for
new approaches.

#chromeextension #AI #productivity #buildinpublic #opensource
```

---

## Day 6-7 -- Engagement and Iteration

The launch is not over when the posts go live. The follow-up is what converts interest into lasting installs and reviews.

### Checklist

- [ ] Reply to ALL Product Hunt comments (check every 2-3 hours)
- [ ] Respond to all Reddit comments and questions
- [ ] Respond to Hacker News discussion
- [ ] Address any bugs or feedback immediately (ship a patch if needed)
- [ ] Thank every person who left a CWS review
- [ ] Monitor CWS analytics dashboard for traffic sources and install trends
- [ ] Check which directory submissions have been approved
- [ ] Follow up on any pending submissions

### Monitoring Dashboard

Check these daily during launch week:

**CWS Developer Dashboard:** https://chrome.google.com/webstore/devconsole
- Track daily installs, uninstalls, and active users
- Check search impressions for target keywords
- Monitor review count and average rating
- Look for any policy warnings

**Product Hunt:**
- Track upvotes, comments, and daily ranking
- Respond to any new comments
- Note the final ranking for future reference

**Reddit:**
- Check each post for new comments
- Respond to feedback, questions, and criticism
- Note which subreddits drove the most engagement

**Hacker News:**
- Check for new comments on your Show HN post
- Respond to technical questions promptly

**GitHub:**
- Check for new stars, forks, and issues
- Respond to any new issues within 24 hours

### Handling Negative Feedback

Negative feedback during launch week is inevitable and valuable. Here is how to handle it:

- **Bug reports:** Thank the reporter, acknowledge the issue, and fix it within 24 hours if possible. Post an update when fixed.
- **Feature requests:** Thank them, add to your roadmap, and say when you expect to address it.
- **"This already exists" comments:** Acknowledge the competitors, then explain what makes TLDR different (free, private, customizable, open source).
- **"Why not just use ChatGPT" comments:** Explain the workflow improvement -- one click vs six steps. Emphasize speed (2 seconds vs 15 seconds).
- **Hostile or dismissive comments:** Respond politely and briefly. Do not argue. Others reading the thread will notice your professionalism.

### Post-Launch Review

At the end of Day 7, document your results:

```
Launch Week Results
-------------------
CWS Installs: ___ (was 39)
CWS Reviews: ___ (was 0)
CWS Average Rating: ___
CWS Search Ranking for "article summarizer": ___
CWS Search Ranking for "tldr": ___
CWS Search Ranking for "ai summarizer": ___
Product Hunt: ___ upvotes, ___ rank
Hacker News: ___ points
Reddit total upvotes: ___
GitHub stars: ___
Landing page visits: ___
Top traffic source: ___
Biggest surprise: ___
What to do differently next time: ___
```

---

## Timeline Summary

| Day | Focus | Key Actions |
|-----|-------|-------------|
| 1 | Foundation | Ship CWS update, deploy landing page, update README |
| 2 | Seeding | Ask friends for reviews, submit to directories |
| 3 | Product Hunt | Launch on PH, monitor and engage all day |
| 4 | Reddit + HN | Show HN post, r/chrome, r/ChatGPT |
| 5 | Content | Dev.to article, Twitter thread, LinkedIn, remaining Reddit posts |
| 6-7 | Engagement | Reply to everything, fix bugs, monitor analytics |

---

## Pre-Launch Preparation Checklist

Complete these before Day 1 starts:

- [ ] CWS listing copy finalized in `store/STORE_LISTING.md`
- [ ] Version 1.1.0 built and ready to upload
- [ ] Landing page built and tested locally
- [ ] README rewritten with badges
- [ ] Product Hunt submission drafted and scheduled
- [ ] All Reddit post templates reviewed and personalized
- [ ] Dev.to article draft written (even if rough)
- [ ] Twitter thread drafted
- [ ] LinkedIn post drafted
- [ ] List of 10-15 friends to ask for reviews
- [ ] Screenshots and GIFs captured for all platforms
- [ ] Groq API key setup instructions tested (so you can help friends who get stuck)
