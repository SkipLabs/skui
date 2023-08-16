import {run} from "#std/sk_types";
import {GLEnv} from "#skui_opengl/skui_glenv";

var wasm64 = "skuiviews";
var congifs = [ /*--CONFIGS--*/];
var modules = [ /*--MODULES--*/];
var extensions = new Map();
/*--EXTENSIONS--*/

async function launch() {
  let data = await run(wasm64, modules, congifs, extensions);
  let window = (data.environment as GLEnv).window();
  let search = window.location.search.trim().substring(1);
  let args = search.split("/").map(t => decodeURI(t));
  data.main(args, "");
}

launch()

