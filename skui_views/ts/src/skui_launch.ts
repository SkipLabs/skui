import { run } from "#std/sk_types.js";
import type { GLEnv } from "#skui_opengl/skui_glenv.js";

var wasm64 = "/*--NAME--*/";
// @ts-ignore
// prettier-ignore
var modules = [ /*--MODULES--*/];
var extensions = new Map();
/*--EXTENSIONS--*/

async function launch() {
  // @ts-ignore
  let data = await run(wasm64, modules, extensions);
  let window = (data.environment as GLEnv).window();
  let search = window.location.search.trim().substring(1);
  let args = search.split("/").map((t) => decodeURI(t));
  data.main(args, "");
}

launch();
