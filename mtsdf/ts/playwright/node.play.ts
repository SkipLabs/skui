import { test } from "@playwright/test";
import { tests, type Test } from "./tests.js";
import { load } from "@skui/mtsdf-tests";

const main = await load();

function run(t: Test) {
  test(t.name, () => {
    const res = t.fun(t.name, main);
    t.check(res);
  });
}

tests(main).forEach(run);
