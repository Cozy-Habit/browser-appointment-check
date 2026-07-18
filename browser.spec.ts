import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto(
    "https://www.bonn.de/vv/produkte/AIDS-HIV-Beratung-Test-Untersuchung.php",
  );
  await page.getByRole("heading", { name: "Termin" }).click();
  const page1Promise = page.waitForEvent("popup");
  await page
    .getByRole("link", { name: "Termin reservieren (Öffnet in" })
    .click();
  const page1 = await page1Promise;
  await page1.getByTestId("fieldset--16").getByRole("strong").click();
  await page1.getByTestId("fieldset--16").getByTestId("checkbox--1").check();
  await page1.getByTestId("button_next").click();
  await expect(page1.getByTestId("error_message-")).not.toBeVisible();
});
