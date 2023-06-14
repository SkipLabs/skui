import {init} from "#skui_views/skui_utils";

function run(wasm64: String, congifs : Array<string>) {
  let promises = congifs.map(name => import(name).then(config => {
    if (config.config) {
      config.config()
    } else {
      null
    }
  }))
  let wasm = import(wasm64 + ".wasm.mjs").then(wm => Uint8Array.from(atob(wm.base64()), c => c.charCodeAt(0)));
  return Promise.all(
    [
      Promise.all(promises).then(cs => cs.filter(c => c != null)),
      wasm
    ]
  ).then(
    result => init(window, navigator, modules, result[1], result[0])
  ).catch(e => console.error(e));
}

var wasm64 = "/*--NAME--*/";
var modules : Array<string> = [/*--MODULES--*/];
var congifs : Array<string> = [/*--CONFIGS--*/];

run(wasm64, congifs);
