import type { EnvInit, ModuleInit } from "../skipwasm-std/index.js";
import { run } from "../skipwasm-std/index.js";

import { init as runtimeInit } from "../skipwasm-std/sk_runtime.js";
import { init as posixInit } from "../skipwasm-std/sk_posix.js";
import { init as baseInit } from "../skui-base/skui_base.js";
import { init as regexpInit } from "../skui-common/skui_regexp.js";
import { init as commonInit } from "../skui-common/skui_common.js";
import { init as openglInit } from "../skui-opengl/skui_webgl.js";
import { init as fwkInit } from "../skui-fwk/skui_framework.js";
import {
  type GLEnv,
  complete as openglComplete,
} from "../skui-opengl/skui_glenv.js";
import { environment as createEnvironment } from "../skipwasm-std/sk_browser.js";

const modules: ModuleInit[] = [
  runtimeInit,
  posixInit,
  baseInit,
  regexpInit,
  commonInit,
  openglInit,
  fwkInit,
];

const wasmurl = new URL("./skuieng", import.meta.url);
const extensions: EnvInit[] = [openglComplete];

async function launch() {
  const data = await run(wasmurl, modules, extensions, createEnvironment);
  const window = (data.environment as GLEnv).window();
  let args: string[] = [];
  if ("skui_command" in window) {
    args = window.skui_command as string[];
  } else {
    const search = window.location.search.trim().substring(1);
    args = search.split("/").map((t) => decodeURIComponent(t));
  }
  data.main(args, "");
}

await launch();
