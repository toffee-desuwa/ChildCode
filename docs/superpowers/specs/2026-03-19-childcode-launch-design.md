# ChildCode Launch Design — "Scratch for the AI Era"

> Date: 2026-03-19
> Goal: Polish ChildCode to "screenshot-level" quality, deploy online demo, prepare GitHub presence and content distribution to target GitHub Trending.

---

## 1. Positioning & Brand

**Tagline:**
> ChildCode — Scratch for the AI Era
> Block-based AI interaction for kids. No prompts. No code. Just drag, create, and learn.

**Language strategy:**
- All external-facing content (README, demo, GitHub) in English by default
- Maintain README-CN.md for Chinese audience
- App UI defaults to English, supports Chinese toggle

**Font:**
- English: Inter (via Google Fonts CDN, lightweight)
- Chinese (when toggled): MiSans subset (Xiaomi open-source, free for commercial use)
- Fallback: system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`)
- Reason: Full MiSans CJK is 5-20MB, would kill first-load performance. English visitors (GitHub Trending audience) get Inter. Chinese toggle lazy-loads MiSans subset.

**Logo:** Minimal icon combining block shape + AI glow. Generate with AI later — not first priority.

**Core philosophy (depth layer, NOT the hook):**
- L1: Prompt Intuition (8-12) — "What I say matters"
- L2: Skill Thinking (12-16) — "I can save and reuse patterns"
- L3: Harness Thinking (14+) — "I can break goals into steps"

"Scratch for AI" is the door. Prompt → Skill → Harness is the room.

---

## 2. UI Redesign

**Scope:** Visual layer + i18n. No changes to routing, business logic, hooks, providers, or storage. This is a significant refactor touching every component file (22 source files) — primarily className rewrites and copy string extraction.

**Tech:** Tailwind CSS for all custom components. **Exception:** Blockly's own DOM/SVG elements are NOT styled with Tailwind (Blockly injects its own DOM that we don't control). Blockly is styled via its built-in theme API only. Tailwind applies to everything outside the Blockly container.

### 2.1 Hero Page (Most Critical)

Current: White background, Chinese text, gray buttons.

Target:
- Dark/gradient background with tech feel (reference: Vercel, Linear landing pages)
- Centered headline: "Scratch for the AI Era"
- Auto-playing animation: blocks drag in → image generates → block changes → image changes
- Prominent "Try it now" CTA button
- Clean, modern, 3-second wow factor

### 2.2 Workspace (Core Experience)

Current: Gray Blockly + dashed outline boxes.

Target:
- Blockly dark theme (Blockly supports theme configuration)
- Color-coded block categories: Subject=blue, Action=green, Scene=orange, Style=purple
- Right-side image display in card layout with rounded corners + shadow
- "Generate" button as a prominent gradient button
- A/B comparison layout: side-by-side with arrow and diff highlight ("You changed THIS block → image changed THAT way")

### 2.3 Design Language

- Color: Dark mode primary (developer-friendly, looks great in screenshots), light mode toggle
- Font: Inter (English) / MiSans subset (Chinese), system font fallback
- Rounded cards + subtle shadows + gradient accents
- Simple page transition animations (fade)

### 2.4 Hero Animation Implementation

The hero auto-playing showcase is the highest-impact visual element. Implementation:
- **Tech:** Pure CSS animations + React state transitions. No heavy libraries (no GSAP, no Lottie).
- **Mechanism:** Pre-rendered image pairs stored as static assets. A React component cycles through sets on a timer (5s per set). Each cycle: block labels animate in (CSS slide) → image A fades in → one block label highlights/swaps (CSS color pulse) → image B crossfades over image A.
- **Fallback:** If images fail to load, show static screenshots instead of broken animation.

### 2.5 Mobile Responsiveness

- Hero page carousel: fully responsive, works on mobile (this is what Xiaohongshu visitors see)
- Workspace: show "Best experienced on desktop" banner on screens < 768px, with the carousel still visible below
- Blockly workspace is NOT rendered on mobile (Blockly's drag-drop is unusable on small screens)
- Config/History/Templates pages: basic responsive layout with stacked cards

### 2.6 Internationalization

This is a significant task — every user-facing string in every component is currently Chinese.

- All UI copy defaults to English
- Create `src/i18n/en.js` and `src/i18n/zh.js` with all UI strings
- Components import strings from i18n module, language toggle stored in localStorage
- **Blockly block labels also switch to English** (whitelist.js label field needs English values as default, Chinese as alternate)
- Key English copy for hero page: "Scratch for the AI Era" / "Drag blocks. Generate art. Change one block. See what changes." / "Try it now" / "Parent Setup"

### 2.7 What Does NOT Change

- Route structure (6 pages — hero page replaces current WelcomePage, not a new route)
- Business logic (useGeneration hook, provider pattern, storage API)
- Blockly core interactions (drag-drop, JSON export)
- Data model (JSON truth layer → prompt derivation)

---

## 3. Demo Strategy

### 3.1 Pre-rendered Showcase Assets

Prepare 3-4 comparison sets using real API generation (done manually before launch):

| Set | Blocks A | Blocks B (one change) | Learning |
|-----|----------|----------------------|----------|
| 1 | Cat + Running + Forest + Watercolor | Cat + **Sleeping** + Forest + Watercolor | "Action controls the scene" |
| 2 | Dragon + Flying + Sky + Pixel Art | Dragon + Flying + **Ocean** + Pixel Art | "Scene controls the background" |
| 3 | Robot + Dancing + City + Cartoon | Robot + Dancing + City + **Oil Painting** | "Style controls the texture" |

Each set demonstrates: change ONE block → see precisely HOW the AI output changes. This is visual proof of the Prompt Intuition concept.

### 3.2 Two-Layer Demo Experience

**Layer 1 (Zero friction):** Hero page auto-carousel of pre-rendered comparisons. Animated sequence: blocks slide in → image fades out → block changes (highlight flash) → new image fades in. Visitor watches 10 seconds, understands the product.

**Layer 2 (Hands-on):** Click "Try it now" → workspace with real Blockly drag-drop. "Generate" returns from pre-rendered image library (enhanced mock mode).

**Mock image matching system specification:**
- Store 15-20 pre-rendered images as static assets in `public/demo-images/`
- Each image mapped to a block combination in `src/demo/imageMap.json`: `{ "cat-running-forest-watercolor": "demo-001.png", ... }`
- Matching logic: exact key lookup from current block JSON. Key = sorted block values joined by `-`
- **Fallback when no match:** Show a friendly placeholder card: "This combination hasn't been pre-rendered yet! In the full version with an API key, you'd see a unique AI-generated image here." + show the closest available match as a suggestion
- Images are bundled in the repo (each ~200KB JPEG, total ~3-4MB for 20 images — acceptable for a demo)

### 3.3 Deployment

- **Vercel** (recommended over GitHub Pages — natively handles SPA routing, auto-deploy from GitHub, free tier, HTTPS included)
- GitHub Pages is a fallback option but requires a 404.html redirect hack for react-router

### 3.4 Open Graph Meta Tags

Critical for social media sharing (Twitter cards, Xiaohongshu link previews):
- `og:title`: "ChildCode — Scratch for the AI Era"
- `og:description`: "Block-based AI interaction for kids. No prompts. No code. Just drag, create, and learn."
- `og:image`: A polished screenshot of the hero page (1200x630px, pre-generated)
- `twitter:card`: `summary_large_image`

---

## 4. README & GitHub Presence

### 4.1 README Structure

```
[Logo icon]
# ChildCode — Scratch for the AI Era
Block-based AI interaction for kids. No prompts. No code. Just drag, create, and learn.

[badges: stars | forks | license | demo link]

[Hero GIF: blocks drag in → generate → change block → image changes, 15s loop]

## What is ChildCode?
2 sentences. No more than 3 lines.

## Why ChildCode?
Three-level growth ladder:
🧱 Prompt Intuition → ⚡ Skill Thinking → 🏗️ Harness Thinking
1 sentence per level.

## Demo
Live link (GitHub Pages / Vercel)
+ 2-3 polished screenshots (dark theme)

## Quick Start
npm install && npm run dev
3 steps, no more than 5 lines.

## Architecture
Clean diagram: Blocks → JSON Truth Layer → Prompt Derivation → Image API
(Developers respect this depth — most kids tools don't show architecture)

## Contributing
Standard open-source contribution guide.

## License
MIT
```

### 4.2 Key Principles

- English primary, link to README-CN.md at bottom
- GIF above the fold — visible before scrolling
- Text minimal — every section ≤ 5 lines, let GIF and screenshots speak
- Architecture diagram differentiates from "toy" repos
- Star history chart: add after reaching Trending, not before

---

## 5. Content Distribution & Narrative

### 5.1 Story Line

> "20 years old. Mechanical engineering major at Beijing Jiaotong University. Not CS. Built Scratch for AI by myself using AI-automated development."

The cross-discipline angle is the hook. CS student building AI projects is normal. Mechanical engineering student doing it is a story.

### 5.2 Wave 1: Product Launch (same day as GitHub push)

| Platform | Format | Focus |
|----------|--------|-------|
| Xiaohongshu | Image + text post | "大二机械专业学生用AI做了个Scratch for AI" + 3 screenshots + demo link |
| Bilibili | 30-60s screen recording | Block drag → generate → change → compare. Text narration, no face required |
| Twitter/X | English tweet | "I'm a 20yo mechanical engineering student. Built Scratch for AI." + GIF + repo link |

### 5.3 Wave 2: If Wave 1 Gets Traction (1-3 days after)

| Platform | Format | Focus |
|----------|--------|-------|
| Zhihu | Long-form answer | Find hot question on AI education or non-CS coding, write answer featuring ChildCode |
| Jike | Post | Indie developer community, very friendly to this type of project |
| V2EX | Post in /create | High developer density, good for star conversion |
| Hacker News | Show HN | English, global developers. Front page = global Trending springboard |

### 5.4 Harness Engineering Content Line

**NOT in this launch.** Sequence matters:
1. ChildCode gets stars first (product as proof)
2. THEN publish "How I built this alone" story (method as content)
3. Harness Engineering story has evidence (star count) when told second

### 5.5 Timing

1. Product polish + README + Demo ready
2. Same day: push to main + Xiaohongshu / Bilibili / X simultaneous publish
3. Monitor GitHub star curve — if 100+ in 24h, immediately launch Wave 2
4. If GitHub Trending, immediately write "How I did it" article (this is where Harness Engineering enters)

---

## 6. What Gets Automated (Ralph) vs Manual

| Task | Who |
|------|-----|
| UI redesign (Tailwind migration, dark theme, responsive) | Ralph |
| Internationalization (extract copy, English default) | Ralph |
| Blockly theme customization | Ralph |
| Pre-rendered demo carousel component | Ralph |
| Mock image matching system | Ralph |
| GitHub Pages / Vercel deployment config | Ralph |
| README.md + README-CN.md writing | Ralph |
| Architecture diagram | Ralph |
| Pre-rendered image generation (real API calls) | Manual (you) |
| Logo design | Manual (AI-generated, you curate) |
| GIF recording from final product | Manual (you) |
| Social media content writing | Manual (you) |
| Social media posting | Manual (you) |
| Video recording for Bilibili | Manual (you) |

---

## Success Criteria

Qualitative:
- [ ] A developer opens the demo link and says "oh this is cool" within 3 seconds
- [ ] README GIF demonstrates the full block→generate→change→compare loop
- [ ] Product looks modern and polished in screenshots (dark theme, clean typography)

Functional:
- [ ] All UI is English by default, Chinese toggle works
- [ ] Blockly block labels are in English by default
- [ ] Demo works without API key (pre-rendered carousel + mock workspace)
- [ ] Hero page carousel auto-plays on both desktop and mobile
- [ ] Mobile visitors see carousel + "best on desktop" for workspace
- [ ] Deployed to Vercel with HTTPS and custom domain (if available)
- [ ] Open Graph meta tags render correct preview cards on Twitter/Xiaohongshu

Launch readiness:
- [ ] Chinese and English README both available
- [ ] GIF recorded from final product
- [ ] Social media posts drafted for simultaneous launch
- [ ] No Chinese text visible in any screenshot used for GitHub/Twitter
