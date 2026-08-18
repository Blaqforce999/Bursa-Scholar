import { cn } from '@/lib/cn';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  elevated?: boolean;
};

export function Card({ className, elevated, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-surface-white p-24',
        elevated && 'shadow-md',
        className
      )}
      {...props}
    />
  );
}
