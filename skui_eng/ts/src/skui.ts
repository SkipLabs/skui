import { runUrl } from "#std/sk_types.js";
import type { GLEnv } from "#skui_opengl/skui_glenv.js";

// @ts-ignore
// prettier-ignore
var modules = [ /*--MODULES--*/];
var extensions = new Map();
/*--EXTENSIONS--*/

async function launch() {

  let data = await runUrl(
    new URL("./skui_eng.wasm", import.meta.url),
    // @ts-ignore
    modules,
    extensions,
    "SKDB_factory",
  );
  // @ts-ignore
  let data = await run(wasm64, modules, extensions);
  let window = (data.environment as GLEnv).window();
  let search = window.location.search.trim().substring(1);
  let args = search.split("/").map((t) => decodeURI(t));
  data.main(args, "");
}

launch();