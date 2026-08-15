import type { ButtonHTMLAttributes } from "react";

import {
  getButtonClassName,
  type ButtonSize,
  type ButtonVariant,
} from "./button-styles";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export function Button({
  className,
  size = "medium",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={getButtonClassName(variant, size, className)}
      data-size={size}
      data-variant={variant}
      type={type}
      {...props}
    />
  );
}
