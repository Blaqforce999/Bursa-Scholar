# Component Builder Skill

Load this skill for any task that builds or changes a UI component in Bursa. It is the source of truth for how components are shaped, styled, and made accessible. Do not build components from memory; the patterns here keep the codebase consistent and keep scholarship pages fast on low-end devices.

Read `.agents/rules/design-system.md` and `.agents/rules/code-style.md` alongside this skill — this skill assumes both.

## What This Skill Covers

- The standard component file shape.
- When a component is a server component vs. a client component.
- How to handle variants with `class-variance-authority` (`cva`).
- How to use the design tokens (CSS variables) instead of hardcoded values.
- Accessibility defaults.
- The Bursa-specific components you will build most often.

## Where Components Live

- Primitive (Button, Input, Badge, Card) → `components/ui/`
- Scholarship domain (ScholarshipCard, EligibilityBadge, DeadlineBadge, FundingBadge) → `components/scholarship/`
- Dashboard-only (SavedList, CompareTray) → `components/dashboard/`
- Admin-only (curation forms, verify controls) → `components/admin/`
- Composite used across domains (EmptyState, PageHeader, FilterChip) → `components/shared/`
- Used exactly once in a page and complex → `app/.../_components/` alongside that page

## Component Template

Every component starts from this shape: a named export, a `type` for props, a `className` prop merged with `cn()`.

```tsx
import { cn } from '@/lib/cn';

type ScholarshipCardProps = {
  // required props first
  title: string;
  provider: string;
  // optional props after
  className?: string;
};

export function ScholarshipCard({ title, provider, className }: ScholarshipCardProps) {
  return (
    <article className={cn('rounded-xl border border-border bg-surface-warm p-4', className)}>
      {/* ... */}
    </article>
  );
}
```

Rules:
- **Named export, never default.**
- Always accept `className` and merge it with `cn()` so the component composes.
- Required props first, optional props after, in the type.
- No `any`. Use `unknown` + a type guard if you truly don't know the shape.

## Server vs. Client

Default to a **server component**. Add `"use client"` only if the component actually needs state, effects, browser APIs, or real event handlers. If you are unsure, start without `"use client"` and let TypeScript tell you when you need it.

This is not a style preference in Bursa — it is a performance requirement. The feed and scholarship pages must work on weak connections and low-end Android devices, so every unnecessary client component is a cost the student pays. A card that only displays data is a server component; a `CompareTray` that manages selection is a client component.

## Design Tokens, Not Hardcoded Values

Style with Tailwind classes backed by the design tokens (CSS variables). Never reach for a raw hex or arbitrary pixel value:

- Colors: `bg-surface-warm`, `text-ink-indigo`, `text-ink-muted`, `text-eligible`, `text-danger` (for deadline urgency).
- Spacing, radius, borders: use the token-backed scale, not arbitrary values.
- If you find yourself typing `text-[#5A6270]` or `p-[13px]`, stop — there is almost certainly a token. If there genuinely isn't one, ask the developer. Do not invent tokens.

## Variants with `cva`

If a component has variants (sizes, colors, styles), use `class-variance-authority`. Do not stack conditional class strings.

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const button = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition focus-visible:ring-2 focus-visible:ring-brand',
  {
    variants: {
      variant: {
        primary: 'bg-ink-indigo text-white',
        secondary: 'bg-surface-warm text-ink-indigo border border-border',
        ghost: 'text-ink-indigo hover:bg-surface-warm',
        danger: 'bg-danger text-white', // admin destructive actions only
      },
      size: { sm: 'h-9 px-3 text-body-sm', md: 'h-11 px-4 text-body', lg: 'h-12 px-6 text-body' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & { className?: string };

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}
```

## Accessibility Defaults

Wire these every time, not as an afterthought:

- Interactive elements get a visible focus state (`focus-visible:ring-2 focus-visible:ring-brand`).
- Icon-only buttons get an `aria-label`.
- Form inputs get associated labels above the field; error text is linked with `aria-describedby`.
- Provider logos use the provider name as `alt`; decorative images use `alt=""`.
- Touch targets on mobile are at least 44px.

## Bursa-Specific Components

You will build these repeatedly. Keep them consistent — they carry most of the product's meaning.

- **ScholarshipCard** — the unit of discovery. Provider + logo, title, FundingBadge, study level, host country, DeadlineBadge, Save control, and EligibilityBadge (only when a profile exists). Server component. Must be scannable in under a second and must never claim what the detail page can't support.
- **DeadlineBadge** — open (muted), closing soon (Reserved Red urgency), closed (muted, no active apply). Reflects maintained deadline data only. Never a fake countdown.
- **EligibilityBadge** — "Eligible for you" (green), "Partial match" (muted), or nothing when there's no profile. Never implies guaranteed acceptance.
- **FundingBadge** — Full / Partial / Tuition-only / Stipend.
- **FilterChip** — a removable active-filter chip; supports remove-one and clear-all.
- **CompareTray** — client component holding the 2–4 selected scholarships; prevents a 5th selection until one is removed.
- **EmptyState** — the "no results / loosen your filters" surface and the "no saved scholarships yet" surface. Empty and loading states are first-class in Bursa; build them, don't leave blank screens or spinners.

## Common Mistakes

- Marking a display-only card `"use client"`. If there's no state, effect, handler, or browser API, it's a server component.
- Hardcoding colors or pixel values instead of using tokens.
- Building a second slightly-different `Button` instead of adding a variant to the existing one.
- Forgetting the empty and loading states, especially on the feed and saved list.
- Faking urgency in a DeadlineBadge. Only real, maintained deadline data drives the urgency state.
- Leaving a `console.log` behind. Use `lib/logger.ts`.

## Verify Before Committing

- [ ] Named export, `className` accepted and merged with `cn()`.
- [ ] No hardcoded colors or pixel values; tokens only.
- [ ] No `any`.
- [ ] No `"use client"` unless actually needed.
- [ ] Renders correctly at 360px width.
- [ ] Focus state visible; icon-only controls have `aria-label`.
- [ ] Empty and loading states handled where relevant.
