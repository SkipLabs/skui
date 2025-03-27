import { test, expect, type Page } from "@playwright/test";
import { exec } from "child_process";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Test = {
  name: string;
  args: string[];
  other?: (name: string, page: Page, browserName: string) => Promise<void>;
};

export const execCommand = async (command: string) => {
  return new Promise<string>((resolve, reject) => {
    const childProcess = exec(command);
    const stdout: string[] = [];
    const stderr: string[] = [];
    childProcess.stdout!.on("data", (data) => {
      stdout.push(data as string);
    });
    childProcess.stderr!.on("data", (data) => {
      stderr.push(data as string);
    });
    childProcess.on("error", (error) => {
      reject(error);
    });
    childProcess.on("exit", (code) => {
      if (code === 0) {
        resolve(stdout.join(""));
      } else {
        console.error(stderr.join(""));
        reject(new Error(`Command exited with code ${code}.`));
      }
    });
  });
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error(msg.text());
    } else {
      console.log(JSON.stringify(msg.text()));
    }
  });
});

function run(t: Test) {
  test(t.name, async ({ page, browserName }) => {
    await page.evaluate(`window.skui_command = "${t.args}";`);
    await page.evaluate(async () => {
      await import("@skui/views");
    });
    await sleep(500);
    await check(page, t.name, browserName, "screenshot");
    if (t.other) await t.other(t.name, page, browserName);
  });
}

async function check(
  page: Page,
  name: string,
  browserName: string,
  suffix: string
) {
  const file = `${name}-${browserName}-${suffix}.png`;
  const path = `test-results/${file}`;
  await page.screenshot({ path });
  const diff = await execCommand(`diff ${path} expected/${file}`);
  expect(diff).toEqual("");
  await execCommand(`rm "${path}"`);
}

async function test_buttons(name: string, page: Page, browserName: string) {
  const viewport = { width: 800, height: 600 };
  await page.setViewportSize(viewport);
  await page.mouse.move(200, 150);
  await check(page, name, browserName, "move-200x150");
  await page.mouse.move(200, 200);
  await check(page, name, browserName, "move-200x200");
  await page.mouse.down();
  await check(page, name, browserName, "down-200x200");
}

async function test_sliders(name: string, page: Page, browserName: string) {
  const viewport = { width: 800, height: 600 };
  await page.setViewportSize(viewport);
  await page.mouse.move(300, 185);
  await check(page, name, browserName, "move-300x185");
  await page.mouse.down();
  // Same result as move-300x185
  await check(page, name, browserName, "move-300x185");
  await page.mouse.up();
  await page.mouse.move(400, 185);
  // Same result as move-300x185
  await check(page, name, browserName, "move-300x185");
  await page.mouse.down();
  await check(page, name, browserName, "down-400x185");
  await page.mouse.move(300, 185);
  await check(page, name, browserName, "move-300x185");
  await page.mouse.up();
}

const tests: Test[] = [
  { name: "empty", args: [] },
  { name: "buttons", args: ["buttons"], other: test_buttons },
  { name: "sliders", args: ["sliders"], other: test_sliders },
  { name: "image", args: ["image"] },
];

tests.forEach(run);
