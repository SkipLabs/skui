
import { run } from "#skui_base/skui_types";
import { SKDBShared } from "#skfs_skdb/skdb_types";
import { SKDBWorker } from "#skfs_skdb/skdb_wdatabase";


var wasm64 = "/*--NAME--*/";
var environment = "/*--ENVIRONMENT--*/";
var congifs = [ /*--CONFIGS--*/];
var modules = [ /*--MODULES--*/];

export async function createDatabase(dbName ?: string, asWorker: boolean = true) {
  if (!asWorker) {
    return await createLocal(dbName);
  } else {
    return await createWorker(dbName);
  }
}

export async function createLocal(dbName ?: string) {
  let shared = await run(wasm64, environment, modules, congifs, "SKDB_factory");
  return await (shared.get("SKDB") as SKDBShared).create(dbName);
}

export async function createWorker(dbName ?: string) {
  let path = import.meta.url.replace('/skdb.mjs', '/skdb_worker.mjs');
  let worker = new Worker(path, {type: 'module'});
  let skdb = new SKDBWorker(worker);
  await skdb.create(dbName);
  return skdb;
}
