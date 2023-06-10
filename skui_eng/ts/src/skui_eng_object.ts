import {int, float, ptr, Environment, Links, Utils, ToWasmManager, Shared} from "#skui_base/skui_types";

interface Exported {
  SKIP_UiEngineJS_toJS: (json: ptr) => int;
  SKIP_JSON_startObject: () => ptr;
  SKIP_JSON_addToObject: (obj: ptr, name: ptr, value: ptr) => void;
  SKIP_JSON_endObject: (obj: ptr) => ptr;
  SKIP_JSON_startArray: () => ptr;
  SKIP_JSON_addToArray: (arr: ptr, value: ptr) => void;
  SKIP_JSON_endArray: (arr: ptr) => ptr;
  SKIP_JSON_createNull: () => ptr;
  SKIP_JSON_createIntNumber: (v: int) => ptr;
  SKIP_JSON_createFloatNumber: (v: float) => ptr;
  SKIP_JSON_createString: (str: ptr) => ptr;
  SKIP_JSON_createBool: (v: boolean) => ptr;
}

interface ToWasm {
  SKIP_UiEngineJS_createObject: () => int;
  SKIP_UiEngineJS_addToObject: (obj: int, name: ptr, value: int) => void;
  SKIP_UiEngineJS_createArray: () => int;
  SKIP_UiEngineJS_addToArray: (arr: int, value: int) => void;
  SKIP_UiEngineJS_createNull: () => int;
  SKIP_UiEngineJS_createNumber: (value: number) => int;
  SKIP_UiEngineJS_createString: (value: ptr) => int;
  SKIP_UiEngineJS_createBool: (value: boolean) => int;
}

export class ObjectShared implements Shared {
  getName = () => "objects";
  importValue: (value: ptr) => any;
  exportValue: (value: any) => ptr;
  constructor(
    importValue: (value: ptr) => any,
    exportValue: (value: any) => ptr
  ) {
    this.importValue = importValue;
    this.exportValue = exportValue;
  }
}

class State {
  valueId = 0;
  values = new Map<int,any>();

  register = (value: any) => {
    let id = ++this.valueId;
    if (value != null && value != undefined) {
      this.values.set(id, value);
    }
    return id;
  }

  unregister = (id : int) => {
    let value = this.values.get(id);
    this.values.delete(id);
    return value;
  }

  get = (id : int) => {
    return this.values.get(id);
  }
}


class LinksImpl implements Links, ToWasm {
  state: State;

  constructor() {
    this.state = new State();
  }

  SKIP_UiEngineJS_createObject: () => int;
  SKIP_UiEngineJS_addToObject: (obj: int, name: ptr, value: int) => void;
  SKIP_UiEngineJS_createArray: () => int;
  SKIP_UiEngineJS_addToArray: (arr: int, value: int) => void;
  SKIP_UiEngineJS_createNull: () => int;
  SKIP_UiEngineJS_createNumber: (value: number) => int;
  SKIP_UiEngineJS_createString: (value: ptr) => int;
  SKIP_UiEngineJS_createBool: (value: boolean) => int;
  exportValue: (value: any) => ptr;

  complete = (utils: Utils, exports: object) => {
    let exported = exports as Exported;
    this.exportValue = (value: any) => {
      let type = typeof value;
      if (value == null || value == undefined) {
        return exported.SKIP_JSON_createNull(); 
      } else if (type == "number") {
        return exported.SKIP_JSON_createFloatNumber(value);
      } else if (type == "boolean") {
        return exported.SKIP_JSON_createBool(value);
      } else if (type == "string") {
        return exported.SKIP_JSON_createString(utils.exportString(value));
      } else if (Array.isArray(value)) {
        let arr = exported.SKIP_JSON_startArray();
        value.forEach(v => exported.SKIP_JSON_addToArray(arr, this.exportValue(v)))
        return exported.SKIP_JSON_endArray(arr);
      } else if (type == "object") {
        let jso = value;
        if (value.toJSON) {
          jso = value.toJSON();
        };
        let obj = exported.SKIP_JSON_startObject();
        for (let key in jso) {
          exported.SKIP_JSON_addToObject(obj, utils.exportString(key), this.exportValue(jso[key]))
        }
        return exported.SKIP_JSON_endObject(obj);
      } else {
        throw new Error("'" + type + "' cannot be exported to egine.")
      }
    }
    
    this.SKIP_UiEngineJS_createObject = () => {
      return this.state.register({});
    }
    this.SKIP_UiEngineJS_addToObject = (obj: int, skName: ptr, value: int) => {
      let name = utils.importString(skName);
      this.state.get(obj)[name] = this.state.unregister(value);
    }
    this.SKIP_UiEngineJS_createArray = () => {
      return this.state.register([]);
    }
    this.SKIP_UiEngineJS_addToArray = (arr: int, value: int) => {
      this.state.get(arr).push(this.state.unregister(value));
    }
    this.SKIP_UiEngineJS_createNull = () => this.state.register(null);
    this.SKIP_UiEngineJS_createNumber = (value: number) => this.state.register(value);
    this.SKIP_UiEngineJS_createString = (value: ptr) => this.state.register(utils.importString(value));
    this.SKIP_UiEngineJS_createBool = (value: boolean) => this.state.register(value);
    return new ObjectShared(
      (value: ptr) => this.state.unregister(exported.SKIP_UiEngineJS_toJS(value)),
      this.exportValue
    );
  }
}

class Manager implements ToWasmManager {
  constructor() {}

  prepare = (wasm: object) => {
    let toWasm = wasm as ToWasm;
    let links = new LinksImpl();
    toWasm.SKIP_UiEngineJS_createObject =  () => links.SKIP_UiEngineJS_createObject();
    toWasm.SKIP_UiEngineJS_addToObject =  (obj: int, name: ptr, value: int) => links.SKIP_UiEngineJS_addToObject(obj, name, value);
    toWasm.SKIP_UiEngineJS_createArray =  () => links.SKIP_UiEngineJS_createArray();
    toWasm.SKIP_UiEngineJS_addToArray =  (arr: int, value: int) => links.SKIP_UiEngineJS_addToArray(arr, value);
    toWasm.SKIP_UiEngineJS_createNull =  () => links.SKIP_UiEngineJS_createNull();
    toWasm.SKIP_UiEngineJS_createNumber =  (value: number) => links.SKIP_UiEngineJS_createNumber(value);
    toWasm.SKIP_UiEngineJS_createString =  (value: ptr) => links.SKIP_UiEngineJS_createString(value);
    toWasm.SKIP_UiEngineJS_createBool =  (value: boolean) => links.SKIP_UiEngineJS_createBool(value);
    return links;
  }
}

export function init(env?: Environment) {
  return Promise.resolve(new Manager());
}