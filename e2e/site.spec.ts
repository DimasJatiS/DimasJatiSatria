import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Headless Chromium stalls on the WebGL hero, so automated runs use the `still` tier;
// motion itself is measured in real Chrome (docs/motion.md).
test("home renders server-side text in English and Indonesian", async ({ page }) => {
  await page.goto("/?motion=still");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Dimas");
  await expect(page.getByText("LONG LIVE LEARNER")).toBeVisible();
  for (const id of ["about", "work", "skills", "contact"]) await expect(page.locator(`#${id}`)).toBeAttached();

  await page.goto("/id?motion=still");
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
  await expect(page.getByText("Lihat karya", { exact: false }).first()).toBeVisible();
});

test("still tier: no pins and no hidden hero text", async ({ page }) => {
  await page.goto("/?motion=still");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "still");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("opacity", "1");
});

test("Night/Day choice persists across reloads without a flash", async ({ page, isMobile }) => {
  await page.goto("/?motion=still");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "night");
  if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("button", { name: "Day" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "day");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "day");
});

test("language toggle keeps the page", async ({ page, isMobile }) => {
  await page.goto("/?motion=still");
  if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("link", { name: "ID", exact: true }).click();
  await expect(page).toHaveURL(/\/id$/);
});

test("unknown pages return the localized 404", async ({ page }) => {
  const res = await page.goto("/id/does-not-exist?motion=still");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Jejaknya hilang" })).toBeVisible();
});

test("security headers are set", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["strict-transport-security"]).toContain("max-age=");
});

for (const theme of ["night", "day"] as const) {
  test(`no serious axe violations (${theme})`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
    await page.goto("/?motion=still");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
  });
}
