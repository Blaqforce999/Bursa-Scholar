import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home01Icon,
  Search01Icon,
  SparklesIcon,
  Bookmark01Icon,
  BookmarkCheck01Icon,
  GitCompareIcon,
  HelpCircleIcon,
  Cancel01Icon,
  SentIcon,
  Tick01Icon,
  ChevronRightIcon as HugeChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowLeft01Icon,
  Clock01Icon,
  Sorting01Icon,
  FilterIcon as HugeFilterIcon,
  UserCircleIcon,
  EyeIcon,
  ViewOffSlashIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Share08Icon,
  Menu01Icon,
} from '@hugeicons/core-free-icons';
import type { SVGProps } from 'react';

/**
 * Bursa's single icon source: every icon in the app renders through
 * HugeiconsIcon (the one modern icon library, already installed) at one
 * stroke weight. Two brand assets are deliberately NOT here — the Bursa
 * LogoMark and the multi-color Google "G" — because they're fixed brand
 * marks, not generic UI icons, and a generic icon would misrepresent them.
 *
 * Every export accepts a className for sizing (bind to spacing tokens,
 * e.g. h-20 w-20) rather than a fixed pixel size, so one icon works at
 * 16/20/24px call sites alike.
 */
type IconProps = SVGProps<SVGSVGElement>;

const STROKE_WIDTH = 1.8;

export function HomeIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={Home01Icon} strokeWidth={STROKE_WIDTH} />;
}

export function DiscoverIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={Search01Icon} strokeWidth={STROKE_WIDTH} />;
}

export function SearchIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={Search01Icon} strokeWidth={STROKE_WIDTH} />;
}

export function SparkIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={SparklesIcon} strokeWidth={STROKE_WIDTH} />;
}

export function SavedIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={Bookmark01Icon} strokeWidth={STROKE_WIDTH} />;
}

export function CompareIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={GitCompareIcon} strokeWidth={STROKE_WIDTH} />;
}

export function HelpIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={HelpCircleIcon} strokeWidth={STROKE_WIDTH} />;
}

export function CloseIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={Cancel01Icon} strokeWidth={STROKE_WIDTH} />;
}

export function SendIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={SentIcon} strokeWidth={STROKE_WIDTH} />;
}

export function CheckIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={Tick01Icon} strokeWidth={STROKE_WIDTH} />;
}

export function ChevronRightIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={HugeChevronRightIcon} strokeWidth={STROKE_WIDTH} />;
}

export function ChevronUpIconCmp(props: IconProps) {
  return <HugeiconsIcon {...props} icon={ChevronUpIcon} strokeWidth={STROKE_WIDTH} />;
}

export function ChevronDownIconCmp(props: IconProps) {
  return <HugeiconsIcon {...props} icon={ChevronDownIcon} strokeWidth={STROKE_WIDTH} />;
}

export function BackArrowIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={ArrowLeft01Icon} strokeWidth={STROKE_WIDTH} />;
}

export function ClockIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={Clock01Icon} strokeWidth={STROKE_WIDTH} />;
}

export function SortIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={Sorting01Icon} strokeWidth={STROKE_WIDTH} />;
}

export function FilterIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={HugeFilterIcon} strokeWidth={STROKE_WIDTH} />;
}

export function UserIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={UserCircleIcon} strokeWidth={STROKE_WIDTH} />;
}

export function EyeOpenIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={EyeIcon} strokeWidth={STROKE_WIDTH} />;
}

export function EyeClosedIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={ViewOffSlashIcon} strokeWidth={STROKE_WIDTH} />;
}

export function SuccessIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={CheckmarkCircle02Icon} strokeWidth={STROKE_WIDTH} />;
}

export function ErrorIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={AlertCircleIcon} strokeWidth={STROKE_WIDTH} />;
}

export function ShareIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={Share08Icon} strokeWidth={STROKE_WIDTH} />;
}

export function MenuIcon(props: IconProps) {
  return <HugeiconsIcon {...props} icon={Menu01Icon} strokeWidth={STROKE_WIDTH} />;
}

/** The dashboard/discover save control. No solid-fill variant exists in
 *  the free set (it's a stroke-only family), so the saved state swaps to
 *  a distinct check-bookmark glyph rather than relying on color alone. */
export function BookmarkIcon({ filled, ...props }: IconProps & { filled?: boolean }) {
  return <HugeiconsIcon {...props} icon={filled ? BookmarkCheck01Icon : Bookmark01Icon} strokeWidth={STROKE_WIDTH} />;
}
