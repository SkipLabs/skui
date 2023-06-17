import * as eng from "#skui_eng/skui_eng_types";
import * as icons from "#skui_eng/skui_eng_icons";

function setText(text: eng.Property, strMode: string, strKind: string, count: number) {
  let newText = "The " + strMode + " " + strKind + " button was fired with a click count of " + count;
  text.set(newText);
}

function buildButton(mode: eng.ButtonMode, strKind: string, text: eng.Property) {
  const kind = eng.ButtonKind[strKind];
  return eng.button({
    onFire: (count: number) => {setText(text, eng.ButtonMode[mode], strKind, count)},
    mode: mode, kind: kind, text: strKind, icon: icons.Heart,
  });
}

function buildLine(strMode: string, text: eng.Property) {
  const mode = eng.ButtonMode[strMode];
  const line : Array<eng.Widget> = [
    eng.label({text: strMode, icon: icons.Bookmark})
  ];
  for (const strKind in eng.ButtonKind) {
    if (isNaN(Number(strKind))) {
      line.push(buildButton(mode, strKind, text));
    }
  }
  line.push(
    eng.button({
      onFire: (count: number) => {setText(text, eng.ButtonMode[mode], "Disabled", count)},
      mode: mode, text: "Disabled", icon: icons.Heart, disabled: true,
    })
  );
  return line;
}

var render = (scope: eng.Scope) => {
  let text = scope.create("Updated text on button click.");
  let labelElement = eng.label({text: text, icon: icons.Comment});
  const column : Array<eng.Widget> = [];
  for (const strMode in eng.ButtonMode) {
    if (isNaN(Number(strMode))) {
      let widgets = buildLine(strMode, text);
      let wrap = eng.wrap({widgets: widgets, spacing: 20, runSpacing: 10, crossAlignment: eng.WrCrossAlign.Center});
      let decorated = eng.decorated({decoration: eng.paddingAll("6px"), widget: wrap});
      column.push(decorated);
    }
  }
  //
  const flex = eng.flex({
    widgets: column,
    vertical: true,
    mainAlignment: eng.Alignment.Center,
    maxSize: true,
    configuration: eng.flexConf({flex: 1})
  });
  const labelDecoration = eng.decorated({
      decoration: eng.nested({
        decorations: [
        eng.paddingAll("6px"),
        eng.background({color: "aliceblue", radius: "50%h", padding: eng.insetsAll("6px")})
        ]
      }),
      widget: labelElement
    }
  );
  const widgets : Array<eng.Widget> = [labelDecoration, flex];
  return eng.flex({
    widgets: widgets,
    vertical: true,
    mainAlignment: eng.Alignment.Center,
    crossAlignment: eng.FlCrossAlign.Center,
  })
};

/** @sk config */
export var config = () => new eng.Congif("buttons", "Buttons example", render);