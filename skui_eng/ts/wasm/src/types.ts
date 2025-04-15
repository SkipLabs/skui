import type {
  int,
  float,
  ptr,
  Nullable,
  Utils,
  Shared,
} from "../skipwasm-std/index.js";

import type { Text } from "../skui-base/skui_types.js";

import type * as Internal from "./internal.js";

export type Handle<T> = Internal.Opaque<number, { handle_for: T }>;
export type Json =
  | boolean
  | number
  | string
  | JsonArray
  | JsonObject
  | JSObject
  | RenderableElement;

export type JsonObject = { [key: string]: Json | null };
export type JsonArray = (Json | null)[];

export type Combine = (
  combine: (values: JsonArray) => Json,
  combinables: Readable[],
  write?: (value: Json) => void
) => Property;

export interface Readable {
  get: () => Nullable<Json>;
}

export interface Writable {
  set: (value: Json) => void;
}

export interface Property extends Writable, Readable {}

export enum Alignment {
  Start,
  End,
  Center,
  SpaceBetween,
  SpaceAround,
  SpaceEvenly,
}

export enum FlCrossAlign {
  Start,
  End,
  Center,
  Stretch,
}

export enum WrCrossAlign {
  Start,
  End,
  Center,
}

export enum Fit {
  Loose,
  Expend,
  Passthrough,
}

export enum ButtonKind {
  Regular,
  Primary,
  Accent,
  Warm,
}

export enum ButtonMode {
  Basic,
  Stroked,
  Raised,
  Flat,
  Icon,
  MiniIcon,
  Fab,
  MiniFab,
}

export enum IconType {
  Inner,
  Theme,
  Image,
}

export enum InputType {
  Text,
  Password,
  ASCII,
  Integer,
  Real,
  Hex,
  Binary,
  Octal,
  Pattern,
}

export enum Level {
  Information,
  Warning,
  Error,
}

export enum StatusType {
  OK,
  VALID,
  RUNNING,
  KO,
}

export enum SepType {
  FromStart,
  FromEnd,
  Percent,
}

export enum ToggleKind {
  Toggle,
  Checkbox,
  Radio,
}

export enum Policy {
  Always,
  AsNeeded,
  Never,
  Hidden,
}

export enum HAlignment {
  Center,
  Justify,
  Left,
  Right,
}

export enum VAlignment {
  Top,
  Middle,
  Bottom,
}

export enum Wrapping {
  No,
  Char,
  Word,
}

export enum Transform {
  No,
  Uppercase,
  Lowercase,
  UppercaseFirst,
  Capitalize,
}

export enum Overflow {
  LeadingChar,
  CenterChar,
  EndingChar,
  LeadingWord,
  CenterWord,
  EndingWord,
}

export enum Slant {
  Normal,
  Italic,
}

export enum Drop {
  Before,
  After,
  In,
}

export enum Weight {
  Thin = 100,
  ExtraLight = 200,
  Light = 300,
  Normal = 400,
  Medium = 500,
  SemiBold = 600,
  Bold = 700,
  ExtraBold = 800,
  Black = 900,
}

export enum TabsKind {
  Fixed,
  Scrollable,
}

export enum TabsMode {
  Basic,
  Flat,
}

export enum Side {
  Left,
  Top,
  Right,
  Bottom,
}

export enum Order {
  Asc,
  Desc,
  None,
}

export enum Separator {
  None,
  Before,
  After,
  Both,
}

export type IconKind = string | IconType;

export type Value<T> = T | Readable;

export class JSObject {
  type: string;
  fields: object;

  constructor(type: string, fields: object) {
    this.type = type;
    this.fields = fields;
  }

  toJSON(): JsonObject {
    return {
      type: this.type,
      fields: this.fields as JsonObject,
    };
  }
}

export class WidgetElement extends JSObject {}
export class IconElement extends JSObject {}
export class Configuration extends JSObject {}
export class Decoration extends JSObject {}
export class RangeElement extends JSObject {}
export class InputKindElement extends JSObject {}
export class SeparationElement extends JSObject {}
export class StatusElement extends JSObject {}
export class InsetsElement extends JSObject {}
export class ConstraintsElement extends JSObject {}
export class TextStyleElement extends JSObject {}
export class IconedActionElement extends JSObject {}
export class TabElement extends JSObject {}
export class TreeItemElement extends JSObject {}
export class DropdownElement extends JSObject {}
export class ShorcutElement extends JSObject {}
export class DialogElement extends JSObject {}

export class RenderableElement {
  renderable: Renderable;

  constructor(renderable: Renderable) {
    this.renderable = renderable;
  }
}

export type Widget = WidgetElement | RenderableElement;

export type FlexConf = {
  flex?: int;
  "fit-loose"?: boolean;
  "ignore-cross"?: boolean;
};

export type Flex = {
  children: Value<Value<Widget>[]>;
  vertical?: Value<boolean>;
  "main-reversed"?: Value<boolean>;
  "cross-reversed"?: Value<boolean>;
  "main-alignment"?: Value<Alignment>;
  "cross-alignment"?: Value<FlCrossAlign>;
  "max-size"?: Value<boolean>;
  configuration?: Value<Configuration>;
};

export type Wrap = {
  children: Value<Value<Widget>[]>;
  vertical?: Value<boolean>;
  "main-reversed"?: Value<boolean>;
  "cross-reversed"?: Value<boolean>;
  "main-alignment"?: Value<Alignment>;
  "cross-alignment"?: Value<WrCrossAlign>;
  "run-alignment"?: Value<Alignment>;
  spacing?: Value<int>;
  "run-spacing"?: Value<int>;
  configuration?: Value<Configuration>;
};

export type StackConf = { fit?: Fit; opaque?: boolean };

export type Stack = {
  children: Value<Value<Widget>[]>;
  configuration?: Value<Configuration>;
};

export type AspectRatio = {
  child: Value<Widget>;
  ratio?: Value<float>;
  centered?: Value<boolean>;
  configuration?: Value<Configuration>;
};

export type Icon = {
  kind: IconKind;
  name: string;
};

export type Button = {
  "on-fire": (count: int) => void;
  kind?: ButtonKind;
  mode?: ButtonMode;
  text?: Value<string | Text>;
  icon?: Value<IconElement>;
  tooltip?: Value<string | Text>;
  disabled?: Value<boolean>;
  configuration?: Value<Configuration>;
};

export type Slider = {
  value: Property;
  bounds: Value<RangeElement>;
  range?: Value<boolean>;
  vertical?: Value<boolean>;
  step?: Value<int>;
  disabled?: Value<boolean>;
  small?: Value<boolean>;
  labeled?: Value<boolean>;
  ticks?: Value<int>;
  configuration?: Value<Configuration>;
};

export type InputKind = {
  type: InputType;
  min?: number;
  max?: number;
  pattern?: string;
};

export type Status = {
  type: StatusType;
  error?: string;
  level?: Level;
  progress?: int;
};

export type Input = {
  kind?: InputKindElement;
  "max-chars"?: int;
  "visible-chars"?: int;
  "on-action"?: (text: string) => void;
  "on-focus-lost"?: (text: string) => void;
  label?: Value<string | Text>;
  icon?: Value<IconElement>;
  prefix?: Value<string | Text>;
  suffix?: Value<string | Text>;
  placeholder?: Value<string | Text>;
  tooltip?: Value<string | Text>;
  "action-icon"?: Value<IconElement>;
  disabled?: Value<boolean>;
  editable?: Value<boolean>;
  "with-counter"?: Value<boolean>;
  "with-status"?: Value<boolean>;
  "with-label"?: Value<boolean>;
  "with-clear"?: Value<boolean>;
  "align-right"?: Value<boolean>;
  "placeholder-as-label"?: Value<boolean>;
  //
  text?: Value<string | Text>;
  position?: Value<int>;
  selection?: Value<RangeElement>;
  status?: Value<StatusElement>;
  configuration?: Value<Configuration>;
};

export type Separation = {
  value: int;
  type?: SepType;
};

export type Split = {
  first: Value<Widget>;
  second: Value<Widget>;
  separation: Value<SeparationElement>;
  vertical?: Value<boolean>;
  configuration?: Value<Configuration>;
};

export type Toggle = {
  selected: Readable;
  kind?: Value<ToggleKind>;
  text?: Value<string | Text>;
  icon?: Value<IconElement>;
  tooltip?: Value<string | Text>;
  disabled?: Value<boolean>;
  indeterminate?: Readable;
  configuration?: Value<Configuration>;
};

export type Scroll = {
  widget: Value<Widget>;
  "h-scroll"?: Value<int>;
  "v-scroll"?: Value<int>;
  "h-policy"?: Value<Policy>;
  "v-policy"?: Value<Policy>;
  unit?: Value<int>;
  negative?: Value<boolean>;
  configuration?: Value<Configuration>;
};

export type Insets = {
  start?: string;
  left?: string;
  top?: string;
  end?: string;
  right?: string;
  bottom?: string;
};

export type Background = {
  color: string;
  padding?: InsetsElement;
  radius?: string;
};

export type Padding = {
  padding?: InsetsElement;
};

export type BorderLine = {
  color: string;
  padding?: InsetsElement;
};

export type Nested = {
  decorations: Decoration[];
};

export type Constraints = {
  "min-width"?: string;
  "max-width"?: string;
  "min-height"?: string;
  "max-height"?: string;
};

export type Label = {
  text?: Value<string | Text>;
  icon?: Value<IconElement>;
  tooltip?: Value<string | Text>;
  configuration?: Value<Configuration>;
};

export type Indicator = {
  progress?: Value<int>;
  configuration?: Value<Configuration>;
};

export type Decorated = {
  decoration: Value<Decoration>;
  child?: Value<Widget>;
  "rigth-to-left"?: Value<boolean>;
  configuration?: Value<Configuration>;
};

export type Constrained = {
  constraints: Value<ConstraintsElement>;
  child?: Value<Widget>;
  enforced?: Value<boolean>;
  configuration?: Value<Configuration>;
};

export type TextStyle = {
  color?: string;
  size?: string;
  slant?: Slant;
  weight?: Weight;
  "h-alignment"?: HAlignment;
  "v-alignment"?: VAlignment;
  "line-spacing"?: string;
  wrapping?: Wrapping;
  overflow?: Overflow;
  transform?: Transform;
};

export type TextView = {
  text: Value<string | Text>;
  style: Value<TextStyleElement>;
  configuration?: Value<Configuration>;
};

export type IconedAction = {
  id: string;
  icon: Value<IconElement>;
  "on-fire": () => void;
  tooltip?: Value<string | Text>;
  disabled?: Value<boolean>;
};

export type Tab = {
  id: string;
  widget: Value<Widget>;
  icon?: Value<IconElement>;
  text?: Value<string | Text>;
  discriminant?: Value<string | Text>;
  tooltip?: Value<string | Text>;
  disabled?: Value<boolean>;
  badge?: Value<string | Text>;
  progress?: Value<int>;
  closable?: Value<boolean>;
};

export type Tabs = {
  tabs?: Value<TabElement[]>;
  actions?: Value<IconedActionElement[]>;
  active?: Value<string>;
  kind?: Value<TabsKind>;
  mode?: Value<TabsMode>;
  side?: Value<Side>;
  placeholder?: Value<string | Text>;
  "icon-on-top"?: Value<boolean>;
  "min-width"?: Value<int> | int;
  "max-width"?: Value<int> | int;
  configuration?: Value<Configuration>;
};

export type TreeItem = {
  text: string;
  icon?: IconElement;
  tooltip?: string;
  id?: string;
  items?: Value<TreeItemElement[]>;
};

export type Shortcut = {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
};

export type DropdownItem = {
  id: string;
  text: string;
  icon?: IconElement;
  tooltip?: string;
  disabled: boolean;
  separator: Separator;
  shortcut?: ShorcutElement;
  perform: () => void;
};

export type DropdownSupplier = () => DropdownElement[];

export type DropdownMenu = {
  id: string;
  text: string;
  icon?: IconElement;
  tooltip?: string;
  disabled: boolean;
  separator: Separator;
  items: DropdownElement[] | DropdownSupplier;
};

export type Tree = {
  items: Value<TreeItemElement[]>;
  "on-expansion-change"?: (path: string[], value: boolean) => void;
  "on-selection-change"?: (selection: string[][]) => void;
  "on-tree-perform"?: (current: string[], selection: string[][]) => void;
  "on-tree-drop"?: (from: string[][], to: string[], drop: Drop) => void;
  "get-context-menu"?: (
    current: string[],
    selection: string[][]
  ) => DropdownElement[];
  "allow-multiple-selection"?: Value<boolean>;
  "badge-max-char"?: Value<int>;
  configuration?: Value<Configuration>;
};

export type Renderable = (scope: Scope) => Widget;

export const flexConf = (conf: FlexConf) => new Configuration("flexConf", conf);
export const stackConf = (conf: StackConf) =>
  new Configuration("stackConf", conf);
//
export const icon = (setting: Icon) => new IconElement("icon", setting);
export const range = (start: int, end: int) =>
  new RangeElement("range", { start: start, end: end });
export const inputKind = (setting: InputKind) =>
  new InputKindElement("inputKind", setting);
export const status = (setting: Status) => new StatusElement("status", setting);
export const separation = (setting: Separation) =>
  new SeparationElement("separation", setting);
export const insets = (setting: Insets) => new InsetsElement("insets", setting);
export const constraints = (setting: Constraints) =>
  new ConstraintsElement("constraints", setting);
export const textStyle = (setting: TextStyle) =>
  new TextStyleElement("textStyle", setting);
export const shortcut = (setting: Shortcut) =>
  new ShorcutElement("shortcut", setting);
//
export const background = (setting: Background) =>
  new Decoration("background", setting);
export const padding = (setting: Padding) => new Decoration("padding", setting);
export const borderLine = (setting: BorderLine) =>
  new Decoration("borderLine", setting);
export const nested = (setting: Nested) => new Decoration("nested", setting);
//
export const iconedAction = (setting: IconedAction) =>
  new IconedActionElement("iconedAction", setting);
export const tab = (setting: Tab) => new TabElement("tab", setting);
export const treeItem = (setting: TreeItem) =>
  new TreeItemElement("treeItem", setting);
export const dropdownitem = (setting: DropdownItem) =>
  new DropdownElement("dropdownitem", setting);
export const dropdownmenu = (setting: DropdownMenu) =>
  new DropdownElement("dropdownmenu", setting);
//
export const flex = (setting: Flex) => new WidgetElement("flex", setting);
export const wrap = (setting: Wrap) => new WidgetElement("wrap", setting);
export const stack = (setting: Stack) => new WidgetElement("stack", setting);
export const button = (setting: Button) => new WidgetElement("button", setting);
export const slider = (setting: Slider) => new WidgetElement("slider", setting);
export const input = (setting: Input) => new WidgetElement("input", setting);
export const split = (setting: Split) => new WidgetElement("split", setting);
export const toggle = (setting: Toggle) => new WidgetElement("toggle", setting);
export const scroll = (setting: Scroll) => new WidgetElement("scroll", setting);
export const label = (setting: Label) => new WidgetElement("label", setting);
export const indicator = (setting: Indicator) =>
  new WidgetElement("indicator", setting);
export const decorated = (setting: Decorated) =>
  new WidgetElement("decorated", setting);
export const constrained = (setting: Constrained) =>
  new WidgetElement("constrained", setting);
export const textView = (setting: TextView) =>
  new WidgetElement("textview", setting);
export const tabs = (setting: Tabs) => new WidgetElement("tabs", setting);
export const tree = (setting: Tree) => new WidgetElement("tree", setting);
//
export const insetsAll = (thickness: string) =>
  insets({
    left: thickness,
    top: thickness,
    right: thickness,
    bottom: thickness,
  });
export const paddingAll = (thickness: string) =>
  padding({ padding: insetsAll(thickness) });
//
export const renderable = (renderable: Renderable) =>
  new RenderableElement(renderable);

export interface Scope {
  alert(text: string | Text, title: Nullable<string | Text>): void;
  dialog(dialog: JSObject): void;
  create(value?: Json): Property;
  combine(
    combine: (values: JsonArray) => Json,
    combinables: Readable[],
    write?: (value: Json) => void
  ): Property;
}

interface Exports {
  SKIP_UiEngineJS_register(
    id: int,
    path: Nullable<ptr<Internal.String>>,
    type_: ptr<Internal.String>
  ): void;
  SKIP_UiEngineJS_toJS(json: ptr<Internal.Json>): Handle<Json>;
  SKIP_JSON_startObject(): ptr<Internal.PartialJSObj>;
  SKIP_JSON_addToObject(
    obj: ptr<Internal.PartialJSObj>,
    name: ptr<Internal.String>,
    value: ptr<Internal.Json>
  ): void;
  SKIP_JSON_endObject(obj: ptr<Internal.PartialJSObj>): ptr<Internal.JSObject>;
  SKIP_JSON_startArray(): ptr<Internal.PartialJSArray<Internal.Json>>;
  SKIP_JSON_addToArray(
    arr: ptr<Internal.PartialJSArray<Internal.Json>>,
    value: ptr<Internal.Json>
  ): void;
  SKIP_JSON_endArray(
    arr: ptr<Internal.PartialJSArray<Internal.Json>>
  ): ptr<Internal.JSArray<Internal.Json>>;
  SKIP_JSON_createNull(): ptr<Internal.Json>;
  SKIP_JSON_createIntNumber(v: int): ptr<Internal.Json>;
  SKIP_JSON_createFloatNumber(v: float): ptr<Internal.Json>;
  SKIP_JSON_createString(str: ptr<Internal.String>): ptr<Internal.Json>;
  SKIP_JSON_createBool(v: boolean): ptr<Internal.Json>;
}

export type Function = <T extends Json, P extends JsonArray>(..._: P) => T;

export class State {
  private nextID: number = 1;
  private readonly objects: any[] = [];
  private readonly freeIDs: number[] = [];

  register<T>(v: T): Handle<T> {
    const freeID: number | undefined = this.freeIDs.pop();
    const id = freeID ?? this.nextID++;
    this.objects[id] = v;
    return id as Handle<T>;
  }

  get<T>(id: Handle<T>): T {
    return this.objects[id] as T;
  }

  apply<R>(id: Handle<(..._: JsonArray) => R>, parameters: JsonArray): R {
    const fn = this.get(id);
    return fn.apply(null, parameters);
  }

  delete<T>(id: Handle<T>): T {
    const current = this.get(id);
    this.objects[id] = null;
    this.freeIDs.push(id);
    return current;
  }
}

export class EngShared implements Shared {
  getName = () => "skuieng";
  createScope: (data: string) => Scope;

  constructor(createScope: (data: string) => Scope) {
    this.createScope = createScope;
  }
}

export class SkuiEngUtils {
  utils: Utils;
  exports: Exports;
  state: State;
  createScope: (name: string) => Scope;

  constructor(
    utils: Utils,
    exports: any,
    createScope: (name: string) => Scope,
    state?: State
  ) {
    this.state = state ?? new State();
    this.utils = utils;
    this.exports = exports as Exports;
    this.createScope = createScope;
  }

  importValue(value: ptr<Internal.Json>) {
    return this.state.delete(this.exports.SKIP_UiEngineJS_toJS(value));
  }

  register<R, P extends any[]>(
    skPath: Nullable<ptr<Internal.String>>,
    value: (..._: P) => R
  ) {
    const id = this.state.register(value);
    this.exports.SKIP_UiEngineJS_register(
      id,
      skPath,
      this.utils.exportString(typeof value)
    );
    return id;
  }

  exportValue(
    path: Nullable<string>,
    skPath: Nullable<ptr<Internal.String>>,
    value: Json | Function | null
  ): ptr<Internal.Json> {
    const type = typeof value;
    if (value == null) {
      return this.exports.SKIP_JSON_createNull();
    } else if (type == "number") {
      return this.exports.SKIP_JSON_createFloatNumber(value as number);
    } else if (type == "boolean") {
      return this.exports.SKIP_JSON_createBool(value as boolean);
    } else if (type == "string") {
      return this.exports.SKIP_JSON_createString(
        this.utils.exportString(value as string)
      );
    } else if (Array.isArray(value)) {
      const arr = this.exports.SKIP_JSON_startArray();
      value.forEach((v) =>
        this.exports.SKIP_JSON_addToArray(
          arr,
          this.exportValue(path, skPath, v)
        )
      );
      return this.exports.SKIP_JSON_endArray(arr);
    } else if (value instanceof RenderableElement) {
      const render = (strScope: string) => {
        return value.renderable(this.createScope(strScope));
      };
      const id = this.register(skPath, render);
      return this.exportValue(path, skPath, {
        type: "renderable",
        fields: {
          id: id,
          scope: path,
        },
      });
    } else if (type == "object") {
      const jso: JsonObject =
        value instanceof JSObject ? value.toJSON() : (value as JsonObject);
      const obj = this.exports.SKIP_JSON_startObject();
      for (const key of Object.keys(jso)) {
        this.exports.SKIP_JSON_addToObject(
          obj,
          this.utils.exportString(key),
          this.exportValue(path, skPath, jso[key]!)
        );
      }
      return this.exports.SKIP_JSON_endObject(obj);
    } else if (type == "function") {
      const id = this.register(skPath, value as Function);
      return this.exportValue(path, skPath, {
        type: "function",
        fields: {
          id: id,
          scope: path,
        },
      });
    } else {
      throw new Error("'" + type + "' cannot be exported to engine.");
    }
  }
}
