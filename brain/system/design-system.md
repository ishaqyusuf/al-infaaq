# Design System

Al-Infaaq UI should follow a clean shadcn-standard design system.

## Principles

- Use shared, accessible primitives before adding one-off UI.
- Prefer shadcn-style variants for buttons, cards, badges, forms, dialogs,
  tables, tabs, menus, and alerts.
- Command links that visually behave like buttons must use shared
  `buttonVariants` instead of handcrafted inline-flex/button class strings.
- Keep dashboard screens dense, quiet, and scan-friendly.
- Keep card-like surfaces at `rounded-lg` or smaller. Oversized card corner
  radii such as `rounded-xl`, `rounded-2xl`, and `rounded-3xl` are blocked by
  architecture guardrails unless a future Brain decision documents an exception.
- Use restrained stone, emerald, and neutral surfaces with clear status colors.
- Build mobile-first responsive layouts and WCAG AA contrast into the baseline.
- Keep dark mode support in the token system rather than per-screen overrides.
- App pages must use tokenized shell classes such as `bg-background` and
  `text-foreground` for page-level surfaces instead of hardcoded hex
  backgrounds.
- Use valid Tailwind color shade steps only. Non-standard midpoint shade names
  such as `emerald-450`, `emerald-650`, `stone-250`, or `red-750` silently drop
  intended states and are blocked by the architecture guardrails.

## Implementation Direction

- Centralize component variants in `packages/ui`.
- Keep app screens composed from shared primitives plus domain-specific layout.
- Avoid new inline component styles when a reusable primitive can express the
  same behavior.
- Validate new screens for keyboard access, semantic labels, loading states,
  empty states, and error states.
