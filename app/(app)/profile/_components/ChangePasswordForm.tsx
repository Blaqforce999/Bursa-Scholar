'use client';

import { useState } from 'react';
import { changePassword } from '@/app/(app)/profile/actions';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { FormShell } from '@/components/shared/FormShell';
import { PASSWORD_RULES, PasswordRequirements } from '@/components/shared/AuthForm';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!PASSWORD_RULES.every((rule) => rule.test(newPassword))) {
      setError('Use 8+ characters, 1 uppercase letter, 1 number, and 1 special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = await changePassword({ currentPassword, newPassword });
    if (result.ok) {
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(result.error.message);
    }
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-16">
      <FormShell className="flex flex-col gap-16">
        <PasswordInput
          label="Current password"
          name="currentPassword"
          autoComplete="current-password"
          enterKeyHint="next"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

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
            onFocus={() => setNewPasswordFocused(true)}
            onBlur={() => setNewPasswordFocused(false)}
          />
          <PasswordRequirements password={newPassword} visible={newPasswordFocused} />
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
      {success && (
        <p role="status" className="text-eligible" style={{ font: 'var(--font-body-small)' }}>
          Password changed. Your other signed-in devices have been logged out.
        </p>
      )}

      <Button type="submit" size="lg" className="sm:self-start" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Changing…' : success ? 'Changed ✓' : 'Change password'}
      </Button>
    </form>
  );
}
