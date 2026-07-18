import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { test, expect } from "@playwright/test";
import { loadEnvFile } from "process";

loadEnvFile();
const website = process.env.WEBSITE;
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
  await page1.getByTestId("button_next").click();

  const snapshot = `${page1.url()}\n${await page1.locator("body").innerText()}`;
  const stateHash = createHash("sha256").update(snapshot).digest("hex");
  await mkdir(".appointment-state", { recursive: true });
  await writeFile(
    path.join(".appointment-state", "current-state.txt"),
    stateHash,
  );

  await expect(page1.getByTestId("error_message-")).not.toBeVisible();
});
