'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ShareIcon, CheckIcon } from '@/components/shared/icons';

type ShareButtonProps = {
  // required props first
  title: string;
};

export function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button type="button" variant="ghost" size="md" onClick={handleShare} className="gap-6">
      {copied ? <CheckIcon className="h-16 w-16" /> : <ShareIcon className="h-16 w-16" />}
      {copied ? 'Link copied' : 'Share'}
    </Button>
  );
}
