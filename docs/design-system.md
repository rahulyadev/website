# Design system

The frontend-v1 visual foundation was established on `2026-08-15`. This migration branch consumes its reusable primitives, theme utilities, and opt-in CSS from the exact public npm release `@rahulyadev/design-system@1.0.0`.

## Visual principles

The system uses a modern editorial-engineering direction: strong typographic hierarchy, a precise responsive grid, generous whitespace, warm neutral surfaces, and a restrained blue accent. Borders and depth are subtle, and motion is minimal and purposeful. Decorative gradients, glass effects, fake terminal interfaces, generic developer illustration, excessive card layouts, and legacy presentation are outside this direction.

## Tokens

CSS custom properties from `@rahulyadev/design-system/tokens.css` are the reusable source of truth. They cover light and dark semantic colors; system-first font families, weights, fluid type, line height, and tracking; spacing; radii; borders; shadows; motion duration and easing; reading and layout widths; page gutters; grid settings; breakpoints; focus rings; control sizing; and layering.

Components consume semantic roles such as surface, text, accent, border, and focus rather than isolated palette values. Future styles should extend an existing semantic category or introduce a broadly reusable role instead of embedding feature-specific colors.

## Themes

The supported preferences are `light`, `dark`, and `system`. `ThemeProvider` from `@rahulyadev/design-system/theme` persists the selected preference, resolves the effective system theme, responds to operating-system changes while system mode is active, and applies both the preference and effective theme to the document root.

`app/theme-config.ts` owns the portfolio-specific storage key `rahuly-theme-preference` and generates the inline bootstrap with `createThemeBootstrapScript`. The same key is passed to `ThemeProvider`. The bootstrap runs in the document head before the first theme-consuming stylesheet, safely reads the persisted preference, resolves system mode, sets the root theme attributes, and applies the matching `color-scheme` before visible rendering. Invalid or unavailable storage falls back to system mode. Content Security Policy remains an application responsibility.

The reference surface remains available only during `npm run dev` at `/?preview=design-system`; it is not part of production routes or browser assets.

## Package public API

Import reusable primitives, their public types, and finite option constants from the package root:

- `Button`
- `LinkButton`
- `Container`
- `Section`
- `SectionHeading`
- `Card`
- `Badge`
- `IconButton`
- `SkipLink`
- `VisuallyHidden`

Import `ThemeToggle`, `ThemeProvider`, `useTheme`, bootstrap utilities, and theme types only from `@rahulyadev/design-system/theme`. Keep the provider at the application root; `ThemeToggle` must render within it. Do not use package source paths or undeclared deep imports. Components retain native element semantics, so callers remain responsible for meaningful labels, links, button intent, and heading order.

```tsx
import {
  Button,
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@rahulyadev/design-system";

export function ExampleSection() {
  return (
    <Section>
      <Container width="content">
        <SectionHeading
          eyebrow="Selected work"
          title="Systems built for change"
          description="A concise section introduction."
        />
        <Button>Open details</Button>
        <LinkButton href="/projects" variant="secondary">
          View projects
        </LinkButton>
      </Container>
    </Section>
  );
}
```

## CSS order

`app/app.css` keeps the framework reset first, followed by the three separate package stylesheets, then portfolio-owned application styles:

```css
@import "tailwindcss";
@import "@rahulyadev/design-system/tokens.css";
@import "@rahulyadev/design-system/base.css";
@import "@rahulyadev/design-system/primitives.css";
@import "./styles/site-shell.css";
@import "./styles/home.css";
@import "./styles/professional.css";
@import "./styles/projects.css";
@import "./styles/writings.css";
```

JavaScript does not import package CSS. The portfolio owns the effective import order and all styles after the reusable primitive layer.

## Accessibility and motion

Interactive elements use a shared, visible `:focus-visible` treatment and touch-friendly minimum targets. Do not remove the focus ring without supplying an equally visible semantic replacement. Preserve native keyboard behavior; the three-mode theme control additionally implements roving radio focus.

Reduced-motion preferences collapse token-driven durations and global animation and transition durations. New motion must use the motion tokens, communicate hierarchy or state, and remain understandable when motion is removed.

## Responsive layout

Build mobile-first with `Container`, `Section`, shared page gutters, content widths, the twelve-column grid, and the documented breakpoint tokens. Keep prose to the reading measure, allow layouts to reflow at narrow widths and 200% zoom, preserve minimum control sizes, and prevent horizontal overflow. Breakpoint custom properties document the contract; media queries repeat their literal values for portable CSS behavior.

## Adoption rules

All future portfolio sections and presentation work should use this package boundary rather than introduce parallel reusable tokens or primitives. Feature-specific components should be composed from these primitives only when a real section requires them.

Portfolio layouts, routes, content, SEO, shell behavior, domain components, and application styles remain application-owned. The dependency is pinned to the verified registry release `1.0.0`; source adoption does not claim production deployment.
