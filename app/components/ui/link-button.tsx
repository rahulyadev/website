import type { AnchorHTMLAttributes } from "react";

import {
  getButtonClassName,
  type ButtonSize,
  type ButtonVariant,
} from "./button-styles";

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export function LinkButton({
  className,
  size = "medium",
  variant = "primary",
  ...props
}: LinkButtonProps) {
  return (
    <a
      className={getButtonClassName(variant, size, className)}
      data-size={size}
      data-variant={variant}
      {...props}
    />
  );
}
