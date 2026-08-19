'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { FormShell } from '@/components/shared/FormShell';
import { PASSWORD_RULES, PasswordRequirements } from '@/components/shared/AuthForm';

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!PASSWORD_RULES.every((rule) => rule.test(newPassword))) {
      setError('Use 8+ characters, 1 uppercase letter, 1 number, and 1 special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const json = await res.json();

      if (!json.ok) {
        setError(json.error?.message ?? 'Something went wrong. Please try again.');
        setIsSubmitting(false);
        return;
      }

      router.push('/auth?mode=login');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-16">
      <FormShell className="flex flex-col gap-16">
        <div className="flex flex-col gap-8">
          <PasswordInput
            label="New password"
            name="newPassword"
            autoComplete="new-password"
            enterKeyHint="next"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
          <PasswordRequirements password={newPassword} visible={passwordFocused} />
        </div>

        <PasswordInput
          label="Confirm new password"
          name="confirmPassword"
          autoComplete="new-password"
          enterKeyHint="done"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </FormShell>

      {error && (
        <p role="alert" className="text-danger" style={{ font: 'var(--font-body-small)' }}>
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full sm:w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Reset password'}
      </Button>
    </form>
  );
}
