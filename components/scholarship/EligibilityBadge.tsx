import { Badge } from '@/components/ui/Badge';
import type { EligibilityResult } from '@/lib/eligibility';

type EligibilityBadgeProps = {
  // required props first
  result: EligibilityResult | null;
};

export function EligibilityBadge({ result }: EligibilityBadgeProps) {
  if (!result) return null;

  if (result.state === 'ELIGIBLE') return <Badge tone="success">Eligible</Badge>;
  if (result.state === 'NOT_ELIGIBLE') return <Badge tone="neutral">Not eligible</Badge>;
  return <Badge tone="neutral">Partial match</Badge>;
}
