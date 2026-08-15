import type { HTMLAttributes, ReactNode } from "react";

export interface SectionHeadingProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  align?: "start" | "center";
  as?: "h2" | "h3";
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
}

export function SectionHeading({
  align = "start",
  as: Heading = "h2",
  className,
  description,
  eyebrow,
  title,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={["ui-section-heading", className].filter(Boolean).join(" ")}
      data-align={align}
      {...props}
    >
      {eyebrow ? (
        <p className="ui-section-heading__eyebrow">{eyebrow}</p>
      ) : null}
      <Heading className="ui-section-heading__title">{title}</Heading>
      {description ? (
        <div className="ui-section-heading__description">{description}</div>
      ) : null}
    </div>
  );
}
