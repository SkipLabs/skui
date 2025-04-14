import { expect } from "@playwright/test";

export type Test = {
  name: string;
  fun: (
    testName: string,
    main: (args: string[], stdin: string) => string,
  ) => string;
  check: (res: string) => void;
};

export const tests = (main: (args: string[], stdin: string) => string) => {
  const testNames = main(["--list"], "");
  return testNames
    .trim()
    .split("\n")
    .map((testName) => {
      return {
        name: testName,
        fun: (
          testName: string,
          main: (args: string[], stdin: string) => string,
        ) => {
          return main(["--strict", "--json", testName], "");
        },
        check: (res: string) => {
          const lines = res.trim().split("\n");
          expect("Line size: " + lines.length.toString()).toEqual(
            "Line size: 1",
          );
          const result = JSON.parse(lines[0]!);
          expect(result.result).toEqual("success");
        },
      };
    });
};
