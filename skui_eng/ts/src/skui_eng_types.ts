import {int, float, Text} from "#skui_base/skui_types";

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

export class Handle {
  id: int;

  constructor(id: int) {
    this.id = id;
  }

  toJSON = () => {
    return this.id;
  }
}

export type FlexConf = {flex?: int, fitLoose?: boolean, ignoreCross?: boolean};

export type Flex = {
  widgets: Value<Array<Value<Object>>>, 
  vertical?: Value<boolean>, 
  rigthToLeft?: Value<boolean>, 
  mainAlignment?: Value<Alignment>, 
  crossAlignment?: Value<FlCrossAlign>, 
  maxSize?: Value<boolean>,
  configuration?: Value<Object>,
};

export type Wrap = {
  widgets: Value<Array<Value<Object>>>,
  vertical?: Value<boolean>, 
  rigthToLeft?: Value<boolean>, 
  mainAlignment?: Value<Alignment>, 
  crossAlignment?: Value<WrCrossAlign>, 
  runAlignment?: Value<Alignment>, 
  spacing?: Value<int>,
  runSpacing?: Value<int>,
  configuration?: Value<Object>,
};

export type StackConf = {fit?: Fit, opaque?: boolean};

export type Stack = {
  widgets: Value<Array<Value<Object>>>,
  configuration?: Value<Object>,
};

export type AspectRatio = {
  widgets: Value<Array<Value<Object>>>,
  ratio?: Value<float>,
  centered?: Value<boolean>,
  configuration?: Value<Object>,
};

export type Icon = {
  kind: IconKind;
  name: string;
};

export type Button = {
  onFire: Handle,
  kind?: ButtonKind,
  mode?: ButtonMode,
  text?: Value<string | Text>,
  icon?: Value<Object>,
  tooltip?: Value<string | Text>,
  disabled?: Value<boolean>,
  configuration?: Value<Object> | int
};

export type Slider = {
  value: Property,
  bounds: Value<Object>,
  range?: Value<boolean>,
  vertical?: Value<boolean>,
  step?: Value<int>,
  disabled?: Value<boolean>,
  small?: Value<boolean>,
  labeled?: Value<boolean>,
  ticks?: Value<int>,
  configuration?:  Value<Object>
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
  kind?: Object;
  maxChars?: int,
  visibleChars?: int,
  onAction?: Handle,
  onFocusLost?: Handle,
  label?: Value<string | Text>,
  icon?: Value<Object>,
  prefix?: Value<string | Text>,
  suffix?: Value<string | Text>,
  placeHolder?: Value<string | Text>,
  tooltip?: Value<string | Text>,
  actionIcon?: Value<Object>,
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
  selection?: Value<Object>,
  status?: Value<Object>,
  configuration?: Value<Object>
}

export type Separation = {
  value: int, 
  type?: SepType
}

export type Split =  {
  first: Value<Object>,
  second: Value<Object>,
  separation: Value<Object>,
  vertical?: Value<boolean>,
  configuration?: Value<Object>
}

export type Toggle =  {
  selected : Readable,
  kind?: Value<ToggleKind>,
  text?: Value<string | Text>,
  icon?: Value<Object>,
  tooltip?: Value<string | Text>,
  disabled?: Value<boolean>,
  indeterminate?: Readable,
  configuration?: Value<Object>
}

export type Scroll =  {
  widget: Value<Object>,
  hScroll?: Value<int>,
  vScroll?: Value<int>,
  hPolicy?: Value<Policy>,
  vPolicy?: Value<Policy>,
  unit?: Value<int>,
  negative?: Value<boolean>,
  configuration?: Value<Object>
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
  padding?: Object,
  radius?: string
}

export type Padding =  {
  padding?: Object,
}

export type BorderLine =  {
  color: string;
  padding?: Object,
}

export type Nested =  {
  decorations: Array<Object>
}

export type Constraints = {
  minWidth?: string,
  maxWidth?: string,
  minHeight?: string,
  maxHeight?: string,
}

export type Label = {
  text?: Value<string | Text>,
  icon?: Value<Object>,
  tooltip?: Value<string | Text>,
  configuration?: Value<Object>
}

export type Indicator = {
  progress?: Value<int>,
  configuration?: Value<Object>
}

export type Decorated = {
  decoration: Value<Object>,
  widget?: Value<Object>,
  rigthToLeft?: Value<boolean>,
  configuration?: Value<Object>
}

export type Constrained = {
  constraints: Value<Object>,
  widget?: Value<Object>,
  enforced?: Value<boolean>,
  configuration?: Value<Object>
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
  style: Value<Object>,
}
export type IconedAction = {
  id: string,
  icon: Value<Object>,
  onFire: Handle,
  tooltip?: Value<string | Text>,
  disabled?: Value<boolean>,
}

export type Tab = {
  id: string,
  widget: Value<Object>,
  icon?: Value<Object>
  text?: Value<string | Text>,
  discriminant?: Value<string | Text>,
  tooltip?: Value<string | Text>,
  disabled?: Value<boolean>,
  badge?: Value<string | Text>,
  progress?: Value<int>,
  closable?: Value<boolean>,
}

export type Tabs = {
  tabs?: Value<Array<Object>>,
  actions?: Value<Array<Object>>,
  active?: Value<string>,
  kind?: Value<TabsKind>,
  mode?: Value<TabsMode>,
  side?: Value<Side>,
  placeHolder?: Value<string | Text>,
  iconOnTop?: Value<boolean>,
  minWidth?: Value<int> | int,
  maxWidth?: Value<int> | int,
  configuration?: Value<Object>
}

export type TreeItem = {
  text: string, 
  icon?: Object, 
  tooltip?: string, 
  id?: string, 
  items?: Value<Array<Object>>
}

export type Tree = {
  items: Value<Array<Object>>,
  onExpansionChange?: Handle,
  onSelectionChange?: Handle,
  onTreePerform?: Handle,
  onTreeDrop?: Handle,
  getContextMenu?: Handle,
  allowMultipleSelection?: Value<boolean>,
  badgeMaxChar?: Value<int>,
  configuration?: Value<Object>
}


export var flexConf = (conf: FlexConf) => new Object("flexConf", conf);
export var flex = (setting: Flex) => new Object("flex", setting);
export var wrap = (setting: Wrap) => new Object("wrap", setting);
export var stackConf = (conf: StackConf) => new Object("stackConf", conf);
export var stack = (setting: Stack) => new Object("stack", setting);
export var icon = (setting: Icon) => new Object("icon", setting);
export var button = (setting: Button) => new Object("button", setting);
export var range = (start: int, end: int) => new Object("range", {start: start, end: end});
export var slider = (setting: Slider) => new Object("slider", setting);
export var inputKind = (setting: InputKind) => new Object("inputKind", setting);
export var status = (setting: Status) => new Object("status", setting);
export var input = (setting: Input) => new Object("input", setting);
export var separation = (setting: Separation) => new Object("separation", setting);
export var split = (setting: Split) => new Object("split", setting);
export var toggle = (setting: Toggle) => new Object("toggle", setting);
export var scroll = (setting: Scroll) => new Object("scroll", setting);
export var insets = (setting: Insets) => new Object("insets", setting);
export var background = (setting: Background) => new Object("background", setting);
export var padding = (setting: Padding) => new Object("padding", setting);
export var borderLine = (setting: BorderLine) => new Object("borderLine", setting);
export var nested = (setting: Nested) => new Object("nested", setting);
export var constraints = (setting: Constraints) => new Object("constraints", setting);
export var label = (setting: Label) => new Object("label", setting);
export var indicator = (setting: Indicator) => new Object("indicator", setting);
export var decorated = (setting: Decorated) => new Object("decorated", setting);
export var constrained = (setting: Constrained) => new Object("constrained", setting);
export var textStyle = (setting: TextStyle) => new Object("textStyle", setting);
export var textView = (setting: TextView) => new Object("textview", setting);
export var tab = (setting: Tab) => new Object("tab", setting);
export var iconedAction = (setting: IconedAction) => new Object("iconedAction", setting);
export var tabs = (setting: Tabs) => new Object("tabs", setting);
export var treeItem = (setting: TreeItem) => new Object("treeItem", setting);
export var tree = (setting: Tree) => new Object("tree", setting);

