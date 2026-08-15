import type { HTMLAttributes } from "react";

export const BADGE_VARIANTS = ["neutral", "accent", "positive"] as const;
export type BadgeVariant = (typeof BADGE_VARIANTS)[number];

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={["ui-badge", className].filter(Boolean).join(" ")}
      data-variant={variant}
      {...props}
    />
  );
}
