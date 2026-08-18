import Link from 'next/link';
import type { VariantProps } from 'class-variance-authority';
import { button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

type ButtonLinkProps = React.ComponentProps<typeof Link> &
  VariantProps<typeof button> & { className?: string };

export function ButtonLink({ variant, size, className, style, ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(button({ variant, size }), className)}
      style={{ font: 'var(--font-button-label)', letterSpacing: 'var(--font-button-label-letter-spacing)', ...style }}
      {...props}
    />
  );
}
