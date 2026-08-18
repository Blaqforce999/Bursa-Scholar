# API Route Scaffolder Skill

Load this skill for any task that adds or changes a route handler or server action in Bursa. It is the source of truth for how endpoints are shaped, validated, authenticated, and how they return data. Do not scaffold endpoints from memory.

Read `.agents/rules/architecture.md`, `.agents/rules/security.md`, and `.agents/rules/code-style.md` alongside this skill — this skill assumes all three.

## Route Handler or Server Action?

- **Called by our own UI as a form submit or UI-triggered mutation** (save/unsave, edit profile, admin curation) → **server action** in a sibling `actions.ts` of the page that triggers it, with `"use server"` at the top.
- **Called as a public read API or by client-driven filtering** (search, filter, fetch-more feed) → **route handler** in `app/api/scholarships/.../route.ts`.
- **Admin mutation exposed as an endpoint** → **route handler** in `app/api/admin/.../route.ts`, gated behind an admin check.

Server actions are the default for authenticated writes. Route handlers are for read APIs and boundaries. There are no payment endpoints and no webhooks in Bursa.

## The Response Envelope

Every route handler and server action returns the same shape.

Success: `{ ok: true, data }`
Failure: `{ ok: false, error: { code, message } }`

The client never receives raw exceptions, stack traces, or Prisma error objects. Use proper HTTP status codes in route handlers: `200` success, `400` invalid input, `401` unauthenticated, `403` unauthorized, `404` not found, `409` conflict, `429` rate limited, `500` server error.

## Route Handler Template

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

const inputSchema = z.object({
  scholarshipId: z.string().cuid(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required.' } }, { status: 401 });
    }

    const body = await req.json();
    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: { code: 'INVALID_INPUT', message: 'Invalid request.' } }, { status: 400 });
    }

    // do the work (thin — heavy logic lives in lib/)
    const saved = await db.savedScholarship.create({
      data: { userId: session.userId, scholarshipId: parsed.data.scholarshipId },
    });

    logger.info('saved.created', { userId: session.userId, scholarshipId: parsed.data.scholarshipId });
    return NextResponse.json({ ok: true, data: { id: saved.id } }, { status: 200 });
  } catch (err) {
    logger.error('saved.create.failed', { error: err });
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong.' } }, { status: 500 });
  }
}
```

## Server Action Template

```ts
'use server';

import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

const inputSchema = z.object({
  nationality: z.string().min(2),
  studyLevel: z.enum(['UNDERGRADUATE', 'MASTERS', 'PHD', 'RESEARCH']),
  fieldOfStudy: z.string().min(2),
  targetRegion: z.string().optional(),
});

export async function updateProfile(raw: unknown) {
  const session = await getSession();
  if (!session) return { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required.' } };

  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: { code: 'INVALID_INPUT', message: 'Please check the form.' } };

  try {
    await db.user.update({ where: { id: session.userId }, data: parsed.data });
    revalidateTag(`profile:${session.userId}`);
    return { ok: true, data: null };
  } catch (err) {
    logger.error('profile.update.failed', { userId: session.userId, error: err });
    return { ok: false, error: { code: 'SERVER_ERROR', message: 'Could not save your profile.' } };
  }
}
```

## The Rules of a Good Endpoint

**1. Validate first.** Define the `inputSchema` before any business logic. Every accepted field is in the schema; anything outside it is stripped and never trusted. Validate URL params and query strings too (slugs, filter values, comparison IDs).

**2. Authenticate, then authorize.** Is there a valid session? If not, `401`. Then: does this session own this specific resource, or hold the admin role for admin routes? Check ownership explicitly (`saved.userId === session.userId`); never rely on the URL shape to enforce it.

**3. Keep the body thin.** If the work is more than ~30 lines, extract it into a function in `lib/` (for example, eligibility evaluation lives in `lib/eligibility.ts`). Route handlers translate HTTP to function calls; they don't orchestrate.

**4. Use a transaction when writes must succeed together.** `db.$transaction` for multi-write operations.

**5. Handle idempotency where a repeat is possible.** Bursa has no payments, so idempotency here is about avoiding duplicate rows, not double-charging. Saving the same scholarship twice must be a clean no-op: put a unique constraint on `SavedScholarship (userId, scholarshipId)`, catch the Prisma `P2002` unique-violation, and return success without creating a second row. Same idea for verifying a scholarship twice.

**6. Return the envelope and the right status code.**

**7. Log the right things.** One structured line on success (`logger.info('saved.created', { userId, scholarshipId })`), the error with context on failure. Never log profile fields, passwords, or session tokens.

**8. Revalidate caches (server actions only).** If the action mutates data displayed elsewhere, call `revalidateTag` / `revalidatePath` so the UI doesn't serve stale data.

## Public Read Endpoints

Search and filter endpoints are public and read-only. Protect them differently from authenticated writes:

- Validate and clamp query params (page size, filter enums, deadline windows) so a crafted query can't force an expensive scan.
- Consider rate limiting to protect the database from hammering.
- Return only fields the public page needs; do not leak internal curation fields or any user data.

## Common Mistakes

- Skipping the zod schema and trusting `req.json()`.
- Relying on the URL shape for ownership instead of an explicit check.
- Fat route handlers doing five things — move logic to `lib/`.
- Forgetting the unique constraint that makes save/verify idempotent.
- Returning a raw error message or a Prisma object to the client.
- Forgetting `revalidateTag` after a mutation, so the saved list or feed shows stale data.

## Security Checklist Before Committing

- [ ] Input validated with zod (body, params, query).
- [ ] Session checked (unless the route is intentionally public).
- [ ] Ownership / admin-role check in place where relevant.
- [ ] Rate limit considered for public or auth endpoints.
- [ ] No raw error messages returned to the client.
- [ ] No profile data, passwords, or tokens logged.
- [ ] Idempotency handled where a repeat request is possible (unique constraint + `P2002` catch).
- [ ] Multi-writes wrapped in `db.$transaction`.
