/**
 * PHASE 1 PLUMBING TEST ONLY. Throwaway script, not imported by any route,
 * page, or component. Run with: npx tsx scripts/email-test.ts <your-email>
 *
 * Sends exactly one real email via Resend to prove lib/email.ts works, using
 * the RESEND_API_KEY and EMAIL_FROM already set in .env. Does not touch
 * signup, the EMAIL_VERIFICATION_ENABLED flag, or any other part of the app.
 */

import { sendEmail } from '@/lib/email';

const to = process.argv[2];

if (!to) {
  console.log('Usage: npx tsx scripts/email-test.ts <your-email>');
  process.exit(1);
}

sendEmail({
  to,
  subject: 'Bursa email plumbing test',
  html: '<p>This is a one-time test email confirming Resend is wired up correctly for Bursa. Nothing else was sent, and nothing in the app was changed to send this.</p>',
})
  .then((result) => {
    console.log('Result:', JSON.stringify(result, null, 2));
  })
  .catch((err) => {
    console.log('Unexpected error:');
    console.error(err);
  });
