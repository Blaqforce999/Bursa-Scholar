'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LogoutConfirmModal } from '@/components/app/LogoutConfirmModal';

export function LogoutButton() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" size="sm" className="px-16" onClick={() => setIsConfirmOpen(true)}>
        Log out
      </Button>
      <LogoutConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} />
    </>
  );
}
