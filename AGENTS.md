# AGENTS.md — Bursa

This file is the entry point for any AI agent working on the Bursa codebase in Antigravity. Read this first, then load the rule files in `.agents/rules/` and the relevant skill in `skills/` before taking any action.

## What Bursa Is

Bursa is a free, mobile-first scholarship discovery and decision-support platform for African students. A student opens Bursa, searches and filters scholarships, opens a structured detail page, understands whether they are eligible and what the scholarship covers, saves and compares a shortlist, and then continues to the scholarship provider's official website to apply. That is the whole product.

Bursa is a **discovery layer**. It is not a store, not an application portal, not a scholarship provider, and it does not move money. Bursa does not process payments, collect application fees, or submit applications on anyone's behalf. Every feature decision should be measured against one question: does this help a student discover, understand, and act on a legitimate scholarship faster and with more trust?

Product promise: **Scholarships, broken down. Free for every African student.**

## Who We Are Building For

African students on phones. Undergraduate seekers (17–24), postgraduate applicants (24–32), and helpers (parents, teachers, mentors who find and forward opportunities). They are mobile-first, often on slow networks, often on low-cost Android devices, and often data-conscious. Agents must keep this user in mind at all times. Heavy JavaScript, blocking fonts, multi-step onboarding, fake urgency, and desktop-only patterns are all wrong for this audience.

## Tech Stack — Locked

- Next.js (App Router) with React and TypeScript
- PostgreSQL for the database
- Prisma as the ORM
- Tailwind CSS for styling, wired to the project's CSS-variable design tokens
- Server-side rendering for scholarship pages so they load fast, work on weak connections, are indexable, and produce good link previews

The stack is locked. shadcn/ui, Convex, Supabase, Clerk, and other alternative backend/database/UI services referenced in older documents are **superseded**. Do not introduce a new framework, database, UI library, or backend service without an explicit engineering decision from the developer.

## Project Structure

```
bursa/
├── AGENTS.md                      (this file)
├── .agents/
│   └── rules/                     (always-on rules for every task)
│       ├── architecture.md
│       ├── code-style.md
│       ├── design-system.md
│       └── security.md
├── skills/                        (load only when relevant to the task)
│   ├── component-builder/
│   ├── api-route-scaffolder/
│   └── db-migration-runner/
└── workflows/                     (step-by-step recipes for common tasks)
    ├── new-component.md
    └── new-api-route.md
```

## How to Use These Files

**Rules in `.agents/rules/` are always in effect.** Load all four before starting any task. They cover architecture decisions, code style, the design system, and security requirements. Do not override them without explicit permission from the developer.

**Skills in `skills/` are loaded on demand.** When building a UI component, read `skills/component-builder/SKILL.md`. When creating an API route or server action, read `skills/api-route-scaffolder/SKILL.md`. When changing the database schema, read `skills/db-migration-runner/SKILL.md`. Never skip the skill file and try to work from memory.

**Workflows in `workflows/` are recipes.** Follow them in order when the task matches. They combine the rules and skills into a concrete sequence of steps.

## Non-Negotiables

1. **Bursa never handles money.** No payment processing, no checkout, no application fees, no in-platform application submission. If you see anything payment-related in an older document or a copied reference, treat it as out of scope and leave it out.
2. **Scholarship detail pages must render on the server** for speed, weak-connection resilience, indexability, and link previews. They are the single most important page in the product.
3. **Every listing links out to an official source.** Applications happen on the provider's official website, never inside Bursa. Never silently substitute an untrusted destination for a broken official link — flag it for admin.
4. **Eligibility matching is deterministic and rule-based in the MVP.** No ML recommender before deterministic eligibility is proven. Honesty and predictability over a black box.
5. **No fake urgency, no dark patterns.** Deadline states reflect maintained scholarship data only. No fake countdowns, no misleading claims, no "acceptance guaranteed."
6. **Curation quality is the moat.** Verification, normalization, deadline accuracy, and dead-link pruning are core, not afterthoughts. User-submitted scholarships are out of scope in v1.
7. **Sensitive data** (database URLs, session secrets, storage keys) lives in environment variables and never in the codebase.
8. **The product is built for Africa.** Africa-first eligibility clarity, mobile-first performance, and honest deadlines come first.

## When in Doubt

Ask the developer. Do not guess at eligibility rules, schema changes, auth flows, or how a scholarship's official source is resolved. Small guesses in those areas quietly erode the one thing Bursa is built on: trust.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
