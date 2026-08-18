# Code Style Rules

These are the code-style rules for Bursa. They exist so the codebase reads the same way no matter who (or which agent) wrote a given file. Consistency matters more than personal preference.

## Language

TypeScript everywhere. No JavaScript files in `app/`, `components/`, or `lib/`. Configuration files like `next.config.mjs` and `tailwind.config.ts` are the only exceptions, and even `tailwind.config.ts` is TypeScript.

Strict mode is on. Do not disable `strict`, `noImplicitAny`, or `strictNullChecks` to make an error go away. Fix the type instead.

## Naming

- Components are `PascalCase` in `PascalCase.tsx` files. `ScholarshipCard.tsx` exports `ScholarshipCard`.
- Hooks start with `use` and live in `hooks/` or alongside the component that uses them if scoped.
- Utility functions are `camelCase` in `camelCase.ts` files.
- Constants are `SCREAMING_SNAKE_CASE` when they represent fixed configuration values, `camelCase` otherwise.
- Database models in Prisma are `PascalCase` singular: `User`, `Scholarship`, `SavedScholarship`. Table columns are `snake_case` in the database, mapped to `camelCase` in the Prisma client.
- Boolean variables read as yes/no questions: `isLoading`, `hasError`, `isEligible`, `isClosingSoon`, not `loading`, `error`, `eligible`.

## File Organization

One component per file. If a helper function is only used inside one component, define it in the same file below the component. If it gets used anywhere else, lift it to `lib/`.

Order inside a component file:
1. Imports (React first, third-party next, local last, separated by blank lines)
2. Types and interfaces
3. Constants
4. The component itself
5. Helper functions used only by this component

## TypeScript

Prefer `type` over `interface` unless you need declaration merging. Keep types close to where they are used. When a type is shared across the app, put it in `lib/types.ts` or a domain-specific types file.

Do not use `any`. If you genuinely do not know the shape of something, use `unknown` and narrow it with a type guard. `any` is a last resort and should have a comment explaining why.

Use zod for anything that comes from outside the app: form inputs, API request bodies, URL parameters, and environment variables. Do not trust the compiler's types at these boundaries, because the data comes from outside TypeScript's reach.

## React

Write function components, not class components. Use hooks. Destructure props in the function signature. Give every component an explicit return type only when it improves clarity; most of the time inference is fine.

Server components are the default. Add `"use client"` only when the component actually needs interactivity, browser APIs, or client state. If a component is marked `"use client"` but has no `useState`, `useEffect`, `onClick`, or browser-only code, it should not be a client component. This matters more here than in most apps: scholarship pages must work on weak connections and low-end devices, so every unnecessary `"use client"` is a cost the student pays.

Keep components small. If a component file is longer than about 200 lines, look for pieces to extract.

## Formatting

Prettier handles formatting. Do not argue with it. The config lives at the project root. Two-space indentation, single quotes for strings, semicolons required, trailing commas where valid.

Imports are sorted: Node built-ins, then third-party packages, then local imports (aliased with `@/`), with a blank line between each group. The ESLint config enforces this.

## Comments

Write comments that explain *why*, not *what*. The code already says what it does. If a comment is paraphrasing the line below it, delete it.

Good comment: `// A scholarship open to "all African countries" matches any African nationality; check that flag before comparing the explicit nationality list.`

Bad comment: `// Loop over the scholarships.`

JSDoc blocks are worth writing for public utility functions in `lib/`, especially anything related to eligibility matching, auth, slug generation, or validation. For internal components, the types usually tell the story.

## Error Handling

Use try/catch around anything that can throw: database calls, network calls, JSON parsing. Catch the error, log it with enough context to debug, and return the structured error response defined in `architecture.md`.

Never swallow errors silently. A bare `catch (e) {}` with no log and no rethrow is a bug waiting to happen.

Never expose raw error messages to the end user. They may contain stack traces, file paths, or database details that should not leak.

## Async Code

Prefer `async`/`await` over `.then()` chains. It reads better and makes error handling cleaner.

Do not fire off a promise without awaiting it unless you mean to. If you are intentionally running something in the background, add a comment saying so.

## Imports

Use the `@/` alias for local imports. `import { Button } from '@/components/ui/Button'`, not `import { Button } from '../../../components/ui/Button'`.

Do not import from `app/` into `components/` or `lib/`. Dependencies flow one way: `lib` is the foundation, `components` sits on top of `lib`, and `app` sits on top of both.

## Styling

Tailwind classes only, referencing the project's design tokens. No inline styles, no CSS modules, no styled-components. The color, spacing, border, typography, and gradient tokens live as CSS variables (see `design-system.md`) and are wired into `tailwind.config.ts`; use the token-backed classes rather than raw hex or arbitrary pixel values. If a pattern repeats, extract it into a component, not a CSS class.

Class order follows the standard Tailwind convention: layout, then box model, then typography, then visual. The Prettier plugin for Tailwind enforces this.

## What Not to Do

- Do not add Lodash. Modern JavaScript handles most of what people used Lodash for.
- Do not add Moment. Use `date-fns` if you need date handling — deadlines are first-class in Bursa, so date logic should be correct and testable.
- Do not add a component library (MUI, Chakra, Ant, shadcn/ui). We build our own with Tailwind and follow `design-system.md`.
- Do not leave `console.log` calls in committed code. Use the logger in `lib/logger.ts`.
- Do not add dependencies without discussing with the developer. Every dependency is a long-term cost.
