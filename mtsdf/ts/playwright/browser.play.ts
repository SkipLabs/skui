import { test } from "@playwright/test";
import { tests, type Test } from "./tests.js";
import { load } from "@skui/mtsdf-tests";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error(msg.text());
    } else {
      console.log(msg.text());
    }
  });
});

function run(t: Test) {
  test(t.name, async ({ page }) => {
    await page.evaluate(`window.testName = "${t.name}";`);
    await page.evaluate(`window.test = ${t.fun};`);
    const res = await page.evaluate(async () => {
      const m = await import("@skui/mtsdf-tests");
      const main = await m.load();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return (await window.test(window.testName, main)) as string;
    });
    t.check(res);
  });
}

const main = await load();
tests(main).forEach(run);
