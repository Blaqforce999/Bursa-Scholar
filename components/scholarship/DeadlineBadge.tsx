import { Badge } from '@/components/ui/Badge';

const CLOSING_SOON_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

type DeadlineBadgeProps = {
  // required props first
  deadlineAt: Date | null;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
};

export function DeadlineBadge({ deadlineAt, status }: DeadlineBadgeProps) {
  // Deadline urgency is inherently wall-clock-relative and re-evaluated on
  // every server render against live data — there is no pure alternative.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const isClosed = status === 'CLOSED' || status === 'ARCHIVED' || (deadlineAt !== null && deadlineAt.getTime() < now);

  if (isClosed) {
    return <Badge tone="neutral">Closed</Badge>;
  }

  if (!deadlineAt) {
    return <Badge tone="neutral">Deadline not yet confirmed</Badge>;
  }

  const isClosingSoon = deadlineAt.getTime() - now < CLOSING_SOON_WINDOW_MS;
  const formatted = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    deadlineAt
  );

  return (
    <Badge tone={isClosingSoon ? 'danger' : 'neutral'} style={{ font: 'var(--font-data-small)' }}>
      {isClosingSoon ? `Closes ${formatted}` : `Deadline ${formatted}`}
    </Badge>
  );
}
