# Design System Rules

Bursa has its own visual language. It is built for African students on mobile phones, not for enterprise SaaS buyers on desktops. The design must feel calm, credible, and warm, because a student is deciding whether to trust a scholarship listing with their time and hopes, and the interface is what earns that trust.

## Source of Truth: CSS Variables

The design tokens — colors, spacing, borders, typography, gradients, and the logo — already exist as **CSS variables** in the project's tokens stylesheet (e.g. `app/globals.css` or `styles/tokens.css`) and are wired into `tailwind.config.ts`. **That stylesheet is the source of truth.** This file documents what the tokens *mean* and *how to use them*; it does not redefine them.

Agents must:

- Use the token-backed Tailwind classes (or `var(--token)` where a class does not exist), never raw hex, raw pixel values, or arbitrary values that duplicate an existing token.
- If a value seems to be missing a token, stop and ask the developer before inventing one. The palette and scale are intentionally small; adding to them is a conversation, not a solo decision.
- Treat the variable names below as the *semantic roles*. If the actual variable names in the stylesheet differ, the stylesheet wins — match it.

## Design Principles — Institutional Warmth

Bursa sits between scam-like scholarship sites that rely on hype and fake urgency, and cold institutional documents that are hard to scan and share. The intended feeling is **as credible as a university admissions office and as warm as a mentor rooting for the student.**

**Scannable over dense.** A student on a slow connection should understand a scholarship in seconds: what it covers, who it's for, when it closes, where to apply. Long prose loses.

**Mobile is the design.** Design for a 360px-wide screen and scale up. A student reading on a low-cost Android phone is the default user; desktop is the scale-up, not the starting point.

**Deadline is first-class.** The deadline and its urgency state are among the first things a student needs. Never bury them, and never fake them.

**Trust through clarity.** Clean typography, generous whitespace, real numbers, honest deadlines, and an obvious link to the official source. Nothing clever that makes the student wonder if they are on a scam page.

**Calm over clever.** No stacked shadows, no gradients for their own sake, no dark patterns. The interface should feel like it was built by adults who respect the student's time and are honest with them.

## Color System

The palette is intentionally small and semantic. Each color has a job. Values below describe the roles; the exact hex values live in the CSS variables.

| Role (token) | Value | Meaning | Rule |
|---|---|---|---|
| Ink Indigo (`--color-ink-indigo`) | `#1B1B3A` | Trust / authority | Primary brand, major headings, navigation, strong text and surfaces. |
| Marigold (`--color-marigold`) | `#F6B23C` | Opportunity / warmth | Accent and opportunity moments; use intentionally, not everywhere. |
| Warm Off-White (`--color-surface-warm`) | warm neutral | Reading surface / humanity | Default surface; avoid sterile pure-white-only UI. |
| Soft Slate (`--color-ink-muted`, scale) | neutral scale | Secondary information | Supporting text, labels, borders, and muted UI. |
| Reserved Red (`--color-danger`) | `#E5484D` | Deadline urgency | Closing-soon / closed and critical deadline states **only**. Never decorative. |
| Eligibility Green (`--color-eligible`) | semantic green | Positive / eligible state | "Eligible for you" and other positive semantic states. |

Color semantics, memorize them: **Ink Indigo = trust, Marigold = opportunity, Warm Off-White = humanity, Red = urgency, Green = eligibility.** Red is reserved for deadline urgency and errors; do not use it as an accent.

### Gradients

Gradient tokens exist in the stylesheet for selected opportunity/brand moments (typically a Marigold-warmth or Ink-Indigo treatment). Use them sparingly and never behind text-heavy reading surfaces — a scholarship's details must always be maximally legible. Gradients are a "calm accent," not a background default.

## Typography

Three typefaces, each with a fixed role. Do not introduce a fourth for variety.

| Typeface | Role | Use |
|---|---|---|
| **Clash Display** | Brand personality | Wordmark, hero headlines, major headings, selected editorial moments. Not for routine UI copy. |
| **Plus Jakarta Sans** | UI + body | Body copy, navigation, buttons, labels, filters, cards, forms, general interface. Carries most product information. |
| **Geist Mono** | Data / precision | Deadlines, dates, funding figures, comparison values, and selected data-heavy UI. |

Font sizes, line heights, and weights are defined as tokens in the stylesheet — use them. Do not use sizes outside the scale; if a design asks for something between two steps, pick the closer one. Consistency comes from repeated roles, scale, weight, spacing, and placement — not from variety. Fall back to a system sans-serif stack so text is never blank while a font loads (fonts must not block first paint).

## Spacing

Use the project's spacing tokens (built on the Tailwind 4px scale). Be generous with whitespace, especially on mobile — a cramped interface reads as cheap and slightly untrustworthy; a spacious one reads as considered. Use the spacing, border-radius, and border tokens from the stylesheet rather than arbitrary values.

## Components

Primitives live in `components/ui/`. Compose them, do not replicate them.

### Button

Variants: `primary`, `secondary`, `ghost`, plus a `danger` variant reserved for genuinely destructive admin actions. Sizes `sm`, `md`, `lg`; default `md`.

- Primary: filled with Ink Indigo, on-brand text.
- Secondary: warm-surface background, Ink Indigo text, border token.
- Ghost: transparent, Ink Indigo text, no border until hover.

The **"Apply on official site"** action on the detail page is the primary call to action: `primary`, `lg`, full-width on mobile, and it always opens the provider's official URL in a new tab with `rel="noopener noreferrer"`. It is the honest handoff, not an in-app checkout.

### Input

Single input style. Label sits above the input, not inside it. Placeholder text is never a substitute for a label. Error messages appear below the input in the danger token, with a small icon. Focused state uses an Ink Indigo (or brand) ring. Inputs are at least 44px tall on mobile to meet touch-target guidelines.

### Card

Rounded corners and a subtle border token, no drop shadow by default. Add a small shadow only when a card genuinely needs to float above a busy surface. The Scholarship Card is the workhorse card (see below).

### Badges

Two badge families carry most of Bursa's meaning, so keep them consistent:

- **DeadlineBadge** — reflects maintained deadline data only. States: open (neutral/muted), closing soon (Reserved Red urgency treatment), closed (muted, no active apply action). **Never a fake countdown.**
- **EligibilityBadge** — only shown when a profile exists. States: "Eligible for you" (Eligibility Green), "Partial match" (muted), and no badge at all when there is no profile. Never imply guaranteed acceptance.

### FilterChip

Removable chips for active filters (funding, study level, host country, region, field, nationality, deadline window). A student must be able to remove one chip, clear all, and understand when no results match.

## Scholarship Card Layout

The card is the unit of discovery. It must be scannable in under a second and must never claim something the detail page can't support:

1. Provider / institution name and logo (optimized, small — no heavy hero imagery).
2. Scholarship title.
3. Funding badge (Full / Partial / Tuition-only / Stipend).
4. Study level and host country/location.
5. Deadline and its urgency state (DeadlineBadge).
6. Save control.
7. EligibilityBadge — only when a profile exists.

## Scholarship Detail Page Layout

This is the most important page in the product. Follow the order:

1. Provider name and logo, plus a trust note that Bursa is a discovery layer and applications happen on the official site.
2. Scholarship title in the display style.
3. Funding covered and key figures in Geist Mono.
4. Key dates / deadline, with urgency state.
5. Eligibility (and the student's own EligibilityBadge if a profile exists).
6. Benefits and requirements/documents.
7. How to apply.
8. Primary actions: **Apply on official site** (full-width `primary` `lg`, sticky to the bottom of the viewport on mobile), plus Save, Compare, and Share.
9. Official source link, always present and visible.

Above the fold on mobile: title, funding, deadline, and the Apply action. Everything else is reachable with one scroll. Every claim on the card must be supported here.

## Dashboard & Admin Layout

Student dashboard (Saved, Compare, Profile) and the admin curation area both use a single-column main content area with a comfortable max width. Left sidebar on desktop, collapsing to a top bar on mobile. Do not build multi-column dashboards; the data is simple and a single column is easier to scan on a phone.

## Iconography

Lucide React. One icon library, no mixing. Icons are 20px inside buttons, 24px in nav, 16px inline with text. Icons always have an accessible label via `aria-label` or visible text.

## Motion

Keep it minimal. Use Tailwind's `transition` utilities for hover and focus states, durations under 200ms. No page transitions, no elaborate enter animations, no animations on the critical path of the scholarship page. Provide useful skeletons and empty states instead of spinners.

## Accessibility

Every interactive element is reachable by keyboard. Focus states are visible and use the brand ring. Color contrast meets WCAG AA. Form inputs have associated labels, and error messages are linked with `aria-describedby`. Buttons have text or an `aria-label`. Provider logos use the provider name as `alt` text; decorative images use `alt=""`.

## What Not to Do

- Do not add fake countdowns, fake "X spots left," or any urgency the data does not support. Reserved Red is for real deadline states only.
- Do not add skeuomorphism, glassmorphism, or neumorphism. They go out of style fast and cost performance.
- Do not use more than two font weights on a single screen (regular and bold, plus semibold for headings where needed).
- Do not center-align body text. Left-align everything except buttons and single-line headings.
- Do not use heavy hero imagery or carousels on scholarship pages. Optimized provider logos and clear structure win.
- Do not let a visual trend override Institutional Warmth, and do not break a repeated visual pattern just to add variety.
- Do not invent new tokens. If it isn't in the CSS variables, ask the developer.
