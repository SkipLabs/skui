import {int, float, Text, Opt} from "#skui_base/skui_types";

export interface Readable {
  get: () => any;
}

export interface Writable {
  set: (value: any) => void;
}

export interface Property extends Writable, Readable {
}

export enum Alignment {
  Start,
  End,
  Center,
  SpaceBetween,
  SpaceAround,
  SpaceEvenly
}

export enum FlCrossAlign {
  Start,
  End,
  Center,
  Stretch
}

export enum WrCrossAlign {
  Start,
  End,
  Center
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
  Warm
}

export enum ButtonMode {
  Basic,
  Stroked,
  Raised,
  Flat,
  Icon,
  MiniIcon,
  Fab,
  MiniFab
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
  Pattern
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
  KO
}

export enum SepType {
  FromStart,
  FromEnd,
  Percent
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
  Hidden
}

export enum HAlignment {
  Center,
  Justify,
  Left,
  Right
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
  Capitalize
}

export enum Overflow {
  LeadingChar,
  CenterChar,
  EndingChar,
  LeadingWord,
  CenterWord,
  EndingWord
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
  Black = 900
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
  Both
}


export type IconKind = string | IconType;

export type Value<T> = T | Readable;

export class Object {
  type: string;
  fields: object;

  constructor(
    type: string,
    fields: object
  ) {
    this.type = type;
    this.fields = fields;
  }

  toJSON = () => {
    return {
      type: this.type,
      fields: this.fields,
    }
  }
}

export class Congif {
  name: string;
  description: string;
  renderable: Renderable;

  constructor(
    name: string,
    description: string,
    renderable: Renderable,
  ) {
    this.name = name;
    this.description = description;
    this.renderable = renderable;
  }

  toJSON = () => {
    return {
      name: this.name,
      description: this.description,
    }
  }
}

export class WidgetElement extends Object {}
export class IconElement extends Object {}
export class Configuration extends Object {}
export class Decoration extends Object {}
export class RangeElement extends Object {}
export class InputKindElement extends Object {}
export class SeparationElement extends Object {}
export class StatusElement extends Object {}
export class InsetsElement extends Object {}
export class ConstraintsElement extends Object {}
export class TextStyleElement extends Object {}
export class IconedActionElement extends Object {}
export class TabElement extends Object {}
export class TreeItemElement extends Object {}
export class DropdownElement extends Object {}
export class ShorcutElement extends Object {}
export class DialogElement extends Object {}

export class RenderableElement {
  renderable: Renderable
  constructor(renderable: Renderable) {
    this.renderable = renderable;
  }
}

export type Widget = WidgetElement | RenderableElement;

export type FlexConf = {flex?: int, fitLoose?: boolean, ignoreCross?: boolean};

export type Flex = {
  widgets: Value<Array<Value<Widget>>>, 
  vertical?: Value<boolean>, 
  rigthToLeft?: Value<boolean>, 
  mainAlignment?: Value<Alignment>, 
  crossAlignment?: Value<FlCrossAlign>, 
  maxSize?: Value<boolean>,
  configuration?: Value<Configuration>,
};

export type Wrap = {
  widgets: Value<Array<Value<Widget>>>,
  vertical?: Value<boolean>, 
  rigthToLeft?: Value<boolean>, 
  mainAlignment?: Value<Alignment>, 
  crossAlignment?: Value<WrCrossAlign>, 
  runAlignment?: Value<Alignment>, 
  spacing?: Value<int>,
  runSpacing?: Value<int>,
  configuration?: Value<Configuration>,
};

export type StackConf = {fit?: Fit, opaque?: boolean};

export type Stack = {
  widgets: Value<Array<Value<Widget>>>,
  configuration?: Value<Configuration>,
};

export type AspectRatio = {
  widgets: Value<Array<Value<Widget>>>,
  ratio?: Value<float>,
  centered?: Value<boolean>,
  configuration?: Value<Configuration>,
};

export type Icon = {
  kind: IconKind;
  name: string;
};

export type Button = {
  onFire: (count: int) => void,
  kind?: ButtonKind,
  mode?: ButtonMode,
  text?: Value<string | Text>,
  icon?: Value<IconElement>,
  tooltip?: Value<string | Text>,
  disabled?: Value<boolean>,
  configuration?: Value<Configuration>,
};

export type Slider = {
  value: Property,
  bounds: Value<RangeElement>,
  range?: Value<boolean>,
  vertical?: Value<boolean>,
  step?: Value<int>,
  disabled?: Value<boolean>,
  small?: Value<boolean>,
  labeled?: Value<boolean>,
  ticks?: Value<int>,
  configuration?: Value<Configuration>,
}

export type InputKind = {
  type: InputType,
  min?: number,
  max?: number,
  pattern?: string,
}

export type Status = {
  type: StatusType,
  error?: string,
  level?: Level,
  progress?: int
}

export type Input =  {
  kind?: InputKindElement;
  maxChars?: int,
  visibleChars?: int,
  onAction?: (text: string) => void,
  onFocusLost?: (text: string) => void,
  label?: Value<string | Text>,
  icon?: Value<IconElement>,
  prefix?: Value<string | Text>,
  suffix?: Value<string | Text>,
  placeHolder?: Value<string | Text>,
  tooltip?: Value<string | Text>,
  actionIcon?: Value<IconElement>,
  disabled?: Value<boolean>,
  editable?: Value<boolean>,
  withCounter?: Value<boolean>,
  withStatus?: Value<boolean>,
  withLabel?: Value<boolean>,
  withClear?: Value<boolean>,
  alignRight?: Value<boolean>,
  placeholderAsLabel?: Value<boolean>,
  //
  text?: Value<string | Text>,
  position?: Value<int>,
  selection?: Value<RangeElement>,
  status?: Value<StatusElement>,
  configuration?: Value<Configuration>,
}

export type Separation = {
  value: int, 
  type?: SepType
}

export type Split =  {
  first: Value<Widget>,
  second: Value<Widget>,
  separation: Value<SeparationElement>,
  vertical?: Value<boolean>,
  configuration?: Value<Configuration>,
}

export type Toggle =  {
  selected : Readable,
  kind?: Value<ToggleKind>,
  text?: Value<string | Text>,
  icon?: Value<IconElement>,
  tooltip?: Value<string | Text>,
  disabled?: Value<boolean>,
  indeterminate?: Readable,
  configuration?: Value<Configuration>,
}

export type Scroll =  {
  widget: Value<Widget>,
  hScroll?: Value<int>,
  vScroll?: Value<int>,
  hPolicy?: Value<Policy>,
  vPolicy?: Value<Policy>,
  unit?: Value<int>,
  negative?: Value<boolean>,
  configuration?: Value<Configuration>,
}

export type Insets =  {
  start?: string,
  left?: string,
  top?: string,
  end?: string
  right?: string,
  bottom?: string
}

export type Background =  {
  color: string;
  padding?: InsetsElement,
  radius?: string
}

export type Padding =  {
  padding?: InsetsElement,
}

export type BorderLine =  {
  color: string;
  padding?: InsetsElement,
}

export type Nested =  {
  decorations: Array<Decoration>
}

export type Constraints = {
  minWidth?: string,
  maxWidth?: string,
  minHeight?: string,
  maxHeight?: string,
}

export type Label = {
  text?: Value<string | Text>,
  icon?: Value<IconElement>,
  tooltip?: Value<string | Text>,
  configuration?: Value<Configuration>,
}

export type Indicator = {
  progress?: Value<int>,
  configuration?: Value<Configuration>,
}

export type Decorated = {
  decoration: Value<Decoration>,
  widget?: Value<Widget>,
  rigthToLeft?: Value<boolean>,
  configuration?: Value<Configuration>,
}

export type Constrained = {
  constraints: Value<ConstraintsElement>,
  widget?: Value<Widget>,
  enforced?: Value<boolean>,
  configuration?: Value<Configuration>,
}

export type TextStyle = {
  color?: string,
  size?: string,
  slant?: Slant,
  weight?: Weight,
  hAlignment?: HAlignment,
  vAlignment?: VAlignment,
  lineSpacing?: string,
  wrapping?: Wrapping,
  overflow?: Overflow,
  transform?: Transform,
}

export type TextView = {
  text: Value<string | Text>,
  style: Value<TextStyleElement>,
}
export type IconedAction = {
  id: string,
  icon: Value<IconElement>,
  onFire: () => void,
  tooltip?: Value<string | Text>,
  disabled?: Value<boolean>,
}

export type Tab = {
  id: string,
  widget: Value<Widget>,
  icon?: Value<IconElement>
  text?: Value<string | Text>,
  discriminant?: Value<string | Text>,
  tooltip?: Value<string | Text>,
  disabled?: Value<boolean>,
  badge?: Value<string | Text>,
  progress?: Value<int>,
  closable?: Value<boolean>,
}

export type Tabs = {
  tabs?: Value<Array<TabElement>>,
  actions?: Value<Array<IconedActionElement>>,
  active?: Value<string>,
  kind?: Value<TabsKind>,
  mode?: Value<TabsMode>,
  side?: Value<Side>,
  placeHolder?: Value<string | Text>,
  iconOnTop?: Value<boolean>,
  minWidth?: Value<int> | int,
  maxWidth?: Value<int> | int,
  configuration?: Value<Configuration>,
}

export type TreeItem = {
  text: string, 
  icon?: IconElement, 
  tooltip?: string, 
  id?: string, 
  items?: Value<Array<TreeItemElement>>
}

export type Shortcut = {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
}

export type DropdownItem = {
  id: string, 
  text: string, 
  icon?: IconElement, 
  tooltip?: string,
  disabled: boolean;
  separator: Separator;
  shortcut?: ShorcutElement;
  perform: () => void;
}

export type DropdownSupplier = () => Array<DropdownElement>;

export type DropdownMenu = {
  id: string, 
  text: string, 
  icon?: IconElement, 
  tooltip?: string,
  disabled: boolean;
  separator: Separator;
  items: Array<DropdownElement> | DropdownSupplier;
}

export type Tree = {
  items: Value<Array<TreeItemElement>>,
  onExpansionChange?: (path: Array<string>, value: boolean) => void,
  onSelectionChange?: (selection: Array<Array<string>>) => void,
  onTreePerform?: (current: Array<string>, selection: Array<Array<string>>) => void,
  onTreeDrop?: (from: Array<string>, to: Array<string>, drop: Drop) => void,
  getContextMenu?: (current: Array<string>, selection: Array<Array<string>>) => Array<DropdownElement>,
  allowMultipleSelection?: Value<boolean>,
  badgeMaxChar?: Value<int>,
  configuration?: Value<Configuration>,
}

export type Renderable = (scope: Scope) => Widget;


export var flexConf = (conf: FlexConf) => new Configuration("flexConf", conf);
export var stackConf = (conf: StackConf) => new Configuration("stackConf", conf);
//
export var icon = (setting: Icon) => new IconElement("icon", setting);
export var range = (start: int, end: int) => new RangeElement("range", {start: start, end: end});
export var inputKind = (setting: InputKind) => new InputKindElement("inputKind", setting);
export var status = (setting: Status) => new StatusElement("status", setting);
export var separation = (setting: Separation) => new SeparationElement("separation", setting);
export var insets = (setting: Insets) => new InsetsElement("insets", setting);
export var constraints = (setting: Constraints) => new ConstraintsElement("constraints", setting);
export var textStyle = (setting: TextStyle) => new TextStyleElement("textStyle", setting);
export var shortcut = (setting: Shortcut) => new ShorcutElement("shortcut", setting);
//
export var background = (setting: Background) => new Decoration("background", setting);
export var padding = (setting: Padding) => new Decoration("padding", setting);
export var borderLine = (setting: BorderLine) => new Decoration("borderLine", setting);
export var nested = (setting: Nested) => new Decoration("nested", setting);
//
export var iconedAction = (setting: IconedAction) => new IconedActionElement("iconedAction", setting);
export var tab = (setting: Tab) => new TabElement("tab", setting);
export var treeItem = (setting: TreeItem) => new TreeItemElement("treeItem", setting);
export var dropdownitem = (setting: DropdownItem) => new DropdownElement("dropdownitem", setting);
export var dropdownmenu = (setting: DropdownMenu) => new DropdownElement("dropdownmenu", setting);
//
export var flex = (setting: Flex) => new WidgetElement("flex", setting);
export var wrap = (setting: Wrap) => new WidgetElement("wrap", setting);
export var stack = (setting: Stack) => new WidgetElement("stack", setting);
export var button = (setting: Button) => new WidgetElement("button", setting);
export var slider = (setting: Slider) => new WidgetElement("slider", setting);
export var input = (setting: Input) => new WidgetElement("input", setting);
export var split = (setting: Split) => new WidgetElement("split", setting);
export var toggle = (setting: Toggle) => new WidgetElement("toggle", setting);
export var scroll = (setting: Scroll) => new WidgetElement("scroll", setting);
export var label = (setting: Label) => new WidgetElement("label", setting);
export var indicator = (setting: Indicator) => new WidgetElement("indicator", setting);
export var decorated = (setting: Decorated) => new WidgetElement("decorated", setting);
export var constrained = (setting: Constrained) => new WidgetElement("constrained", setting);
export var textView = (setting: TextView) => new WidgetElement("textview", setting);
export var tabs = (setting: Tabs) => new WidgetElement("tabs", setting);
export var tree = (setting: Tree) => new WidgetElement("tree", setting);
// 
export var insetsAll = (thickness: string) => insets({
  left: thickness,
  top: thickness,
  right: thickness,
  bottom: thickness
});
export var paddingAll = (thickness: string) => padding({padding: insetsAll(thickness)});
//
export var renderable = (renderable: Renderable) => new RenderableElement(renderable);

export interface Scope {
  alert: (text: string | Text, title: Opt<string | Text>) => void;
  dialog: (dialog: Object)  => void;
  create: (value?: any) => Property;
  combine: (
    combine: (values: Array<any>) => any, 
    combinables: Array<Readable>, 
    onWrite?: (value: any) => void
  ) => Property;
}
