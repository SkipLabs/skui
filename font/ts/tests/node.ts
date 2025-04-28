import { environment as createEnvironment } from "@skui/common/node.js";
import { Loader } from "./tests.js";

export async function load() {
  const loader = new Loader(createEnvironment);
  return loader.load();
}
