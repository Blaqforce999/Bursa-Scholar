'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <Button variant="secondary" size="sm" className="px-16" onClick={handleLogout} disabled={isSubmitting}>
      {isSubmitting ? 'Logging out…' : 'Log out'}
    </Button>
  );
}
