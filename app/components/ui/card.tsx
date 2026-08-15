import type { HTMLAttributes } from "react";

export const CARD_VARIANTS = ["outlined", "raised", "subtle"] as const;
export type CardVariant = (typeof CARD_VARIANTS)[number];

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "article" | "div" | "section";
  padding?: "compact" | "default" | "spacious";
  variant?: CardVariant;
}

export function Card({
  as: Element = "article",
  className,
  padding = "default",
  variant = "outlined",
  ...props
}: CardProps) {
  return (
    <Element
      className={["ui-card", className].filter(Boolean).join(" ")}
      data-padding={padding}
      data-variant={variant}
      {...props}
    />
  );
}
