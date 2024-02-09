// prettier-ignore
import type {ptr, Opt, Utils, Links, ToWasmManager, Environment} from "#std/sk_types.js";
import * as eng from "#skui_eng/skui_eng_types.js";
import * as icons from "#skui_eng/skui_eng_icons.js";

function setText(text: eng.Property, strName: string, count: number) {
  let newText =
    "The '" + strName + "' button was fired with a click count of " + count;
  text.set(newText);
}

var button = (scope: eng.Scope) => {
  return eng.flex({
    widgets: [
      eng.button({
        onFire: (count: number) => {
          console.log("Click: " + count);
        },
        mode: eng.ButtonMode.Basic,
        kind: eng.ButtonKind.Regular,
        text: "My button",
        icon: icons.Heart,
      }),
    ],
    vertical: true,
    mainAlignment: eng.Alignment.Center,
    crossAlignment: eng.FlCrossAlign.Center,
  });
};

var button2 = (scope: eng.Scope) => {
  let text = scope.create("Updated text on button click.");
  let labelElement = eng.label({ text: text, icon: icons.Comment });
  const labelDecoration = eng.decorated({
    decoration: eng.nested({
      decorations: [
        eng.paddingAll("6px"),
        eng.background({
          color: "aliceblue",
          radius: "50%h",
          padding: eng.insetsAll("6px"),
        }),
      ],
    }),
    widget: labelElement,
  });
  let name = "My button";
  return eng.flex({
    widgets: [
      labelDecoration,
      eng.button({
        onFire: (count: number) => {
          setText(text, name, count);
        },
        mode: eng.ButtonMode.Basic,
        kind: eng.ButtonKind.Regular,
        text: name,
        icon: icons.Heart,
      }),
    ],
    vertical: true,
    mainAlignment: eng.Alignment.Center,
    crossAlignment: eng.FlCrossAlign.Center,
  });
};

function buildButton(
  mode: eng.ButtonMode,
  strKind: keyof typeof eng.ButtonKind,
  text: eng.Property,
) {
  const kind = eng.ButtonKind[strKind] as number;
  return eng.button({
    onFire: (count: number) => {
      setText(text, eng.ButtonMode[mode] + " " + strKind, count);
    },
    mode: mode,
    kind: kind,
    text: strKind,
    icon: icons.Heart,
  });
}

function buildLine(strMode: keyof typeof eng.ButtonMode, text: eng.Property) {
  const mode = eng.ButtonMode[strMode];
  const line: Array<eng.Widget> = [
    eng.label({ text: strMode, icon: icons.Bookmark }),
  ];
  for (const strKind in eng.ButtonKind) {
    if (isNaN(Number(strKind))) {
      line.push(
        buildButton(mode, strKind as keyof typeof eng.ButtonKind, text),
      );
    }
  }
  line.push(
    eng.button({
      onFire: (count: number) => {
        setText(text, eng.ButtonMode[mode] + " " + "Disabled", count);
      },
      mode: mode,
      text: "Disabled",
      icon: icons.Heart,
      disabled: true,
    }),
  );
  return line;
}

var buttons = (scope: eng.Scope) => {
  let text = scope.create("Updated text on button click.");
  let labelElement = eng.label({ text: text, icon: icons.Comment });
  const column: Array<eng.Widget> = [];
  for (const strMode in eng.ButtonMode) {
    if (isNaN(Number(strMode))) {
      let widgets = buildLine(strMode as keyof typeof eng.ButtonMode, text);
      let wrap = eng.wrap({
        widgets: widgets,
        spacing: 20,
        runSpacing: 10,
        crossAlignment: eng.WrCrossAlign.Center,
      });
      let decorated = eng.decorated({
        decoration: eng.paddingAll("6px"),
        widget: wrap,
      });
      column.push(decorated);
    }
  }
  //
  const flex = eng.flex({
    widgets: column,
    vertical: true,
    mainAlignment: eng.Alignment.Center,
    maxSize: true,
    configuration: eng.flexConf({ flex: 1 }),
  });
  const labelDecoration = eng.decorated({
    decoration: eng.nested({
      decorations: [
        eng.paddingAll("6px"),
        eng.background({
          color: "aliceblue",
          radius: "50%h",
          padding: eng.insetsAll("6px"),
        }),
      ],
    }),
    widget: labelElement,
  });
  const widgets: Array<eng.Widget> = [labelDecoration, flex];
  return eng.flex({
    widgets: widgets,
    vertical: true,
    mainAlignment: eng.Alignment.Center,
    crossAlignment: eng.FlCrossAlign.Center,
  });
};

interface ToWasm {
  SKUI_UiEngineJS_examples: () => Opt<ptr>;
  SKUI_UiEngineJS_getExample: (name: ptr) => Opt<ptr>;
}

class LinksImpl implements Links, ToWasm {
  env: Environment;
  SKUI_UiEngineJS_examples!: () => Opt<ptr>;
  SKUI_UiEngineJS_getExample!: (name: ptr) => Opt<ptr>;

  constructor(env: Environment) {
    this.env = env;
  }

  complete = (utils: Utils, exports: object) => {
    this.SKUI_UiEngineJS_getExample = (skName: ptr) => {
      let name = utils.importString(skName);
      let renderable: Opt<eng.Renderable> = null;
      switch (name) {
        case "button": {
          renderable = button;
          break;
        }
        case "button2": {
          renderable = button2;
          break;
        }
        case "buttons": {
          renderable = buttons;
          break;
        }
        default: {
          break;
        }
      }
      let shared = this.env.shared.get("skuieng") as eng.EngShared;
      if (renderable != null && shared) {
        let state = utils.getState("skuieng", () => new eng.State());
        let engUtils = new eng.SkuiEngUtils(
          utils,
          exports,
          shared.createScope,
          state,
        );
        return engUtils.exportValue(
          null,
          null,
          new eng.RenderableElement(renderable),
        );
      }
      return null;
    };
    this.SKUI_UiEngineJS_examples = () => {
      let shared = this.env.shared.get("skuieng") as eng.EngShared;
      if (shared) {
        let state = utils.getState("skuieng", () => new eng.State());
        let engUtils = new eng.SkuiEngUtils(
          utils,
          exports,
          shared.createScope,
          state,
        );
        return engUtils.exportValue(null, null, [
          { name: "button", description: "Button example" },
          { name: "button2", description: "Button that change label example" },
          { name: "buttons", description: "Buttons example" },
        ]);
      }
      return null;
    };
  };
}

class Manager implements ToWasmManager {
  env: Environment;

  constructor(env: Environment) {
    this.env = env;
  }

  prepare = (wasm: object) => {
    let toWasm = wasm as ToWasm;
    let links = new LinksImpl(this.env);
    toWasm.SKUI_UiEngineJS_examples = () => links.SKUI_UiEngineJS_examples();
    toWasm.SKUI_UiEngineJS_getExample = (skName: ptr) =>
      links.SKUI_UiEngineJS_getExample(skName);
    return links;
  };
}

/** @sk init */
export function init(env: Environment) {
  return Promise.resolve(new Manager(env));
}
