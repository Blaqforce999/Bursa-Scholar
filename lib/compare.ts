import { cookies } from 'next/headers';

const COMPARE_COOKIE = 'bursa_compare';
export const COMPARE_LIMIT = 4;

export async function getCompareIds(): Promise<string[]> {
  const store = await cookies();
  const raw = store.get(COMPARE_COOKIE)?.value;
  if (!raw) return [];

  try {
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

async function setCompareIds(ids: string[]) {
  const store = await cookies();
  store.set(COMPARE_COOKIE, JSON.stringify(ids), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week — a browsing-session convenience, not persisted data
  });
}

export async function addToCompare(scholarshipId: string) {
  const ids = await getCompareIds();
  if (ids.includes(scholarshipId)) return { ok: true as const, ids };
  if (ids.length >= COMPARE_LIMIT) {
    return {
      ok: false as const,
      error: { code: 'COMPARE_LIMIT', message: `You can compare up to ${COMPARE_LIMIT} scholarships. Remove one first.` },
    };
  }

  const next = [...ids, scholarshipId];
  await setCompareIds(next);
  return { ok: true as const, ids: next };
}

export async function removeFromCompare(scholarshipId: string) {
  const next = (await getCompareIds()).filter((id) => id !== scholarshipId);
  await setCompareIds(next);
  return { ok: true as const, ids: next };
}

/**
 * Compare is intentionally ephemeral, browser-scoped state, never written
 * to any user's record — but a plain cookie survives a login/logout on
 * the same browser, which would otherwise leak one account's compare
 * selection into the next account that signs in. Call this on every
 * session boundary (login, signup, logout) so it never crosses accounts.
 */
export async function clearCompare() {
  const store = await cookies();
  store.delete(COMPARE_COOKIE);
}
