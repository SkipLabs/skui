
import { int, ptr, Environment, Links, ToWasmManager, Utils } from "#skui_base/skui_types";
import { ExternalFuns } from "#skui_skdb/skdb_types";


interface Exported {
  SKIP_throw_EndOfFile: () => void;
  sk_pop_dirty_page: () => number;
  SKIP_get_version: () => number;
  skip_main: () => void;
  //
  SKIP_init_jsroots: () => void;
  SKIP_add_root: (
    rootNameWasmStr: number,
    funId: number,
    funArg: number
  ) => void;
  SKIP_remove_root: (rootNameWasmStr: number) => void;
  SKIP_tracked_call: (funId: number, funArg: number) => number;
  SKIP_tracked_query: (request: number, start: number, end: number) => number;
  getVersion: () => number;
}

interface ToWasm {
  SKIP_call_external_fun: (funId: int, skParam: ptr) => ptr;
  SKIP_clear_field_names: () => void;
  SKIP_push_field_name: (skName: ptr) => void;
  SKIP_clear_object: () => void;
  SKIP_push_object_field_null: () => void;
  SKIP_push_object_field_int32: (field: int) => void;
  SKIP_push_object_field_int64: (field: ptr) => void;
  SKIP_push_object_field_float: (field: ptr) => void;
  SKIP_push_object_field_string: (field: ptr) => void;
  SKIP_push_object: () => void;
}

class LinksImpl implements Links, ToWasm {
  private state = new ExternalFuns();
  private field_names: Array<string> = new Array();
  private objectIdx = 0;
  private object: {[k: string]: any} = {};
  private stdout_objects: Array<any> = new Array();

  SKIP_call_external_fun: (funId: int, skParam: ptr) => ptr;
  SKIP_clear_field_names: () => void;
  SKIP_push_field_name: (skName: ptr) => void;
  SKIP_clear_object: () => void;
  SKIP_push_object_field_null: () => void;
  SKIP_push_object_field_int32: (field: int) => void;
  SKIP_push_object_field_int64: (field: ptr) => void;
  SKIP_push_object_field_float: (field: ptr) => void;
  SKIP_push_object_field_string: (field: ptr) => void;
  SKIP_push_object: () => void;

  complete = (utils: Utils, exports: object) => {
    let exported = exports as Exported;
    this.SKIP_call_external_fun = (funId: int, skParam: ptr) => {
      let res = this.state.call(
        funId,
        JSON.parse(utils.importString(skParam))
      )
      return utils.exportString(JSON.stringify( res ? res : null));
    };
    this.SKIP_clear_field_names = () => {
      this.field_names = new Array();
    };
    this.SKIP_push_field_name = (skName: ptr) => {
      this.field_names.push(utils.importString(skName))
    };
    this.SKIP_clear_object = () => {
      this.objectIdx = 0;
      this.object = {};
    };
    this.SKIP_push_object_field_null = () => {
      let field_name: string = this.field_names[this.objectIdx]!;
      this.object[field_name] = null;
      this.objectIdx++;
    };
    this.SKIP_push_object_field_int32 = (n: int) => {
      let field_name: string = this.field_names[this.objectIdx]!;
      this.object[field_name] = n;
      this.objectIdx++;
    };
    this.SKIP_push_object_field_int64 = (skV: ptr) => {
      let field_name: string = this.field_names[this.objectIdx]!;
      this.object[field_name] = parseInt(utils.importString(skV), 10);
      this.objectIdx++;
    };
    this.SKIP_push_object_field_float = (skV: ptr) => {
      let field_name: string = this.field_names[this.objectIdx]!;
      this.object[field_name] = parseFloat(utils.importString(skV));
      this.objectIdx++;
    },
    this.SKIP_push_object_field_string = (skV: ptr) => {
      let field_name: string = this.field_names[this.objectIdx]!;
      this.object[field_name] = utils.importString(skV);
      this.objectIdx++;
    },
    this.SKIP_push_object = () => {
      this.stdout_objects.push(this.object);
    };
    return null;
  }

  clear = () => this.stdout_objects = new Array();
  output = () => this.stdout_objects;
}

class Manager implements ToWasmManager {
  prepare = (wasm: object) => {
    let toWasm = wasm as ToWasm;
    let links = new LinksImpl();
    toWasm.SKIP_call_external_fun =  (funId: int, skParam: ptr) => links.SKIP_call_external_fun(funId, skParam);
    toWasm.SKIP_clear_field_names =  () => links.SKIP_clear_field_names();
    toWasm.SKIP_push_field_name =  (skName: ptr) =>  links.SKIP_push_field_name(skName);
    toWasm.SKIP_clear_object =  () =>  links.SKIP_clear_object();
    toWasm.SKIP_push_object_field_null =  () => links.SKIP_push_object_field_null();
    toWasm.SKIP_push_object_field_int32 =  (field: int) =>  links.SKIP_push_object_field_int32(field);
    toWasm.SKIP_push_object_field_int64 =  (field: ptr) =>  links.SKIP_push_object_field_int64(field);
    toWasm.SKIP_push_object_field_float =  (field: ptr) =>  links.SKIP_push_object_field_float(field);
    toWasm.SKIP_push_object_field_string =  (field: ptr) =>  links.SKIP_push_object_field_string(field);
    toWasm.SKIP_push_object =  () =>  links.SKIP_push_object();
    return links;
  }
}

export function init(env?: Environment) {
  return Promise.resolve(new Manager());
}
