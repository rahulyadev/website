import type { HTMLAttributes } from "react";

export const CONTAINER_WIDTHS = ["content", "wide", "full"] as const;
export type ContainerWidth = (typeof CONTAINER_WIDTHS)[number];

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  width?: ContainerWidth;
}

export function Container({
  className,
  width = "wide",
  ...props
}: ContainerProps) {
  return (
    <div
      className={["ui-container", className].filter(Boolean).join(" ")}
      data-width={width}
      {...props}
    />
  );
}
