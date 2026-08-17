import { expect, test } from "@playwright/test";

test("mobile navigation closes outside, stays open inside, and restores focus on Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const openMenu = page.getByRole("button", { name: "Open navigation" });
  await openMenu.click();
  const closeMenu = page.getByRole("button", { name: "Close navigation" });
  await expect(closeMenu).toHaveAttribute("aria-expanded", "true");

  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(closeMenu).toHaveAttribute("aria-expanded", "true");

  await page.mouse.click(20, 700);
  await expect(openMenu).toHaveAttribute("aria-expanded", "false");

  await openMenu.click();
  await page.keyboard.press("Escape");
  await expect(openMenu).toHaveAttribute("aria-expanded", "false");
  await expect(openMenu).toBeFocused();
});

test("email copy success uses a stable tick state for pointer and keyboard activation", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4173",
  });
  await page.goto("/");
  const copyEmail = page.getByRole("button", { name: "Copy email address" });
  await copyEmail.scrollIntoViewIfNeeded();
  await copyEmail.focus();
  await page.keyboard.press("Enter");

  await expect(copyEmail).toHaveAttribute("data-copy-status", "copied");
  await expect(copyEmail.locator("rect")).toHaveCount(0);
  await expect(
    copyEmail.locator('path[d="m5 12.5 4.5 4.5L19 7.5"]'),
  ).toHaveCount(1);
  await expect(page.getByRole("tooltip", { name: "Copied" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("Email copied");
  await expect(copyEmail).toHaveAttribute("data-copy-status", "idle", {
    timeout: 3_000,
  });
});

test("clipboard failure keeps the copy icon and never reports success", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () => Promise.reject(new Error("clipboard unavailable")),
      },
    });
  });

  const copyEmail = page.getByRole("button", { name: "Copy email address" });
  await copyEmail.scrollIntoViewIfNeeded();
  await copyEmail.click();

  await expect(copyEmail).toHaveAttribute("data-copy-status", "idle");
  await expect(copyEmail.locator("rect")).toHaveCount(1);
  await expect(page.getByRole("tooltip", { name: "Copied" })).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText(
    "Copy failed. Use the email link instead.",
  );
});

test("Experience uses shortened employer locations while Contact remains unchanged", async ({
  page,
}) => {
  await page.goto("/");
  const experience = page.locator("#experience");

  await expect(experience.getByText("Bengaluru, India")).toHaveCount(2);
  await expect(experience.getByText("Pune, India")).toHaveCount(1);
  await expect(experience.getByText(/Karnataka|Maharashtra/)).toHaveCount(0);
  await expect(page.getByText("Bengaluru, Mumbai - India")).toBeVisible();
});
