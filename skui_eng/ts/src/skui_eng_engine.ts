import {int, float, ptr, Environment, Links, Utils, ToWasmManager, Shared, Text, Opt} from "#skui_base/skui_types";
import { RenderableElement, Scope, Property, Readable, DialogElement, Renderable} from "#skui_eng/skui_eng_types";

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
  SKIP_UiEngineJS_apply: (id: int, type_: ptr, paremeter: ptr) => Opt<ptr>;
  SKUI_UiEngineJS_renderable: (path: Opt<ptr>, name: ptr) => Opt<ptr>;
}

interface Env extends Environment {
  configs?: Array<any>;
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

class JSONProperty implements Property {
  path: Opt<string>;
  name: string;
  combined: boolean;
  getter: (path: Opt<string>, name: string) => any;
  setter: (path: Opt<string>, name: string, v: any) => void
  
  constructor(
    path: Opt<string>,
    name: string,
    combined: boolean,
    getter: (path: Opt<string>,name: string) => any,
    setter: (path: Opt<string>, name: string, v: any) => void
  ) {
    this.path = path;
    this.name = name;
    this.combined = combined;
    this.getter = getter;
    this.setter = setter;
  }

  set = (value: any) => {
    if (this.setter) {
      this.setter(this.path, this.name, value)
    }
  };

  get = () => {
    return this.getter ? this.getter(this.path, this.name) : null;
  };

  toJSON = () => {
    return { type: "jsonProp", fields: { name: this.name, path: this.path, combined: this.combined } }
  };
}

class ScopeImpl implements Scope {
  alert: (text: string | Text, title: Opt<string | Text>) => void;
  dialog: (dialog: Object)  => void;
  create: (value?: any) => Property;
  combine: (combine: (values: Array<any>) => any, combinables: Array<Readable>,write?: (value: any) => void) => Property;

  constructor(
    alert: (text: string | Text, title: Opt<string | Text>) => void,
    dialog: (dialog: DialogElement)  => void,
    create: (value?: any) => Property,
    combine: (combine: (values: Array<any>) => any, combinables: Array<Readable>,write?: (value: any) => void) => Property
  ) {
    this.create = create;
    this.combine = combine;
    this.alert = alert;
    this.dialog = dialog;
  }
}

class LinksImpl implements Links, ToWasm {
  state: State;
  env: Env | undefined;

  constructor(env?: Env) {
    this.state = new State();
    this.env = env;
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
  SKIP_UiEngineJS_apply: (id: int, type: ptr, paremeter: ptr) => Opt<ptr>;
  SKUI_UiEngineJS_renderable: (path: Opt<ptr>, name: ptr) => Opt<ptr>;
  private register: (skPath: Opt<ptr>, value: (...args: any[]) => any) => int;
  private exportValue: (path: Opt<string>, skPath: Opt<ptr>, value: any) => ptr;
  private importValue: (value: ptr) => any;
  private getter: (path: Opt<string>, name: string) => any;
  private setter: (path: Opt<string>, name: string, v: any) => void
  private registerCombine: (path: Opt<string>, combine: () => any, write?: (values: any) => void) => string;
  private registerProperty: (path: Opt<string>, value: any) => string;
  private combine: (
    path: string,
    combine: (values: Array<any>) => any, 
    combinables: Array<Readable>,
    write?: (value: any) => void
  ) => Property;
  private create: (path: string, value?: any) => Property;
  private alert: (text: string | Text, title: Opt<string | Text>) => void;
  private dialog: (path: Opt<string>, dialog: DialogElement)  => void;

  complete = (utils: Utils, exports: object) => {
    let exported = exports as Exported;
    this.register = (skPath: Opt<ptr>, value: (...args: any[]) => any) => {
      let id = this.state.register(value);
      exported.SKIP_UiEngineJS_register(id, skPath, utils.exportString(typeof value));
      return id;
    };
    this.importValue = (value: ptr) => this.state.delete(exported.SKIP_UiEngineJS_toJS(value));
    this.exportValue = (path: Opt<string>, skPath: Opt<ptr>, value: any) => {
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
        value.forEach(v => exported.SKIP_JSON_addToArray(arr, this.exportValue(path, skPath, v)))
        return exported.SKIP_JSON_endArray(arr);
      } else if (value instanceof RenderableElement) {
        let render = (skScope: ptr) => {
          let strScope = utils.importString(skScope);
          let scope = new ScopeImpl(
              this.alert,
              (dialog: DialogElement) => this.dialog(strScope, dialog),
              (value?: any) => this.create(strScope, value),
              (combine: (values: Array<any>) => any, combinables: Array<Readable>,write?: (value: any) => void) => this.combine(strScope, combine, combinables, write),
          );
          let widget = value.renderable(scope);
          return this.exportValue(strScope, skScope, widget)
        };
        let id = this.register(skPath, render);
        return this.exportValue(path, skPath, {
          type: "renderable",
          fields: {
            id: id,
            scope: path
          }
        });
      } else if (type == "object") {
        let jso = value;
        if (value.toJSON) {
          jso = value.toJSON();
        };
        let obj = exported.SKIP_JSON_startObject();
        for (let key in jso) {
          exported.SKIP_JSON_addToObject(obj, utils.exportString(key), this.exportValue(path, skPath, jso[key]))
        }
        return exported.SKIP_JSON_endObject(obj);
      } else if (type == "function") {
        let id = this.register(skPath, value);
        return this.exportValue(path, skPath, {
          type: "function",
          fields: {
            id: id,
            scope: path
          }
        });
      } else {
        throw new Error("'" + type + "' cannot be exported to engine.")
      }
    }
    this.getter = (path: Opt<string>, name: string) => {
      let skPath = path != null ? utils.exportString(path) : null;
      let skName = utils.exportString(name);
      let jsonPtr = exported.SKIP_UiEngineJS_getValue(skPath, skName);
      if (jsonPtr) {
        return this.importValue(jsonPtr);
      };
      return null;
    };
    this.setter = (path: Opt<string>, name: string, value: any) => {
      let skPath = path != null ? utils.exportString(path) : null;
      let skName = utils.exportString(name);
      let skValue = path != null ? this.exportValue(path, skPath, value): null;
      exported.SKIP_UiEngineJS_setValue(skPath, skName, skValue);
    };
    this.registerCombine = (path: Opt<string>, combine: () => any, write: (values: any) => void) =>  {
      return utils.runWithGc(() => {
        let skPath = path != null ? utils.exportString(path) : null;
        let combineFn = this.exportValue(path, skPath, combine);
        let writeFn = this.exportValue(path, skPath, write);
        let skName = exported.SKIP_UiEngineJS_combine(skPath, combineFn, writeFn);
        return utils.importString(skName);
      });
    };
    this.registerProperty = (path: Opt<string>, value: any) => {
      return utils.runWithGc(() => {
        let skPath = path != null ? utils.exportString(path) : null;
        let skValue = value != null ? this.exportValue(path, skPath, value) : null;
        let jsonPtr = exported.SKIP_UiEngineJS_create(skPath, skValue);
        return utils.importString(jsonPtr);
      });
    };
    this.combine = (
      path: string,
      combine: (values: Array<any>) => any, 
      combinables: Array<Readable>,
      write?: (value: any) => void
    ) =>  {
      let fn = () => {
        let values = combinables.map(c => c.get());
        let result = combine(values);
        let skPath = utils.exportString(path);
        return this.exportValue(path, skPath, result);
      };
      let name = this.registerCombine(path, fn, write);
      return new JSONProperty(path, name, true, this.getter, this.setter);
    };
    this.create = (path: string, value?: any) => {
      let name = this.registerProperty(path, value);
      return new JSONProperty(path, name, false, this.getter, this.setter);
    }
    this.alert = (text: string | Text, title: Opt<string | Text>) => {
      utils.runWithGc(() => {
        let skText = utils.exportLocale(text);
        let skTitle = title ? utils.exportLocale(text) : null;
        exported.SKIP_UiEngineJS_alert(skText, skTitle);
      })
    };
    this.dialog = (path: Opt<string>, dialog: DialogElement) => {
      utils.runWithGc(() => {
        let skPath = path != null ? utils.exportString(path) : null;
        let skDialog = this.exportValue(path, skPath, dialog);
        exported.SKIP_UiEngineJS_dialog(skDialog);
      });
    };
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
        return res !== undefined ? this.exportValue(null, null, res) : null;
      }
      return null;
    };
    this.SKUI_UiEngineJS_renderable = (skPath: Opt<ptr>, skName: ptr) => {
      let configs = this.env ? this.env.configs : null;
      if (configs) {
        let path = skPath != null ? utils.importOptString(skPath) : null;
        let name = utils.importString(skName);
        let renderables = configs.filter(c => c.name == name);
        if (renderables.length > 0) {
          let renderable = renderables[0].renderable as Renderable;
          return this.exportValue(path, skPath, new RenderableElement(renderable))
        }
      }
      return null;
    }
    return null;
  }
}

class Manager implements ToWasmManager {
  env:  Env | undefined;

  constructor(env?:  Env) {
    this.env = env;
  }

  prepare = (wasm: object) => {
    let toWasm = wasm as ToWasm;
    let links = new LinksImpl(this.env);
    toWasm.SKIP_UiEngineJS_createObject =  () => links.SKIP_UiEngineJS_createObject();
    toWasm.SKIP_UiEngineJS_addToObject =  (obj: int, name: ptr, value: int) => links.SKIP_UiEngineJS_addToObject(obj, name, value);
    toWasm.SKIP_UiEngineJS_createArray =  () => links.SKIP_UiEngineJS_createArray();
    toWasm.SKIP_UiEngineJS_addToArray =  (arr: int, value: int) => links.SKIP_UiEngineJS_addToArray(arr, value);
    toWasm.SKIP_UiEngineJS_createNull =  () => links.SKIP_UiEngineJS_createNull();
    toWasm.SKIP_UiEngineJS_createNumber =  (value: number) => links.SKIP_UiEngineJS_createNumber(value);
    toWasm.SKIP_UiEngineJS_createString =  (value: ptr) => links.SKIP_UiEngineJS_createString(value);
    toWasm.SKIP_UiEngineJS_createBool =  (value: boolean) => links.SKIP_UiEngineJS_createBool(value);
    toWasm.SKUI_UiEngineJS_renderable =  (skPath: Opt<ptr>, skName: ptr) => links.SKUI_UiEngineJS_renderable(skPath, skName);
    return links;
  }
}

export function init(env?: Environment) {
  return Promise.resolve(new Manager(env ? env as Env : undefined));
}