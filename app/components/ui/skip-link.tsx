import type { AnchorHTMLAttributes, MouseEvent } from "react";

export interface SkipLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  targetId?: string;
}

export function SkipLink({
  children = "Skip to content",
  className,
  onClick,
  targetId = "main-content",
  ...props
}: SkipLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    const target = document.getElementById(targetId);

    if (target) {
      event.preventDefault();
      target.focus();
    }
  };

  return (
    <a
      className={["ui-skip-link", className].filter(Boolean).join(" ")}
      href={`#${targetId}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}
