# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Argus is a marketing landing page for an AI-powered investment management platform targeting European mid-market UCITS funds. The entire frontend is a single self-contained HTML file (`argus-landing-v7.html`) with inline CSS and inline JavaScript — no build step, no package manager, no dependencies beyond Google Fonts CDN.

## Running Locally

Open `argus-landing-v7.html` directly in a browser, or serve it with any HTTP server:

```bash
python -m http.server 8000
# then open http://localhost:8000/argus-landing-v7.html
```

There are no build, lint, or test commands.

## File Structure

The single HTML file is organized in three inline blocks:

- **CSS** (lines ~10–398): all styles inside `<style>` in `<head>`
- **HTML** (lines ~400–1224): page sections in order
- **JavaScript** (lines ~1225–1262): all scripts inside `<script>` before `</body>`

## Design System

CSS custom properties are defined on `:root` and drive the entire visual design:

- **Colors:** `--bg`, `--bg2`, `--bg3`, `--bg4`, `--card`, `--card2`, `--bdr`, `--bdr2`, `--text`, `--sub`, `--muted`, `--amber`, `--ambl`, `--ambd`, `--green`, `--red`
- **Fonts:** `Playfair Display` (display/headings), `Source Serif 4` (body), `IBM Plex Mono` (mono/code)
- **Status shorthand classes:** `.g` = green/positive, `.r` = red/negative, `.a` = amber/alert — used on table rows and badges
- **Scroll reveal:** `.rv` marks elements for fade-in; `.d1`/`.d2`/`.d3` add staggered delays

## Page Sections

Sections in DOM order, by anchor ID:

1. `#nav` — fixed header
2. Hero — animated terminal typewriter
3. Ticker — scrolling market data bar
4. Proof bar — key statistics
5. `#problem` — pain points
6. `#platform` — 8 module cards (01–08)
7. Module detail panels — toggled by `showMod(n)`
8. `#pricing` — tiered pricing table + comparison
9. ROI calculator — driven by `calcROI()`
10. `#faq` — accordion driven by `toggleFAQ(el)`
11. `#waitlist` — email capture form with `submitWL()`
12. Footer

## JavaScript Functions

All JS is in the single inline `<script>` block:

| Function | Purpose |
|---|---|
| `updateCD()` | Countdown to next 07:00 CET daily briefing; runs every second |
| `showMod(n)` | Switches active module detail panel (1–8) |
| `toggleFAQ(el)` | Expands/collapses FAQ accordion items |
| `calcROI()` | Recomputes ROI calculator output from slider values |
| `submitWL()` | Validates email and handles waitlist form submission |

Scroll-reveal is handled by an `IntersectionObserver` that adds `.visible` to `.rv` elements.

## Product Context

- **Target audience:** Mid-market European UCITS/PE funds (≤€6B AUM)
- **Pricing tiers:** Starter €999/mo, Professional €1,999/mo, Enterprise €3,499/mo
- **Regulatory framing:** AFM, BaFin, SFDR, IFRS compliant positioning
- **Key differentiator vs. Rogo/Hebbia/AlphaSense:** priced and built for funds, not bulge-bracket banks
- **Core hook:** proactive 07:00 CET portfolio briefing (the countdown timer reinforces this)
