# Design system

Approved on `2026-08-15` for the frontend-v1 portfolio.

## Visual principles

The system uses a modern editorial-engineering direction: strong typographic hierarchy, a precise responsive grid, generous whitespace, warm neutral surfaces, and a restrained blue accent. Borders and depth are subtle, and motion is minimal and purposeful. Decorative gradients, glass effects, fake terminal interfaces, generic developer illustration, excessive card layouts, and legacy presentation are outside the approved direction.

## Tokens

CSS custom properties in `app/styles/tokens.css` are the portable source of truth. They cover light and dark semantic colors; system-first font families, weights, fluid type, line height, and tracking; spacing; radii; borders; shadows; motion duration and easing; reading and layout widths; page gutters; grid settings; breakpoints; focus rings; control sizing; and layering.

Components consume semantic roles such as surface, text, accent, border, and focus rather than isolated palette values. Future styles should extend an existing semantic category or introduce a broadly reusable role instead of embedding feature-specific colors.

## Themes

The supported preferences are `light`, `dark`, and `system`. `ThemeProvider` persists the selected preference, resolves the effective system theme, responds to operating-system changes while system mode is active, and applies both the preference and effective theme to the document root.

An inline bootstrap runs in the document head before stylesheets. It safely reads the persisted preference, resolves system mode, sets the root theme attributes, and applies the matching `color-scheme` before visible rendering. Invalid or unavailable storage falls back to system mode. The bootstrap and provider are safe during static builds and hydration.

The approved reference surface remains available only during `npm run dev` at `/?preview=design-system`; it is not part of production routes or browser assets.

## Local public API

Import primitives from `app/components/ui`:

- `Button`
- `LinkButton`
- `Container`
- `Section`
- `SectionHeading`
- `Card`
- `Badge`
- `IconButton`
- `ThemeToggle`
- `SkipLink`
- `VisuallyHidden`

Import theme utilities, types, `ThemeProvider`, and `useTheme` from `app/theme`. Keep the provider at the application root; `ThemeToggle` must render within it. Components retain native element semantics, so callers remain responsible for meaningful labels, links, button intent, and heading order.

```tsx
import {
  Button,
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "../components/ui";

export function ExampleSection() {
  return (
    <Section>
      <Container width="content">
        <SectionHeading
          eyebrow="Selected work"
          title="Systems built for change"
          description="A concise, approved section introduction."
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

## Accessibility and motion

Interactive elements use a shared, visible `:focus-visible` treatment and touch-friendly minimum targets. Do not remove the focus ring without supplying an equally visible semantic replacement. Preserve native keyboard behavior; the three-mode theme control additionally implements roving radio focus.

Reduced-motion preferences collapse token-driven durations and global animation and transition durations. New motion must use the motion tokens, communicate hierarchy or state, and remain understandable when motion is removed.

## Responsive layout

Build mobile-first with `Container`, `Section`, shared page gutters, content widths, the twelve-column grid, and the documented breakpoint tokens. Keep prose to the reading measure, allow layouts to reflow at narrow widths and 200% zoom, preserve minimum control sizes, and prevent horizontal overflow. Breakpoint custom properties document the contract; media queries repeat their literal values for portable CSS behavior.

## Adoption rules

All future portfolio sections and presentation work must use this system rather than introduce parallel tokens or one-off component styling. Feature-specific components should be composed from these primitives only when a real section requires them.

Keep the system local to this application. Extraction into a separate package must wait until a second application proves the abstraction and its public boundary.
