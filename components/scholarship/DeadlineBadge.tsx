import { Badge } from '@/components/ui/Badge';
import { DEADLINE_URGENT_WINDOW_DAYS } from '@/lib/constants';

const URGENT_WINDOW_MS = DEADLINE_URGENT_WINDOW_DAYS * 24 * 60 * 60 * 1000;

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

  const isUrgent = deadlineAt.getTime() - now < URGENT_WINDOW_MS;
  const formatted = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    deadlineAt
  );

  return (
    <Badge tone={isUrgent ? 'danger' : 'neutral'} style={{ font: 'var(--font-data-small)' }}>
      {isUrgent ? `Closes ${formatted}` : `Deadline ${formatted}`}
    </Badge>
  );
}
