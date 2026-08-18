import { Badge } from '@/components/ui/Badge';
import { FUNDING_LEVEL_LABELS } from '@/lib/constants';
import type { FundingLevel } from '@prisma/client';

type FundingBadgeProps = {
  // required props first
  level: FundingLevel;
};

export function FundingBadge({ level }: FundingBadgeProps) {
  return <Badge tone="warning">{FUNDING_LEVEL_LABELS[level]}</Badge>;
}
