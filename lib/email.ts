import { Resend } from 'resend';
import { env } from '@/lib/env';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

type SendEmailResult = { ok: true } | { ok: false; error: string };

/**
 * The one place that actually sends an email. Returns a result instead of
 * throwing, matching the {ok, error} shape already used across the app's
 * server actions and API routes. Callers decide what to do with a failure
 * (log it, surface it, or ignore it), this function never crashes a request.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<SendEmailResult> {
  if (!resend || !env.EMAIL_FROM) {
    return { ok: false, error: 'Email is not configured.' };
  }

  try {
    const result = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html });
    if (result.error) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown email error.' };
  }
}
