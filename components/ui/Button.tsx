import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const button = cva(
  'inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-indigo focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-ink-indigo text-inverse hover:bg-ink-indigo-light active:bg-ink-indigo-dark',
        secondary:
          'bg-surface-warm text-ink-indigo border border-border hover:bg-surface-warm-light',
        ghost: 'bg-transparent text-ink-indigo hover:bg-surface-warm-light',
        danger: 'bg-danger text-inverse hover:opacity-90',
      },
      size: {
        sm: 'h-36 px-12',
        md: 'h-44 px-16',
        lg: 'h-56 px-24 w-full sm:w-auto',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & { className?: string };

export function Button({ variant, size, className, style, ...props }: ButtonProps) {
  return (
    <button
      className={cn(button({ variant, size }), className)}
      style={{ font: 'var(--font-button-label)', letterSpacing: 'var(--font-button-label-letter-spacing)', ...style }}
      {...props}
    />
  );
}
