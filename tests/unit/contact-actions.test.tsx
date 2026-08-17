import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContactActions } from "../../app/components/home/contact-actions";

const contacts = [
  {
    href: "mailto:hello@example.test",
    kind: "email" as const,
    label: "hello@example.test",
  },
  {
    href: "tel:+12025550100",
    kind: "phone" as const,
    label: "+1 202 555 0100",
  },
];

const resume = {
  downloadName: "example-resume.pdf",
  path: "/assets/resume/example-resume.pdf",
  title: "Example resume",
};

const socialLinks = [
  {
    label: "GitHub",
    platform: "github",
    url: "https://github.com/example",
  },
  {
    label: "LinkedIn",
    platform: "linkedin",
    url: "https://linkedin.com/in/example",
  },
];

function setClipboard(writeText: (value: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}

afterEach(() => {
  Reflect.deleteProperty(navigator, "clipboard");
});

describe("ContactActions", () => {
  it("renders semantic contact details, compact actions, and approved outbound behavior", async () => {
    const writeText = vi.fn<(value: string) => Promise<void>>(() =>
      Promise.resolve(),
    );
    const user = userEvent.setup();
    setClipboard(writeText);
    const { container } = render(
      <ContactActions
        contacts={contacts}
        location="London, United Kingdom"
        resume={resume}
        socialLinks={socialLinks}
      />,
    );

    expect(
      screen.getByRole("link", { name: "hello@example.test" }),
    ).toHaveAttribute("href", "mailto:hello@example.test");
    expect(
      screen.getByRole("link", { name: "+1 202 555 0100" }),
    ).toHaveAttribute("href", "tel:+12025550100");
    expect(screen.getByText("London, United Kingdom")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /show phone/i }),
    ).not.toBeInTheDocument();
    expect(
      [...container.querySelectorAll(".contact-actions__row > dt")].map(
        (label) => label.textContent,
      ),
    ).toEqual(["Email", "Phone", "Profiles", "Location"]);

    for (const label of ["GitHub", "LinkedIn"]) {
      const link = screen.getByRole("link", {
        name: `${label} (opens in a new tab)`,
      });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(within(link).getByRole("tooltip", { name: label })).toHaveClass(
        "contact-actions__social-tooltip",
      );
      expect(link).toHaveAccessibleDescription(label);
      expect(link.querySelector(".contact-actions__social-label")).toBeNull();
      expect(link.querySelector("svg")).not.toBeNull();
      expect(
        link.querySelector(".contact-actions__social-icon"),
      ).not.toBeNull();
    }

    const resumeLink = screen.getByRole("link", { name: "Download resume" });
    expect(resumeLink).toHaveAttribute("download", "example-resume.pdf");
    const profileRow = container.querySelector(".contact-actions__profile-row");
    expect(profileRow?.firstElementChild).toBe(resumeLink);
    expect(
      [
        ...(profileRow?.querySelectorAll(".contact-actions__social-link") ??
          []),
      ].map((link) => link.getAttribute("aria-label")),
    ).toEqual(["GitHub (opens in a new tab)", "LinkedIn (opens in a new tab)"]);
    expect(container.querySelector("form")).toBeNull();

    const copyButton = screen.getByRole("button", {
      name: "Copy email address",
    });
    expect(copyButton).toHaveAccessibleDescription("Copy email");
    expect(screen.getByRole("tooltip", { name: "Copy email" })).toBeVisible();
    await user.click(copyButton);
    expect(writeText).toHaveBeenCalledWith("hello@example.test");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Email address copied.",
    );
  });

  it("announces a useful fallback when clipboard access fails", async () => {
    const user = userEvent.setup();
    setClipboard(() => Promise.reject(new Error("unavailable")));
    render(
      <ContactActions
        contacts={contacts}
        location="London, United Kingdom"
        resume={resume}
        socialLinks={socialLinks}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Copy email address" }),
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Copy failed. Use the email link instead.",
    );
  });
});
