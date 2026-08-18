# Security Rules

Bursa handles trust, not money. Students rely on us to point them at real, legitimate scholarships and to keep their profile data safe. A security mistake here is not just a bug — it is a broken promise to a student who trusted a listing. Every agent working on this codebase must follow these rules without exception.

Bursa collects **no payment information of any kind**. There is no card data, no bank data, and no payment processing anywhere in this product. If a requirement or a copied reference implies collecting or handling payment data, it is out of scope — leave it out and flag it.

## Secrets and Configuration

Never commit secrets to the repository. Database URLs, session secrets, and storage keys live in environment variables, loaded through a validated config module.

The required environment variables are:

```
DATABASE_URL
SESSION_SECRET
NEXT_PUBLIC_APP_URL
STORAGE_ACCESS_KEY          (for curated provider-logo uploads)
STORAGE_SECRET_KEY
STORAGE_BUCKET
```

Environment variables are validated at boot with zod in `lib/env.ts`. If a required variable is missing, the app refuses to start rather than running in a half-configured state.

Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put a secret behind that prefix, even if you think it looks harmless.

## Authentication

A student account is optional; where accounts exist (saving, comparing, profile, and admin), auth must be handled properly.

Passwords are hashed with argon2id or bcrypt before they hit the database. Never store plaintext passwords. Never log passwords, even during debugging.

Sessions are cookie-based. Cookies must have:
- `httpOnly: true`
- `secure: true` in production
- `sameSite: 'lax'`
- A reasonable expiration (30 days is the default)

Session tokens are random, unguessable, and at least 32 bytes of entropy. Use the Node `crypto` module's `randomBytes`, not `Math.random`.

Logout invalidates the session on the server side by deleting the session record, not just the cookie. A stolen cookie is useless if the server no longer recognizes its token.

## Authorization

Two roles: **student** and **admin**.

- A student can only read and mutate their own resources: their saved list, their comparison, and their profile. Check ownership explicitly (`saved.userId === session.userId`); never rely on the URL shape to enforce it.
- **Admin curation mutations are restricted to admin sessions.** Creating, editing, archiving, verifying, or pruning scholarships must be gated behind an admin check on the server, not just hidden in the UI. The scholarship database is the product's moat; unauthorized writes to it are a serious incident.

## Input Validation

Every piece of data that enters the application from outside must be validated with zod before it touches the database or any business logic. This applies to:
- Form submissions (profile, admin curation)
- Route handler request bodies
- URL parameters and query strings (slugs, filters, comparison IDs)
- Curated provider-logo uploads

Validation is not optional and is not the frontend's job. The frontend can validate for user experience, but the server validates for safety.

## SQL Injection

All database access goes through Prisma. Prisma uses parameterized queries by default, which prevents SQL injection as long as you do not bypass it. Never use `prisma.$queryRawUnsafe` or string-concatenate SQL. If you need raw SQL, use `prisma.$queryRaw` with a tagged template, which parameterizes correctly.

## Cross-Site Scripting (XSS)

React escapes strings by default when rendering, which handles most cases. The main risks in Bursa:

- `dangerouslySetInnerHTML`: do not use it unless content has been sanitized server-side with a library like DOMPurify, and even then, only for content you control.
- **Curated scholarship copy** (eligibility text, benefits, requirements) is admin-entered but should still be treated as untrusted at render time — if any of it is ever rendered as HTML/Markdown, use a sanitizing renderer.

## Cross-Site Request Forgery (CSRF)

Server actions in Next.js include built-in CSRF protection. Route handlers that perform state-changing operations (save/unsave, admin curation) must verify the origin of the request:
- Check the `Origin` or `Referer` header matches the app's domain.
- For authenticated endpoints, rely on the `sameSite: 'lax'` cookie attribute plus origin checking.

## External Link Safety

This is Bursa's most important security section, because the whole product ends in a handoff to a third-party site. **Read it twice.**

Every scholarship carries an `official_url` and an `application_url` that Bursa links out to. These are the moment a student leaves us and trusts a listing.

- **Validate every outbound URL.** It must be a well-formed absolute URL over `https://`. Reject or flag anything else. Do this at curation time (before the record is saved) and defensively at render time.
- **Open outbound links safely.** Outbound links use `target="_blank"` with `rel="noopener noreferrer"` so the destination cannot manipulate the opener.
- **Never silently substitute a destination.** If an official link is broken or dead, flag it for admin correction and show a clear "link unavailable" state. Do not auto-redirect to a search result, an affiliate, or any untrusted destination — that would be the exact scam pattern Bursa exists to replace.
- **No affiliate or tracking hijacking.** Bursa links to the official source, plainly. Do not append tracking wrappers that could redirect students elsewhere.

## Privacy

The eligibility profile (nationality, study level, field of study, target region) is personal data. Treat it with care.

- Collect only what eligibility matching needs, and only when the student chooses to build a profile.
- Do not expose profile data in URLs, query strings, logs, or to other users.
- Do not compile or cross-reference student data beyond what a feature requires.
- Browsing and reading work with no account and no profile; never gate discovery behind data collection.

## File Uploads (Curated Provider Logos)

Provider logos are uploaded by admins during curation. Treat them as untrusted input.

- Accept only `image/jpeg`, `image/png`, and `image/webp` based on the actual file bytes, not the client-provided MIME type. Avoid SVG uploads (they can carry script).
- Enforce a maximum file size (a small logo does not need to be large; 2–5MB is generous).
- Strip metadata before storing.
- Store files in the configured object storage with a random filename. Never use the client's filename directly.
- Serve logos from the storage provider's domain or a CDN, never from the same origin as the app.

## Rate Limiting

Apply rate limits to:
- Login and signup (to slow down credential stuffing)
- Password reset requests
- Admin curation endpoints (to contain a compromised admin session)
- Public search/filter if a client can hammer it, to protect the database

Use an in-memory limiter for development and a Redis-backed one for production. The limiter lives in `lib/rate-limit.ts`.

## Logging

Log enough context to debug an incident, never enough to leak user data.

- Log request method, path, status, duration, and a request ID.
- Log user ID (not email, not name, not profile fields) when relevant.
- Log error stacks on the server.
- Never log: passwords, session tokens, or any profile data beyond an anonymous user ID.

## Dependencies

Every dependency is a potential vulnerability. Keep the list small. Run `npm audit` regularly. When a vulnerability is reported, update the package within a week unless it does not affect our use case. Do not install packages with fewer than a few thousand weekly downloads or no recent commits unless the developer approves.

## Incident Response

If a secret is exposed (committed by accident, leaked in a log, shared in a screenshot), rotate it immediately. The order is:
1. Rotate the secret at the provider (database, storage, session secret).
2. Update the environment variable in production.
3. Deploy.
4. Revoke the old secret.
5. Tell the developer what happened and when, in writing.

If a bad or malicious outbound link is discovered on a live listing, treat it as a trust incident: unpublish or flag the listing immediately, correct the official source, and note it for the developer. Do not try to hide a leak or a bad link. Fast, honest response limits damage.
