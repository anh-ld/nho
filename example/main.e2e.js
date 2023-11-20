// @ts-check
import { expect, test } from "@playwright/test";

const delay = (m = 1000) => new Promise((r) => setTimeout(r, m));

test("has correct title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Nho Example/);
});

test("has correct labels", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText(/Albums/);

  const inputPlaceholderText = await page
    .locator("input")
    .getAttribute("placeholder");
  await expect(inputPlaceholderText).toBe("Search album");
});

test("opens selected album on click", async ({ page }) => {
  await page.goto("/");

  // opens the first album
  await page.locator("button").first().click();
  await delay(1000);

  await expect(page.locator(".selected-title h1")).toHaveText("Album 1 images");
  await expect(page.locator(".selected-close")).toBeVisible();

  // closes
  await page.locator("button.selected-close").click();
  await expect(page.locator(".selected-close")).toBeHidden();
});

test("searches albums", async ({ page }) => {
  await page.goto("/");

  // search
  await page.locator("input").fill("omnis");
  await delay(1000);

  await expect(page.locator(".album-item").first().locator("div")).toHaveText(
    "omnis laborum odio",
  );
});
