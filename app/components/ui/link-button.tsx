import { forwardRef, type AnchorHTMLAttributes } from "react";

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

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton(
    { className, size = "medium", variant = "primary", ...props },
    ref,
  ) {
    return (
      <a
        className={getButtonClassName(variant, size, className)}
        data-size={size}
        data-variant={variant}
        ref={ref}
        {...props}
      />
    );
  },
);
