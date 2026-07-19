import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { test, expect } from "@playwright/test";
import { loadEnvFile } from "process";

let website = process.env.WEBSITE;

if (!website) {
  try {
    loadEnvFile();
    website = process.env.WEBSITE;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

if (!website) {
  throw new Error("WEBSITE environment variable is not set");
}

test("test", async ({ page }) => {
  await page.goto(website);
  await page.getByRole("heading", { name: "Termin" }).click();
  const page1Promise = page.waitForEvent("popup");
  await page
    .getByRole("link", { name: "Termin reservieren (Öffnet in" })
    .click();
  const page1 = await page1Promise;
  await page1.getByTestId("fieldset--16").getByRole("strong").click();
  await page1.getByTestId("fieldset--16").getByTestId("checkbox--1").check();
  await page1.waitForLoadState("domcontentloaded");
  await expect(
    page1
      .locator('[data-testid="button_next"], [data-testid="error_message-"]')
      .first(),
  ).toBeVisible({ timeout: 10000 });
  await page1.getByTestId("button_next").click();

  await page1.waitForLoadState("domcontentloaded");
  const hasErrorMessage = await page1
    .getByTestId("error_message-")
    .isVisible()
    .catch(() => false);

  const bodyText = await page1.locator("body").innerText();
  if (!hasErrorMessage) {
    process.stderr.write(
      `[playwright] Expected error message was not present. URL: ${page1.url()}\nBody preview: ${bodyText.slice(0, 1000)}\n`,
    );
    process.exit(1);
  } else {
    process.stderr.write(
      `[playwright] Error message was present. URL: ${page1.url()}\nBody preview: ${bodyText.slice(0, 1000)}\n`,
    );
    const snapshot = `${page1.url()}\n${await page1.locator("body").innerText()}`;
    const stateHash = createHash("sha256").update(snapshot).digest("hex");
    await mkdir(".appointment-state", { recursive: true });
    await writeFile(
      path.join(".appointment-state", "current-state.txt"),
      stateHash,
    );
  }
});
