# Design System

Al-Infaaq UI should follow a clean shadcn-standard design system.

## Principles

- Use shared, accessible primitives before adding one-off UI.
- Prefer shadcn-style variants for buttons, cards, badges, forms, dialogs,
  tables, tabs, menus, and alerts.
- Keep dashboard screens dense, quiet, and scan-friendly.
- Use restrained stone, emerald, and neutral surfaces with clear status colors.
- Build mobile-first responsive layouts and WCAG AA contrast into the baseline.
- Keep dark mode support in the token system rather than per-screen overrides.

## Implementation Direction

- Centralize component variants in `packages/ui`.
- Keep app screens composed from shared primitives plus domain-specific layout.
- Avoid new inline component styles when a reusable primitive can express the
  same behavior.
- Validate new screens for keyboard access, semantic labels, loading states,
  empty states, and error states.
