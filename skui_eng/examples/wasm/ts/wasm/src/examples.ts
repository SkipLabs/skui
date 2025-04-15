import type {
  ptr,
  Nullable,
  Utils,
  Links,
  ToWasmManager,
  Environment,
} from "@skui/engine";
import * as eng from "@skui/engine/types.js";
import * as icons from "@skui/engine/icons.js";
import type * as Internal from "@skui/engine/internal.js";

function setText(text: eng.Property, strName: string, count: number) {
  const newText = `The '${strName}' button was fired with a click count of ${count}`;
  text.set(newText);
}

const button = (_scope: eng.Scope) => {
  return eng.flex({
    children: [
      eng.button({
        onFire: (count: number) => {
          console.log(`Click: ${count}`);
        },
        mode: eng.ButtonMode.Basic,
        kind: eng.ButtonKind.Regular,
        text: "My button",
        icon: icons.Heart,
      }),
    ],
    vertical: true,
    mainalignment: eng.Alignment.Center,
    crossalignment: eng.FlCrossAlign.Center,
  });
};

const button2 = (scope: eng.Scope) => {
  const text = scope.create("Updated text on button click.");
  const labelElement = eng.label({ text: text, icon: icons.Comment });
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
    child: labelElement,
  });
  const name = "My button";
  return eng.flex({
    children: [
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
    mainalignment: eng.Alignment.Center,
    crossalignment: eng.FlCrossAlign.Center,
  });
};

function buildButton(
  mode: eng.ButtonMode,
  strKind: keyof typeof eng.ButtonKind,
  text: eng.Property
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
  const line: eng.Widget[] = [
    eng.label({ text: strMode, icon: icons.Bookmark }),
  ];
  for (const strKind in eng.ButtonKind) {
    if (isNaN(Number(strKind))) {
      line.push(
        buildButton(mode, strKind as keyof typeof eng.ButtonKind, text)
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
    })
  );
  return line;
}

const buttons = (scope: eng.Scope) => {
  const text = scope.create("Updated text on button click.");
  const labelElement = eng.label({ text: text, icon: icons.Comment });
  const column: eng.Widget[] = [];
  for (const strMode in eng.ButtonMode) {
    if (isNaN(Number(strMode))) {
      const widgets = buildLine(strMode as keyof typeof eng.ButtonMode, text);
      const wrap = eng.wrap({
        children: widgets,
        spacing: 20,
        runspacing: 10,
        crossalignment: eng.WrCrossAlign.Center,
      });
      const decorated = eng.decorated({
        decoration: eng.paddingAll("6px"),
        child: wrap,
      });
      column.push(decorated);
    }
  }
  //
  const flex = eng.flex({
    children: column,
    vertical: true,
    mainalignment: eng.Alignment.Center,
    maxsize: true,
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
    child: labelElement,
  });
  const widgets: eng.Widget[] = [labelDecoration, flex];
  return eng.flex({
    children: widgets,
    vertical: true,
    mainalignment: eng.Alignment.Center,
    crossalignment: eng.FlCrossAlign.Center,
  });
};

interface ToWasm {
  SKUI_UiEngineJS_examples: () => Nullable<ptr<Internal.JSArray>>;
  SKUI_UiEngineJS_getExample: (
    name: ptr<Internal.String>
  ) => Nullable<ptr<Internal.JSArray>>;
}

class LinksImpl implements Links, ToWasm {
  env: Environment;
  utils!: Utils;
  exports!: object;

  constructor(env: Environment) {
    this.env = env;
  }

  complete(utils: Utils, exports: object) {
    this.utils = utils;
    this.exports = exports;
  }

  SKUI_UiEngineJS_getExample(skName: ptr<Internal.String>) {
    const name = this.utils.importString(skName);
    let renderable: Nullable<eng.Renderable> = null;
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
    const shared = this.env.shared.get("skuieng") as Nullable<eng.EngShared>;
    if (renderable != null && shared) {
      const state = this.utils.getState("skuieng", () => new eng.State());
      const engUtils = new eng.SkuiEngUtils(
        this.utils,
        this.exports,
        shared.createScope,
        state
      );
      return engUtils.exportValue(
        null,
        null,
        new eng.RenderableElement(renderable)
      );
    }
    return null;
  }

  SKUI_UiEngineJS_examples() {
    const shared = this.env.shared.get("skuieng") as Nullable<eng.EngShared>;
    if (shared) {
      const state = this.utils.getState("skuieng", () => new eng.State());
      const engUtils = new eng.SkuiEngUtils(
        this.utils,
        this.exports,
        shared.createScope,
        state
      );
      return engUtils.exportValue(null, null, [
        { name: "button", description: "Button example" },
        { name: "button2", description: "Button that change label example" },
        { name: "buttons", description: "Buttons example" },
      ]);
    }
    return null;
  }
}

class Manager implements ToWasmManager {
  env: Environment;

  constructor(env: Environment) {
    this.env = env;
  }

  prepare = (wasm: object) => {
    const toWasm = wasm as ToWasm;
    const links = new LinksImpl(this.env);
    toWasm.SKUI_UiEngineJS_examples =
      links.SKUI_UiEngineJS_examples.bind(links);
    toWasm.SKUI_UiEngineJS_getExample =
      links.SKUI_UiEngineJS_getExample.bind(links);
    return links;
  };
}

export function init(env: Environment) {
  return Promise.resolve(new Manager(env));
}
