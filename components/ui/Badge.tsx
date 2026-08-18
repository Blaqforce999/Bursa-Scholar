import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badge = cva('inline-flex items-center gap-4 rounded-full px-10 py-2', {
  variants: {
    tone: {
      neutral: 'bg-surface-warm-light text-ink-muted-dark',
      success: 'bg-eligible-light text-eligible',
      danger: 'bg-danger-light text-danger',
      warning: 'bg-warning-light text-warning',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badge> & { className?: string };

export function Badge({ tone, className, style, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badge({ tone }), className)}
      style={{ font: 'var(--font-caption)', letterSpacing: 'var(--font-caption-letter-spacing)', ...style }}
      {...props}
    />
  );
}
