# Workflow: Creating a New API Route

Follow this workflow when you need to add a new API route or server action to Bursa. It chains the architecture, security, and code-style rules with the route scaffolder skill so the new endpoint fits the codebase and does not introduce a security hole. Bursa moves no money, so there is no payment or webhook path here — the sensitive surfaces are student profile data, the curated scholarship database, and outbound official links.

## Before You Touch Any File

**Step 1. Decide: route handler or server action?**

- Called by our own UI as a form submit or UI-triggered mutation (save/unsave, edit profile, admin curation) → **server action** in `app/.../actions.ts`.
- Called as a public read API or by client-driven filtering (search, filter, fetch-more feed) → **route handler** in `app/api/scholarships/.../route.ts`.
- An admin mutation exposed as an endpoint → **route handler** in `app/api/admin/.../route.ts`, gated behind an admin check.

Server actions are the default for authenticated writes. Route handlers are for read APIs and boundaries.

**Step 2. Decide on the data model.**

Sketch the input and the output before writing code. What fields come in? What gets validated? What rows are read or written? What does success look like? What does failure look like?

If the endpoint can be called twice for the same thing (saving a scholarship, verifying one), the sketch must include idempotency — not to avoid double-charging (there is no money) but to avoid duplicate rows. See the `SavedScholarship (userId, scholarshipId)` unique constraint in `skills/db-migration-runner/SKILL.md`.

**Step 3. Load the right context.**

Open and read in order:

1. `.agents/rules/architecture.md` — where the route lives, data-flow conventions.
2. `.agents/rules/security.md` — the non-negotiables for input validation, auth, privacy, and outbound-link safety.
3. `.agents/rules/code-style.md` — naming, error handling, logging patterns.
4. `skills/api-route-scaffolder/SKILL.md` — the route/action templates and the envelope convention.
5. If the route changes the schema: `skills/db-migration-runner/SKILL.md`.

## Build It

**Step 4. Create the file.**

Use the appropriate template from `skills/api-route-scaffolder/SKILL.md`. Route handlers go at `app/api/<resource>/<action>/route.ts`. Server actions go in a sibling `actions.ts` of the page that triggers them, with `"use server"` at the top.

**Step 5. Write the zod schema first.**

Before any business logic, define the `inputSchema`. Every field the endpoint accepts is in the schema. Nothing outside the schema is trusted. If the client sends a field you did not declare, zod strips it. For admin curation that accepts an `officialUrl`, validate that it is an absolute `https` URL right here.

**Step 6. Authenticate, then authorize.**

Authenticate: is there a valid session? If not, return `401`.

Authorize: does this session have permission to do this specific thing on this specific resource? A student can only touch their own saved list, comparison, and profile — check ownership explicitly (`saved.userId === session.userId`). Admin curation requires the admin role, checked on the server. Do not rely on the URL shape to enforce ownership; a crafted URL can target any row.

Public read endpoints (feed, search, filter) are intentionally unauthenticated. They need different protections: clamp and validate query params, and consider rate limiting so a crafted query can't force an expensive scan.

**Step 7. Validate again at the boundaries.**

If the route accepts a URL parameter or query string (a slug, a filter value, a comparison ID list), validate it too. The principle: all outside input gets validated, not just JSON bodies.

**Step 8. Do the work.**

Keep the body of the try block short. If it is more than ~30 lines, extract the core logic into a function in `lib/` — eligibility evaluation, for instance, lives in `lib/eligibility.ts`, not in a route. Route handlers are thin.

Use `db.$transaction` when two or more writes must succeed together.

**Step 9. Return the consistent envelope.**

Success: `{ ok: true, data }`.
Failure: `{ ok: false, error: { code, message } }`.

Use proper HTTP status codes: `200` success, `400` invalid input, `401` unauthenticated, `403` unauthorized, `404` not found, `409` conflict, `429` rate limited, `500` server error.

**Step 10. Log the right things.**

On success, a single structured log line: `logger.info('saved.created', { userId, scholarshipId })`.
On failure, log the error with context: `logger.error('saved.create.failed', { error, scholarshipId })`.
Never log passwords, session tokens, or profile fields (nationality, field of study, and so on).

**Step 11. Revalidate caches (server actions only).**

If the action mutates data displayed elsewhere (the saved list, the profile-driven eligibility labels, an admin edit that changes a public listing), call `revalidateTag` or `revalidatePath` so the cache updates. Forget this and the UI serves stale data.

## Check Your Work

**Step 12. Walk the security checklist.**

- [ ] Input validated with zod (body, params, query).
- [ ] Session checked (if the route is not intentionally public).
- [ ] Ownership check (student resources) or admin-role check (curation) in place.
- [ ] Outbound `officialUrl` / `applicationUrl` validated as `https` where the route accepts one.
- [ ] Rate limit considered for public or auth endpoints.
- [ ] No raw error messages returned to the client.
- [ ] No profile data, passwords, or tokens logged.
- [ ] Idempotency handled where a repeat is possible (unique constraint + `P2002` catch).
- [ ] Database writes that must happen together are in a `db.$transaction`.

**Step 13. Test the happy path and the unhappy paths.**

Hit the route with valid input. Confirm success.
Hit it with missing fields. Confirm the 400.
Hit it without a session (if auth is required). Confirm the 401.
Hit it with a student session that does not own the resource. Confirm the 403.
Hit an admin route with a non-admin session. Confirm the 403.
If the route has a unique constraint (save, verify), hit it twice and confirm the second call is a clean no-op.

**Step 14. Check the network tab.**

Confirm the actual HTTP status code matches what you intended. Confirm the response body matches the envelope. Confirm no profile data or internal curation fields leak in the response.

**Step 15. Commit.**

Commit message says what the route does in one line. If it is part of a larger feature, reference the feature in the body.

## When Things Go Wrong

If the route starts to do too many things (writing three records, evaluating eligibility, revalidating five caches), stop. That is a sign the logic should move into a service function in `lib/` that the route thinly wraps. Route handlers are about translating HTTP to function calls, not about orchestration.

If you need to change the database schema to support this route, stop and read `skills/db-migration-runner/SKILL.md` before touching `prisma/schema.prisma`. Schema changes deserve their own commit and their own migration, separate from the route that depends on them.
