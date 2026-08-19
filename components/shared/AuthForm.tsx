'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { FormShell } from '@/components/shared/FormShell';
import type { FieldState } from '@/components/ui/ValidationIcon';
import { cn } from '@/lib/cn';

type AuthFormProps = {
  // required props first
  mode: 'signup' | 'login';
  // optional props after
  next?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  { key: 'length', label: '8+ characters', test: (v: string) => v.length >= 8 },
  { key: 'upper', label: '1 uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { key: 'number', label: '1 number', test: (v: string) => /[0-9]/.test(v) },
  { key: 'special', label: '1 special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

function validateEmail(value: string): string | undefined {
  if (!value) return 'Enter your email.';
  if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address.';
  return undefined;
}

function validatePassword(value: string, mode: 'signup' | 'login'): string | undefined {
  if (!value) return 'Enter your password.';
  if (mode === 'signup' && !PASSWORD_RULES.every((rule) => rule.test(value))) {
    return 'Use 8+ characters, 1 uppercase letter, 1 number, and 1 special character.';
  }
  return undefined;
}

function PasswordRequirements({ password, visible }: { password: string; visible: boolean }) {
  return (
    <ul
      className={cn('flex flex-wrap gap-x-12 gap-y-4 transition-opacity', visible ? 'opacity-100' : 'opacity-0')}
      aria-live={visible ? 'polite' : 'off'}
      aria-hidden={!visible}
    >
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.key}
            className={met ? 'text-eligible' : 'text-ink-muted'}
            style={{ font: 'var(--font-body-small)', listStyle: 'none' }}
          >
            {met ? '✓' : '○'} {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

export function AuthForm({ mode, next }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleNotice, setGoogleNotice] = useState(false);

  const emailState: FieldState = emailError ? 'error' : emailTouched && email ? 'success' : 'neutral';
  const passwordState: FieldState = passwordError ? 'error' : passwordTouched && password ? 'success' : 'neutral';

  const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';

  function handleEmailBlur() {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (emailTouched) setEmailError(validateEmail(value));
  }

  function handlePasswordBlur() {
    setPasswordTouched(true);
    setPasswordFocused(false);
    setPasswordError(validatePassword(password, mode));
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (passwordTouched) setPasswordError(validatePassword(value, mode));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password, mode);
    setEmailTouched(true);
    setPasswordTouched(true);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'signup' ? { name: name || undefined, email, password } : { email, password }),
      });
      const json = await res.json();

      if (!json.ok) {
        setFormError(json.error?.message ?? 'Something went wrong. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Signup always gates through onboarding first; login can return
      // straight to wherever the user came from (e.g. a scholarship they
      // tried to save while signed out).
      router.push(mode === 'login' && next ? next : json.data.onboarded ? '/dashboard' : '/onboarding');
      router.refresh();
    } catch {
      setFormError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormShell className="flex flex-col gap-16">
        {mode === 'signup' && (
          <Input
            label="Full name"
            name="name"
            autoComplete="name"
            enterKeyHint="next"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <Input
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          enterKeyHint="next"
          required
          state={emailState}
          error={emailTouched ? emailError : undefined}
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          onBlur={handleEmailBlur}
        />
        <div className="flex flex-col gap-8">
          <PasswordInput
            label="Password"
            name="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            enterKeyHint="done"
            required
            minLength={mode === 'signup' ? 8 : undefined}
            state={passwordState}
            error={passwordTouched ? passwordError : undefined}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={handlePasswordBlur}
          />
          {mode === 'signup' && (
            <PasswordRequirements
              password={password}
              visible={passwordFocused || (passwordTouched && Boolean(passwordError))}
            />
          )}
        </div>
      </FormShell>

      {formError && (
        <p role="alert" className="mt-16 text-danger" style={{ font: 'var(--font-body-small)' }}>
          {formError}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="mt-16 w-full sm:w-full"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (mode === 'signup' ? 'Creating account…' : 'Logging in…') : mode === 'signup' ? 'Create account' : 'Log in'}
      </Button>

      <div className="mt-24 flex items-center gap-16" role="separator" aria-hidden="true">
        <span className="h-1 flex-1 bg-border" />
        <span className="text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
          or
        </span>
        <span className="h-1 flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="mt-24 w-full sm:w-full gap-8"
        onClick={() => setGoogleNotice(true)}
      >
        <GoogleIcon />
        Continue with Google
      </Button>
      {googleNotice && (
        <p role="status" className="mt-8 text-center text-ink-muted" style={{ font: 'var(--font-body-small)' }}>
          Google sign-in isn&rsquo;t available yet. Use email for now.
        </p>
      )}
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
