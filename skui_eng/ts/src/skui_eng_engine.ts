import {int, ptr, Environment, Links, Utils, ToWasmManager, Text, Opt} from "#std/sk_types";
import { EngShared, Scope, Property, Readable, DialogElement, State, SkuiEngUtils} from "#skui_eng/skui_eng_types";
import {SkuiUtils} from "#skui_base/skui_types";

interface Exported {
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
}

interface Env extends Environment {
  configs?: Array<any>;
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
    return { type: "prop", fields: { name: this.name, path: this.path, combined: this.combined } }
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
    this.state =  utils.getState("skuieng", () => new State());
    let skuiUtils = new SkuiUtils(utils, exports);
    let exported = exports as Exported;
    let createScope = (strScope: string) => new ScopeImpl(
      this.alert,
      (dialog: DialogElement) => this.dialog(strScope, dialog),
      (value?: any) => this.create(strScope, value),
      (combine: (values: Array<any>) => any, combinables: Array<Readable>,write?: (value: any) => void) => this.combine(strScope, combine, combinables, write),
    );
    let eng = new SkuiEngUtils(utils, exports, createScope, this.state);    
    this.getter = (path: Opt<string>, name: string) => {
      let skPath = path != null ? utils.exportString(path) : null;
      let skName = utils.exportString(name);
      let jsonPtr = exported.SKIP_UiEngineJS_getValue(skPath, skName);
      if (jsonPtr) {
        return eng.importValue(jsonPtr);
      }
      return null;
    };
    this.setter = (path: Opt<string>, name: string, value: any) => {
      let skPath = path != null ? utils.exportString(path) : null;
      let skName = utils.exportString(name);
      let skValue = path != null ? eng.exportValue(path, skPath, value): null;
      exported.SKIP_UiEngineJS_setValue(skPath, skName, skValue);
    };
    this.registerCombine = (path: Opt<string>, combine: () => any, write: (values: any) => void) =>  {
      return utils.runWithGc(() => {
        let skPath = path != null ? utils.exportString(path) : null;
        let combineFn = eng.exportValue(path, skPath, combine);
        let writeFn = eng.exportValue(path, skPath, write);
        let skName = exported.SKIP_UiEngineJS_combine(skPath, combineFn, writeFn);
        return utils.importString(skName);
      });
    };
    this.registerProperty = (path: Opt<string>, value: any) => {
      return utils.runWithGc(() => {
        let skPath = path != null ? utils.exportString(path) : null;
        let skValue = value != null ? eng.exportValue(path, skPath, value) : null;
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
        return eng.exportValue(path, skPath, result);
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
        let skText = skuiUtils.exportLocale(text);
        let skTitle = title ? skuiUtils.exportLocale(text) : null;
        exported.SKIP_UiEngineJS_alert(skText, skTitle);
      })
    };
    this.dialog = (path: Opt<string>, dialog: DialogElement) => {
      utils.runWithGc(() => {
        let skPath = path != null ? utils.exportString(path) : null;
        let skDialog = eng.exportValue(path, skPath, dialog);
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
      let parameters = eng.importValue(skParemeters);
      if (type == "function" && Array.isArray(parameters)) {
        let res = this.state.apply(id, parameters);
        return res !== undefined ? eng.exportValue(null, null, res) : null;
      }
      return null;
    };
    if (this.env) {
      this.env.shared.set("skuieng", new EngShared(createScope));
    }
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
    toWasm.SKIP_UiEngineJS_delete =  (id: int) => links.SKIP_UiEngineJS_delete(id);
    toWasm.SKIP_UiEngineJS_apply =  (id: int, type_: ptr, paremeter: ptr) => links.SKIP_UiEngineJS_apply(id, type_, paremeter);
    return links;
  }
}

/** @sk init */
export function init(env?: Environment) {
  return Promise.resolve(new Manager(env ? env as Env : undefined));
}