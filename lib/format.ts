/**
 * Pure, dependency-free formatting helpers. This file must never import
 * lib/db.ts (or anything that does) — it's imported from client
 * components (AssistantPanel) as well as server components, and a
 * server-only import here would leak the Prisma/env module graph into
 * the browser bundle.
 */

/** Up to 2 initials from a provider name, for the compact monogram tile
 *  shown when a scholarship has no curated logo yet. */
export function providerMonogram(provider: string): string {
  return provider
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}
