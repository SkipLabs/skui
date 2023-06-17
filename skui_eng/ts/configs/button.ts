import * as eng from "#skui_eng/skui_eng_types";
import * as icons from "#skui_eng/skui_eng_icons";

var render = (scope: eng.Scope) => {
  return eng.flex({
    widgets: [
      eng.button({
        onFire: (count: number) => {console.log("Click: " + count)},
        mode: eng.ButtonMode.Basic, kind: eng.ButtonKind.Regular, text: "My button", icon: icons.Heart,
      })
    ],
    vertical: true,
    mainAlignment: eng.Alignment.Center,
    crossAlignment: eng.FlCrossAlign.Center,
  })
};

/** @sk config */
export var config = () => new eng.Congif("button", "Button example", render);