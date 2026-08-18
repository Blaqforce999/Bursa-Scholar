# Workflow: Creating a New Component

Follow this workflow when you need to build a new React component for Bursa. It chains the relevant rules and skills together so you end up with something that fits the codebase and stays fast on the low-end devices our students use.

## Before You Touch Any File

**Step 1. Check whether the component already exists.**

Search `components/` for anything with a similar name or purpose. If a similar component exists, the right move is almost always to extend it (add a variant, add a prop) rather than create a new one. Two slightly different `Button` components is the start of a mess.

**Step 2. Decide where it goes.**

- Primitive (Button, Input, Badge, Card) → `components/ui/`
- Scholarship domain (ScholarshipCard, EligibilityBadge, DeadlineBadge, FundingBadge) → `components/scholarship/`
- Dashboard only (SavedList, CompareTray) → `components/dashboard/`
- Admin only (curation forms, verify controls) → `components/admin/`
- Composite used in multiple domains (EmptyState, PageHeader, FilterChip) → `components/shared/`
- Used exactly once in a page and complex → `app/.../_components/` alongside that page

**Step 3. Load the right context.**

Open and read these files in order:

1. `.agents/rules/design-system.md` — the tokens (CSS variables), spacing, typography, and component patterns.
2. `.agents/rules/code-style.md` — naming, file organization, TypeScript conventions.
3. `skills/component-builder/SKILL.md` — the component template and the variant patterns.

Do not skip these. They are short and they are the difference between a component that fits and one that does not.

## Build It

**Step 4. Create the file.**

Use the template from `skills/component-builder/SKILL.md`. The shape is:

```tsx
import { cn } from '@/lib/cn';

type ComponentNameProps = {
  // required props first
  // optional props after
  className?: string;
};

export function ComponentName({ /* ... */, className }: ComponentNameProps) {
  return (
    <div className={cn('base-classes-here', className)}>
      {/* ... */}
    </div>
  );
}
```

**Step 5. Decide server vs. client.**

Default to a server component. Add `"use client"` only if the component actually needs state, effects, browser APIs, or real event handlers. If you are unsure, start without `"use client"` and let TypeScript tell you if you need it. Remember: on Bursa this is a performance decision, not a preference — the student pays for every unnecessary client component on a slow connection.

**Step 6. Style with design tokens.**

Tailwind classes, no inline styles, no custom CSS. Use the token-backed classes (`bg-surface-warm`, `text-ink-indigo`, `text-ink-muted`, `text-eligible`, `text-danger`). If you find yourself reaching for an arbitrary value like `text-[#5A6270]` or `p-[13px]`, pause and check whether there is a token for it. There almost always is. If there genuinely isn't, ask the developer — do not invent tokens.

**Step 7. Handle variants with `cva` if needed.**

If the component has variants (sizes, colors, styles), use `class-variance-authority`. See the Button example in `skills/component-builder/SKILL.md`. Do not stack conditional class strings.

**Step 8. Wire accessibility.**

- Interactive elements get a visible focus state (`focus-visible:ring-2 focus-visible:ring-brand`).
- Icon-only buttons get `aria-label`.
- Form inputs get associated labels above the field.
- Provider logos get the provider name as `alt` text; decorative images get `alt=""`.

**Step 9. Handle the empty and loading states.**

Bursa treats empty and loading states as first-class. If the component can render with no data (a feed, a saved list, a filtered result set), build the "no results / loosen filters" and skeleton states now — do not leave a blank screen or a spinner on the critical path.

## Check Your Work

**Step 10. Manually verify.**

If it is a primitive, import it into `app/_dev/page.tsx` and render every variant, size, and state. View it at 360px viewport width in Chrome DevTools. Tab into it to check the focus state. Hover over it.

If it is a domain component, view it in the page that uses it. Resize to mobile. Check keyboard navigation. For a DeadlineBadge, confirm the urgency state comes only from real deadline data. For an EligibilityBadge, confirm it shows nothing when there is no profile.

**Step 11. Cross-check against the rules.**

- [ ] Named export, not default.
- [ ] `className` prop accepted and merged with `cn()`.
- [ ] No hardcoded colors or pixel values — tokens only.
- [ ] No `any` types.
- [ ] No `"use client"` unless actually needed.
- [ ] Works on a 360px-wide screen.
- [ ] Focus state visible; icon-only controls labelled.
- [ ] Empty / loading states handled where relevant.
- [ ] No `console.log` left behind.

**Step 12. Commit.**

Descriptive commit message. If the component is non-trivial, mention the intended use case in the message body so future you or future agents know why it exists.

## When Things Go Wrong

If you are stuck on something that does not fit the design system, do not invent new tokens or patterns. Ask the developer. The whole point of a design system — especially one built on locked CSS variables — is that it does not grow unchecked.
