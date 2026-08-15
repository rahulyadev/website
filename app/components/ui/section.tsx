import type { HTMLAttributes } from "react";

export const SECTION_SPACING = ["compact", "default", "spacious"] as const;
export type SectionSpacing = (typeof SECTION_SPACING)[number];

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: SectionSpacing;
}

export function Section({
  className,
  spacing = "default",
  ...props
}: SectionProps) {
  return (
    <section
      className={["ui-section", className].filter(Boolean).join(" ")}
      data-spacing={spacing}
      {...props}
    />
  );
}
