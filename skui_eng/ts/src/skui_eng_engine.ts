import {int, float, ptr, Environment, Links, Utils, ToWasmManager, Shared, Text, Opt} from "#skui_base/skui_types";

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
  SKIP_UiEngineJS_register: (id: int, path: Opt<ptr>, type_: ptr) => void;
  SKIP_UiEngineJS_unregister: (id: int, path: Opt<ptr>) => void;
  SKIP_UiEngineJS_getValue: (path: Opt<ptr>, name: ptr) => ptr;
  SKIP_UiEngineJS_setValue: (path: Opt<ptr>, name: ptr, value: Opt<ptr>) => void;
  SKIP_UiEngineJS_create: (path: Opt<ptr>, value: Opt<ptr>) => ptr;
  SKIP_UiEngineJS_combine: (path: Opt<ptr>, combineFn: ptr, writeFn: ptr) => ptr;
  SKIP_UiEngineJS_alert:(text: ptr, title: Opt<ptr>) => void;
  SKIP_UiEngineJS_dialog:(dialog: ptr) => void;
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
  SKIP_UiEngineJS_delete: (id: int) => void;
  SKIP_UiEngineJS_apply: (id: int, type_: ptr, paremeter: ptr) => null | ptr;
}

export class EngineShared implements Shared {
  getName = () => "engine";
  setValue: (path: Opt<string>, name: string, value: any) => void;
  getValue: (path: Opt<string>, name: string) => any;
  create: (path: Opt<string>, value: any) => string;
  combine: (path: Opt<string>, combine: (values: Array<any>) => any, write: (values: any) => void) => string;
  alert:(text: string | Text, title: Opt<string | Text>) => void;
  dialog:(path: Opt<string>, dialog: object) => void;

  constructor(
    setValue: (path: Opt<string>, name: string, value: any) => void,
    getValue: (path: Opt<string>, name: string) => any,
    create: (path: Opt<string>, value: any) => string,
    combine: (path: Opt<string>, combine: (values: Array<any>) => any, write: (values: any) => void) => string,
    alert:(text: string | Text, title: Opt<string | Text>) => void,
    dialog:(path: Opt<string>,  dialog: object) => void,
  ) {
    this.setValue = setValue;
    this.getValue = getValue;
    this.create = create;
    this.combine = combine;
    this.alert = alert;
    this.dialog = dialog;
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

  delete = (id : int) => {
    let value = this.values.get(id);
    this.values.delete(id);
    return value;
  }

  get = (id : int) => {
    return this.values.get(id);
  }

  apply = (id: int, paremeter: Array<any>) => {
    let fn = this.values.get(id);
    if (fn && typeof fn == "function") {
      return fn.apply(null, paremeter);
    }
    return null;
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
  SKIP_UiEngineJS_delete = (id: int) => this.state.delete(id);
  SKIP_UiEngineJS_apply: (id: int, type: ptr, paremeter: ptr) => null | ptr;
  register: (skPath: Opt<ptr>, value: (...args: any[]) => any) => int;
  exportValue: (skPath: Opt<ptr>, value: any) => ptr;
  importValue: (value: ptr) => any;

  complete = (utils: Utils, exports: object) => {
    let exported = exports as Exported;
    this.register = (skPath: Opt<ptr>, value: (...args: any[]) => any) => {
      let id = this.state.register(value);
      exported.SKIP_UiEngineJS_register(id, skPath, utils.exportString(typeof value));
      return id;
    };
    this.importValue = (value: ptr) => this.state.delete(exported.SKIP_UiEngineJS_toJS(value));
    this.exportValue = (skPath: Opt<ptr>, value: any) => {
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
        value.forEach(v => exported.SKIP_JSON_addToArray(arr, this.exportValue(skPath, v)))
        return exported.SKIP_JSON_endArray(arr);
      } else if (type == "object") {
        let jso = value;
        if (value.toJSON) {
          jso = value.toJSON();
        };
        let obj = exported.SKIP_JSON_startObject();
        for (let key in jso) {
          exported.SKIP_JSON_addToObject(obj, utils.exportString(key), this.exportValue(skPath, jso[key]))
        }
        return exported.SKIP_JSON_endObject(obj);
      } else if (type == "function") {
        let id = this.register(skPath, value);
        let scope = skPath != null ? utils.importString(skPath) : null;
        return this.exportValue(skPath, {
          type: "function",
          fields: {
            id: id,
            scope: scope
          }
        });
      } else {
        throw new Error("'" + type + "' cannot be exported to engine.")
      }
    }
    
    this.SKIP_UiEngineJS_createObject = () => {
      return this.state.register({});
    }
    this.SKIP_UiEngineJS_addToObject = (obj: int, skName: ptr, value: int) => {
      let name = utils.importString(skName);
      this.state.get(obj)[name] = this.state.delete(value);
    }
    this.SKIP_UiEngineJS_createArray = () => {
      return this.state.register([]);
    }
    this.SKIP_UiEngineJS_addToArray = (arr: int, value: int) => {
      this.state.get(arr).push(this.state.delete(value));
    }
    this.SKIP_UiEngineJS_createNull = () => this.state.register(null);
    this.SKIP_UiEngineJS_createNumber = (value: number) => this.state.register(value);
    this.SKIP_UiEngineJS_createString = (value: ptr) => this.state.register(utils.importString(value));
    this.SKIP_UiEngineJS_createBool = (value: boolean) => this.state.register(value);
    this.SKIP_UiEngineJS_apply = (id: int, skType: ptr, skParemeters: ptr) => {
      let type = utils.importString(skType);
      let parameters = this.importValue(skParemeters);
      if (type == "function" && Array.isArray(parameters)) {
        let res = this.state.apply(id, parameters);
        return res !== undefined ? this.exportValue(null, res) : null;
      }
      return null;
    };
    let setValue = (path: Opt<string>, name: string, value: any) => {
      let skPath = path != null ? utils.exportString(path) : null;
      let skName = utils.exportString(name);
      let skValue = path != null ? this.exportValue(skPath, value): null;
      exported.SKIP_UiEngineJS_setValue(skPath, skName, skValue);
    };
    let getValue = (path: Opt<string>, name: string) => {
      let skPath = path != null ? utils.exportString(path) : null;
      let skName = utils.exportString(name);
      let jsonPtr = exported.SKIP_UiEngineJS_getValue(skPath, skName);
      if (jsonPtr) {
        return this.importValue(jsonPtr);
      };
      return null;
    };
    let create = (path: Opt<string>, value: any) => {
      return utils.runWithGc(() => {
        let skPath = path != null ? utils.exportString(path) : null;
        let skValue = value != null ? this.exportValue(skPath, value) : null;
        let jsonPtr = exported.SKIP_UiEngineJS_create(skPath, skValue);
        return utils.importString(jsonPtr);
      });
    };
    let combine = (path: Opt<string>, combine: (values: Array<any>) => any, write: (values: any) => void) =>  {
      return utils.runWithGc(() => {
        let skPath = path != null ? utils.exportString(path) : null;
        let combineFn = this.exportValue(skPath, combine);
        let writeFn = this.exportValue(skPath, write);
        let skName = exported.SKIP_UiEngineJS_combine(skPath, combineFn, writeFn);
        return utils.importString(skName);
      });
    };
    let alert = (text: string | Text, title: Opt<string | Text>) => {
      utils.runWithGc(() => {
        let skText = utils.exportLocale(text);
        let skTitle = title ? utils.exportLocale(text) : null;
        exported.SKIP_UiEngineJS_alert(skText, skTitle);
      })
    };
    let  dialog = (path: Opt<string>, dialog: object) => {
      utils.runWithGc(() => {
        let skPath = path != null ? utils.exportString(path) : null;
        let skDialog = this.exportValue(skPath, dialog);
        exported.SKIP_UiEngineJS_dialog(skDialog);
      });
    };
    return new EngineShared(
      setValue,
      getValue,
      create,
      combine,
      alert,
      dialog
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