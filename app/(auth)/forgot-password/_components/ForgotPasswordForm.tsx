'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormShell } from '@/components/shared/FormShell';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    // Always show the same success state regardless of the response body,
    // the API itself never reveals whether the email has an account.
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => {});

    setSent(true);
    setIsSubmitting(false);
  }

  if (sent) {
    return (
      <p role="status" className="text-ink-indigo" style={{ font: 'var(--font-body-regular)' }}>
        If an account exists for that email, a reset link has been sent. Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormShell>
        <Input
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          enterKeyHint="done"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormShell>
      <Button type="submit" size="lg" className="mt-16 w-full sm:w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  );
}
