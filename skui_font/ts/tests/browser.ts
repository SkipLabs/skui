import { environment as createEnvironment } from "@skui/common/browser.js";
import { Loader } from "./tests.js";

export async function load() {
  const loader = new Loader(createEnvironment);
  return loader.load();
}
