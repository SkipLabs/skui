import type {
  int,
  ptr,
  Environment,
  Links,
  Utils,
  ToWasmManager,
  Nullable,
} from "../skipwasm-std/index.js";
import type {
  Scope,
  Property,
  Readable,
  DialogElement,
  Handle,
  JsonObject,
  Json,
  JsonArray,
  Combine,
  RenderableElement,
  Function,
} from "./types.js";
import { EngShared, State, SkuiEngUtils } from "./types.js";
import { SkuiUtils, type Text } from "../skui-base/skui_types.js";
import type * as Internal from "./internal.js";

interface Exported {
  SKIP_UiEngineJS_register: (
    id: int,
    path: Nullable<ptr<Internal.String>>,
    type_: ptr<Internal.String>
  ) => void;
  SKIP_UiEngineJS_unregister: (
    id: int,
    path: Nullable<ptr<Internal.String>>
  ) => void;
  SKIP_UiEngineJS_getValue: (
    path: Nullable<ptr<Internal.String>>,
    name: ptr<Internal.String>
  ) => ptr<Internal.Json>;
  SKIP_UiEngineJS_setValue: (
    path: Nullable<ptr<Internal.String>>,
    name: ptr<Internal.String>,
    value: Nullable<ptr<Internal.Json>>
  ) => void;
  SKIP_UiEngineJS_create: (
    path: Nullable<ptr<Internal.String>>,
    value: Nullable<ptr<Internal.Json>>
  ) => ptr<Internal.String>;
  SKIP_UiEngineJS_combine: (
    path: Nullable<ptr<Internal.String>>,
    combineFn: ptr<Internal.Json>,
    writeFn: Nullable<ptr<Internal.Json>>
  ) => ptr<Internal.String>;
  SKIP_UiEngineJS_alert: (
    text: ptr<Internal.I18NText>,
    title: Nullable<ptr<Internal.I18NText>>
  ) => void;
  SKIP_UiEngineJS_dialog: (dialog: ptr<Internal.Json>) => void;
}

interface ToWasm {
  SKIP_UiEngineJS_createObject(): Handle<JsonObject>;
  SKIP_UiEngineJS_addToObject(
    obj: Handle<JsonObject>,
    name: ptr<Internal.String>,
    value: Handle<Json>
  ): void;
  SKIP_UiEngineJS_createArray(): Handle<JsonArray>;
  SKIP_UiEngineJS_addToArray(arr: Handle<JsonArray>, value: Handle<Json>): void;
  SKIP_UiEngineJS_createNull(): Handle<null>;
  SKIP_UiEngineJS_createNumber(value: number): Handle<Json>;
  SKIP_UiEngineJS_createString(value: ptr<Internal.String>): Handle<Json>;
  SKIP_UiEngineJS_createBool(value: boolean): Handle<Json>;
  SKIP_UiEngineJS_delete(id: Handle<Json>): void;
  SKIP_UiEngineJS_apply(
    id: Handle<Function>,
    type_: ptr<Internal.String>,
    paremeter: ptr<Internal.JSArray>
  ): Nullable<ptr<Internal.Json>>;
}

interface Env extends Environment {
  configs?: any[];
}

class JSONProperty implements Property {
  path: Nullable<string>;
  name: string;
  combined: boolean;
  getter: (path: Nullable<string>, name: string) => Nullable<Json>;
  setter: (path: Nullable<string>, name: string, v: Json) => void;

  constructor(
    path: Nullable<string>,
    name: string,
    combined: boolean,
    getter: (path: Nullable<string>, name: string) => Nullable<Json>,
    setter: (path: Nullable<string>, name: string, v: Json) => void
  ) {
    this.path = path;
    this.name = name;
    this.combined = combined;
    this.getter = getter;
    this.setter = setter;
  }

  set(value: Json) {
    this.setter(this.path, this.name, value);
  }

  get() {
    return this.getter(this.path, this.name);
  }

  toJSON = () => {
    return {
      type: "prop",
      fields: { name: this.name, path: this.path, combined: this.combined },
    };
  };
}

class ScopeImpl implements Scope {
  alert: (text: string | Text, title: Nullable<string | Text>) => void;
  dialog: (dialog: DialogElement) => void;
  create: (value?: any) => Property;
  combine: Combine;

  constructor(
    alert: (text: string | Text, title: Nullable<string | Text>) => void,
    dialog: (dialog: DialogElement) => void,
    create: (value?: Json) => Property,
    combine: Combine
  ) {
    this.create = create;
    this.combine = combine;
    this.alert = alert;
    this.dialog = dialog;
  }
}

class LinksImpl implements Links, ToWasm {
  state!: State;
  env?: Env;
  utils!: Utils;
  skuiUtils!: SkuiUtils;
  exported!: Exported;
  skuiEngUtils!: SkuiEngUtils;

  constructor(env?: Env) {
    this.env = env;
  }

  complete(utils: Utils, exports: object) {
    this.state = utils.getState("skuieng", () => new State());
    this.utils = utils;
    this.skuiUtils = new SkuiUtils(utils, exports);
    this.exported = exports as Exported;
    const createScope = (strScope: string) =>
      new ScopeImpl(
        (text: string | Text, title: Nullable<string | Text>) =>
          this.alert(text, title),
        (dialog: DialogElement) => this.dialog(strScope, dialog),
        (value?: Json) => this.create(strScope, value),
        (
          combine: (values: JsonArray) => Json,
          combinables: Readable[],
          write?: (value: Json) => void
        ) => this.combine(strScope, combine, combinables, write)
      );
    this.skuiEngUtils = new SkuiEngUtils(
      utils,
      exports,
      createScope,
      this.state
    );
    if (this.env) {
      this.env.shared.set("skuieng", new EngShared(createScope));
    }
  }

  getter(path: Nullable<string>, name: string) {
    const skPath = path != null ? this.utils.exportString(path) : null;
    const skName = this.utils.exportString(name);
    const jsonPtr = this.exported.SKIP_UiEngineJS_getValue(skPath, skName);
    if (jsonPtr) {
      return this.skuiEngUtils.importValue(jsonPtr);
    }
    return null;
  }

  setter(path: Nullable<string>, name: string, value: Json) {
    const skPath = path != null ? this.utils.exportString(path) : null;
    const skName = this.utils.exportString(name);
    const skValue =
      path != null ? this.skuiEngUtils.exportValue(path, skPath, value) : null;
    this.exported.SKIP_UiEngineJS_setValue(skPath, skName, skValue);
  }

  registerCombine(
    path: Nullable<string>,
    combine: () => Json,
    write?: (values: JsonArray) => void
  ) {
    return this.utils.runWithGc(() => {
      const skPath = path != null ? this.utils.exportString(path) : null;
      const combineFn = this.skuiEngUtils.exportValue(
        path,
        skPath,
        combine as Function
      );
      const writeFn = write
        ? this.skuiEngUtils.exportValue(path, skPath, write as Function)
        : null;
      const skName = this.exported.SKIP_UiEngineJS_combine(
        skPath,
        combineFn,
        writeFn
      );
      return this.utils.importString(skName);
    });
  }

  registerProperty(
    path: Nullable<string>,
    value: Nullable<Json | RenderableElement>
  ) {
    return this.utils.runWithGc(() => {
      const skPath = path != null ? this.utils.exportString(path) : null;
      const skValue =
        value != null
          ? this.skuiEngUtils.exportValue(path, skPath, value)
          : null;
      const jsonPtr = this.exported.SKIP_UiEngineJS_create(skPath, skValue);
      return this.utils.importString(jsonPtr);
    });
  }

  combine(
    path: string,
    combine: (values: JsonArray) => Json,
    combinables: Readable[],
    write?: (value: Json) => void
  ) {
    const fn = () => {
      const values = combinables.map((c) => c.get());
      const result = combine(values);
      const skPath = this.utils.exportString(path);
      return this.skuiEngUtils.exportValue(path, skPath, result);
    };
    const name = this.registerCombine(path, fn, write);
    return new JSONProperty(
      path,
      name,
      true,
      this.getter.bind(this),
      (path: Nullable<string>, name: string, value: Json) =>
        this.setter(path, name, value)
    );
  }

  create(path: string, value?: Json | RenderableElement) {
    const name = this.registerProperty(path, value ?? null);
    return new JSONProperty(
      path,
      name,
      false,
      (path: Nullable<string>, name: string) => this.getter(path, name),
      (path: Nullable<string>, name: string, value: Json) =>
        this.setter(path, name, value)
    );
  }

  private alert(text: string | Text, title: Nullable<string | Text>) {
    this.utils.runWithGc(() => {
      const skText = this.skuiUtils.exportLocale(text);
      const skTitle = title ? this.skuiUtils.exportLocale(text) : null;
      this.exported.SKIP_UiEngineJS_alert(skText, skTitle);
    });
  }

  private dialog(path: Nullable<string>, dialog: DialogElement) {
    this.utils.runWithGc(() => {
      const skPath = path != null ? this.utils.exportString(path) : null;
      const skDialog = this.skuiEngUtils.exportValue(path, skPath, dialog);
      this.exported.SKIP_UiEngineJS_dialog(skDialog);
    });
  }

  SKIP_UiEngineJS_createObject() {
    return this.state.register({});
  }

  SKIP_UiEngineJS_addToObject(
    obj: Handle<JsonObject>,
    skName: ptr<Internal.String>,
    value: Handle<Json>
  ) {
    const name = this.utils.importString(skName);
    this.state.get(obj)[name] = this.state.delete(value);
  }

  SKIP_UiEngineJS_createArray() {
    return this.state.register([]);
  }

  SKIP_UiEngineJS_addToArray(arr: Handle<JsonArray>, value: Handle<Json>) {
    this.state.get(arr).push(this.state.delete(value));
  }

  SKIP_UiEngineJS_createNull() {
    return this.state.register(null);
  }

  SKIP_UiEngineJS_createNumber(value: number) {
    return this.state.register(value);
  }

  SKIP_UiEngineJS_createString(value: ptr<Internal.String>) {
    return this.state.register(this.utils.importString(value));
  }

  SKIP_UiEngineJS_createBool(value: boolean) {
    return this.state.register(value);
  }

  SKIP_UiEngineJS_apply(
    id: Handle<Function>,
    skType: ptr<Internal.String>,
    skParemeters: ptr<Internal.JSArray>
  ) {
    const type = this.utils.importString(skType);
    const parameters = this.skuiEngUtils.importValue(skParemeters);
    if (type == "function" && Array.isArray(parameters)) {
      const res = this.state.apply(id, parameters);
      return this.skuiEngUtils.exportValue(null, null, res);
    }
    return null;
  }

  SKIP_UiEngineJS_delete(id: Handle<Json>) {
    this.state.delete(id);
  }
}

class Manager implements ToWasmManager {
  env: Env | undefined;

  constructor(env?: Env) {
    this.env = env;
  }

  prepare = (wasm: object) => {
    const toWasm = wasm as ToWasm;
    const links = new LinksImpl(this.env);
    toWasm.SKIP_UiEngineJS_createObject =
      links.SKIP_UiEngineJS_createObject.bind(links);
    toWasm.SKIP_UiEngineJS_addToObject =
      links.SKIP_UiEngineJS_addToObject.bind(links);
    toWasm.SKIP_UiEngineJS_createArray =
      links.SKIP_UiEngineJS_createArray.bind(links);
    toWasm.SKIP_UiEngineJS_addToArray =
      links.SKIP_UiEngineJS_addToArray.bind(links);
    toWasm.SKIP_UiEngineJS_createNull =
      links.SKIP_UiEngineJS_createNull.bind(links);
    toWasm.SKIP_UiEngineJS_createNumber =
      links.SKIP_UiEngineJS_createNumber.bind(links);
    toWasm.SKIP_UiEngineJS_createString =
      links.SKIP_UiEngineJS_createString.bind(links);
    toWasm.SKIP_UiEngineJS_createBool =
      links.SKIP_UiEngineJS_createBool.bind(links);
    toWasm.SKIP_UiEngineJS_delete = links.SKIP_UiEngineJS_delete.bind(links);
    toWasm.SKIP_UiEngineJS_apply = links.SKIP_UiEngineJS_apply.bind(links);
    return links;
  };
}

export function init(env?: Environment) {
  return Promise.resolve(new Manager(env ? (env as Env) : undefined));
}
