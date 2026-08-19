import { randomBytes, createHash } from 'crypto';
import { db } from '@/lib/db';

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes, per the security rule

/**
 * Tokens are high-entropy random bytes, not a low-entropy human password,
 * so a fast cryptographic hash (not bcrypt) is the right tool here: it
 * still means the raw token is never stored, without paying bcrypt's
 * deliberate slowness for a value that's already unguessable.
 */
function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Creates a single-use, expiring reset token for the given user and
 * returns the RAW token (only this call ever sees it — only its hash is
 * stored). The caller is responsible for emailing it, never storing or
 * logging the raw value.
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const rawToken = randomBytes(32).toString('hex');
  await db.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });
  return rawToken;
}

type ConsumeResult = { ok: true; userId: string } | { ok: false };

/**
 * Validates a raw token (must exist, be unused, and unexpired) and marks
 * it used in the same call, so it can never be replayed even if the
 * request handler is somehow invoked twice. Returns the associated userId
 * only on success.
 */
export async function consumePasswordResetToken(rawToken: string): Promise<ConsumeResult> {
  const tokenHash = hashToken(rawToken);
  const record = await db.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt !== null || record.expiresAt < new Date()) {
    return { ok: false };
  }

  await db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return { ok: true, userId: record.userId };
}
