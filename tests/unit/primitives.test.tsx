import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Badge,
  Button,
  Card,
  Container,
  IconButton,
  LinkButton,
  Section,
  SectionHeading,
  SkipLink,
  VisuallyHidden,
} from "@rahulyadev/design-system";

describe("design-system primitives", () => {
  it("renders semantic button and link variants", () => {
    render(
      <>
        <Button disabled size="large" variant="secondary">
          Save changes
        </Button>
        <LinkButton href="/projects" variant="ghost">
          View projects
        </LinkButton>
      </>,
    );

    const button = screen.getByRole("button", { name: "Save changes" });
    const link = screen.getByRole("link", { name: "View projects" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-variant", "secondary");
    expect(button).toHaveAttribute("data-size", "large");
    expect(link).toHaveAttribute("href", "/projects");
    expect(link).toHaveAttribute("data-variant", "ghost");
  });

  it("provides structural semantics and token-led variants", () => {
    render(
      <Container width="content">
        <Section aria-label="Example section" spacing="compact">
          <SectionHeading
            as="h3"
            description={<p>Supporting context</p>}
            eyebrow="Foundation"
            title="Clear hierarchy"
          />
          <Card variant="raised">Card content</Card>
          <Badge variant="positive">Published</Badge>
        </Section>
      </Container>,
    );

    expect(screen.getByLabelText("Example section").tagName).toBe("SECTION");
    expect(screen.getByLabelText("Example section")).toHaveAttribute(
      "data-spacing",
      "compact",
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Clear hierarchy",
    );
    expect(screen.getByText("Card content").tagName).toBe("ARTICLE");
    expect(screen.getByText("Card content")).toHaveAttribute(
      "data-variant",
      "raised",
    );
    expect(screen.getByText("Published")).toHaveAttribute(
      "data-variant",
      "positive",
    );
    expect(
      screen.getByText("Clear hierarchy").closest(".ui-container"),
    ).toHaveAttribute("data-width", "content");
  });

  it("requires an accessible name for icon actions and supports disabled state", () => {
    render(
      <IconButton aria-label="Copy code" disabled>
        <svg aria-hidden="true" />
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Copy code" });
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleName("Copy code");
  });

  it("keeps visually hidden content in the accessibility tree", () => {
    render(
      <p>
        <VisuallyHidden>Current status: </VisuallyHidden>
        Ready
      </p>,
    );

    expect(screen.getByText("Current status:")).toHaveClass(
      "ui-visually-hidden",
    );
    expect(screen.getByText("Current status:")).toBeInTheDocument();
  });

  it("moves focus to its target without changing skip-link behavior", async () => {
    const user = userEvent.setup();

    render(
      <>
        <SkipLink />
        <main id="main-content" tabIndex={-1}>
          Content
        </main>
      </>,
    );

    const skipLink = screen.getByRole("link", { name: "Skip to content" });
    const main = screen.getByRole("main");

    expect(skipLink).toHaveAttribute("href", "#main-content");
    await user.click(skipLink);
    expect(main).toHaveFocus();
  });
});
