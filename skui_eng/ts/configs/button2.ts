import * as eng from "#skui_eng/skui_eng_types";
import * as icons from "#skui_eng/skui_eng_icons";

function setText(text: eng.Property, strName: string, count: number) {
  let newText = "The '" + strName + "' button was fired with a click count of " + count;
  text.set(newText);
}

var render = (scope: eng.Scope) => {
  let text = scope.create("Updated text on button click.");
  let labelElement = eng.label({text: text, icon: icons.Comment});
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
  let name = "My button";
  return eng.flex({
    widgets: [
      labelDecoration,
      eng.button({
        onFire: (count: number) => {setText(text, name, count)},
        mode: eng.ButtonMode.Basic, kind: eng.ButtonKind.Regular, text: name, icon: icons.Heart,
      })
    ],
    vertical: true,
    mainAlignment: eng.Alignment.Center,
    crossAlignment: eng.FlCrossAlign.Center,
  })
};

/** @sk config */
export var config = () => new eng.Congif("button2", "Button that change label example", render);