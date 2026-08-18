# Architecture Rules

These rules describe how Bursa is put together. Every agent building features must follow this architecture. Do not introduce new patterns without discussing them with the developer first.

## The Stack

Bursa is a Next.js application using the App Router, written in TypeScript, backed by PostgreSQL through Prisma. Styling is handled by Tailwind CSS, wired to the project's CSS-variable design tokens. There is no separate backend service. Everything lives in the Next.js app, using server components, server actions, and route handlers.

The stack is locked. Do not reach for shadcn/ui, Convex, Supabase, Clerk, or any other alternative backend, database, or UI service. They are superseded by the stack above.

## Directory Layout

```
app/
├── (marketing)/               public landing pages, About/Mission, logged-out experience
├── (dashboard)/               authenticated student area, grouped by layout
│   ├── saved/                 saved shortlist
│   ├── compare/               side-by-side comparison
│   └── profile/               eligibility profile (nationality, level, field, region)
├── (admin)/                   internal curation area (restricted)
│   └── scholarships/          create / edit / archive / verify
├── scholarships/[slug]/       public scholarship detail page — the shareable, indexable target
├── api/
│   ├── auth/                  login, signup, logout route handlers
│   ├── scholarships/          public read + search/filter endpoints
│   ├── saved/                 save / unsave (authenticated)
│   └── admin/                 admin curation mutations (restricted)
└── layout.tsx                 root layout

components/
├── ui/                        primitive components (Button, Input, Card, Badge, etc.)
├── scholarship/               scholarship-specific components (ScholarshipCard, EligibilityBadge, DeadlineBadge)
├── dashboard/                 dashboard-specific components (SavedList, CompareTray)
├── admin/                     admin-only curation components
└── shared/                    shared across the app (EmptyState, PageHeader, FilterChip)

lib/
├── db.ts                      Prisma client singleton
├── auth.ts                    session and auth helpers
├── eligibility.ts             deterministic rule-based matching (no ML)
├── slug.ts                    unique, stable slug generation
├── storage.ts                 object-storage wrapper for curated provider logos
├── env.ts                     zod-validated environment config
└── validators/                zod schemas for input validation

prisma/
├── schema.prisma              single source of truth for the database
└── migrations/                generated migration files

public/                        static assets
```

## Rendering Rules

Scholarship detail pages at `/scholarships/[slug]` must be server-rendered. They are the single most important page in the product because they are what students land on from a shared WhatsApp message, a search engine, or a mentor's forward. They must load fast, work without JavaScript enabled, produce good Open Graph previews, and be cleanly indexable.

The feed and search results should also render on the server for the first paint, with client interactivity layered on top only where filtering needs it. The student dashboard (saved, compare, profile) and the admin curation area can use client components where interactivity is needed, but data fetching happens on the server. Do not fetch from API routes inside client components when a server component can pass the data down directly.

## Data Flow

There is no payment flow, no checkout, and no webhook in Bursa. Data flow is simpler than a commerce app: mostly reads, with a small number of authenticated writes.

1. **Public reads** — feed, search, filters, and detail pages — are served by server components (and route handlers under `app/api/scholarships/` for client-driven filtering). These are the highest-traffic paths and must be fast and cacheable.

2. **Authenticated student writes** — saving a scholarship, building a comparison, editing the eligibility profile — go through **server actions**. The action validates input with zod, writes through Prisma, and revalidates the relevant cache tags. A student can only read and write their own saved list, comparison, and profile.

3. **Admin curation writes** — create, edit, archive, verify, and prune scholarships — go through **restricted server actions or `app/api/admin/` route handlers**. These require an admin session and are the only place scholarship records are mutated. Curation quality is the product's moat, so these paths get the most careful validation.

There are no public-facing writes in the MVP. User-submitted scholarships are out of scope in v1, so the public product page is read-only.

## Eligibility

Eligibility matching is **deterministic and rule-based**, implemented in `lib/eligibility.ts`. Given a student profile (nationality, study level, field of study, optional target region) and a scholarship, the module returns a labelled state: full match ("Eligible for you"), partial match, or no state when there is no profile. There is no ML recommender in the MVP. "Show eligible first" may reorder results but must never hide non-matching scholarships. Do not move eligibility logic into components; keep it in `lib/` so it is testable and consistent.

## State Management

There is no global state library. React state and server data are enough. The comparison selection (2–4 scholarships) can live in URL search params or lightweight client state — do not reach for Redux, Zustand, or Jotai. If you feel the urge to add one, stop and reconsider.

## Database Access

All database access goes through Prisma. Raw SQL is only allowed in migration files. Every query that takes user input must use Prisma's parameterized query builder, never string interpolation.

The Prisma client is imported from `lib/db.ts`, which exports a singleton. Do not instantiate `new PrismaClient()` anywhere else; creating multiple clients exhausts the connection pool in development.

## Authentication

A student account is **optional** — browsing, searching, and reading detail pages work with no account. An account unlocks saving, comparing across sessions, and the eligibility profile. Admin is a separate, restricted role for curation.

Sessions are cookie-based. Cookies are `httpOnly`, `secure` in production, and `sameSite: lax`. The session helper in `lib/auth.ts` exposes `getSession()` for server components and server actions, and a role check for admin routes. Client components that need auth state receive it as a prop from their parent server component.

## Error Handling

Server actions and route handlers return structured responses. Success is `{ ok: true, data }` and failure is `{ ok: false, error: { code, message } }`. The client never receives raw exception messages, stack traces, or Prisma error objects. Log the full error on the server, return a sanitized message to the user.

## Environments

- `development` runs locally against a local PostgreSQL.
- `production` runs on the deployment target against the production database.

There is no staging environment yet. When we add one, it will use a separate production-shaped database.

## What Not to Do

- Do not add GraphQL. REST route handlers and server actions are enough.
- Do not add a separate Node or Express backend. Everything stays in Next.js.
- Do not reach for microservices. This is one app.
- Do not add an ML or "AI recommendation" eligibility engine in the MVP. Deterministic rules first; prove them before anything smarter.
- Do not add shadcn/ui, Convex, Supabase, Clerk, or another UI/backend service. Build components with Tailwind and the design system.
- Do not build a custom auth system from scratch if a standard library fits. Check with the developer before introducing auth libraries.
- Do not store curated provider logos on the filesystem. Use the configured storage provider (`lib/storage.ts`). The filesystem is ephemeral on most deployment targets.
- Do not add anything that moves money, collects fees, or submits applications. Bursa is a discovery layer.
