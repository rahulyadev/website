import { forwardRef, type ButtonHTMLAttributes } from "react";

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label"
> {
  "aria-label": string;
  variant?: "secondary" | "ghost";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { className, type = "button", variant = "secondary", ...props },
    ref,
  ) {
    return (
      <button
        className={["ui-icon-button", className].filter(Boolean).join(" ")}
        data-variant={variant}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);
