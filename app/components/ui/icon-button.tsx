import type { ButtonHTMLAttributes } from "react";

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label"
> {
  "aria-label": string;
  variant?: "secondary" | "ghost";
}

export function IconButton({
  className,
  type = "button",
  variant = "secondary",
  ...props
}: IconButtonProps) {
  return (
    <button
      className={["ui-icon-button", className].filter(Boolean).join(" ")}
      data-variant={variant}
      type={type}
      {...props}
    />
  );
}
