import { Badge, type BadgeVariant } from "@rahulyadev/design-system";

import type { ProjectStatus } from "../../domain/content";

const statusPresentation: Record<
  ProjectStatus,
  { readonly label: string; readonly variant: BadgeVariant }
> = {
  wip: { label: "WIP", variant: "neutral" },
  beta: { label: "Beta", variant: "accent" },
  live: { label: "Live", variant: "positive" },
};

export function ProjectStatusBadge({
  status,
}: {
  readonly status: ProjectStatus;
}) {
  const presentation = statusPresentation[status];

  return (
    <Badge
      className="project-status"
      data-status={status}
      variant={presentation.variant}
    >
      {presentation.label}
    </Badge>
  );
}
