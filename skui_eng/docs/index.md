% SKUI
\newpage
# SKUI

The library for web and native fully reactive user interfaces

## Create user interfaces from component

SKUI lets you build user interfaces out of individual pieces called components.
Create your own SKUI components. Then combine them into entire apps.

## Write component with code

SKUI components are JavaScript functions. Want to show some content conditionally? Use an if statement.

``` javascript

import { skui } from "skui";

function example1(scope, {confirm}) {
  return eng.button({
    onfire: (count: number) => {
      if (confirm)
        scope.alert("Click: " + count);
      else
        scope.confirm("Click: " + count);
    },
    text: confirm ? "Confirm" : "Alert",
  });
};

skui.init(example1);

```

## Add interactivity wherever you need it

SKUI components receive data and return what should appear on the screen.
You can pass them new data in response to an interaction, like when the user click on a button.
SKUI will then update the screen to match the new data.

``` javascript

import { skui } from "skui";

function example2(scope) {
  let total = 0;
  let text = scope.create("Updated text on button click.");
  let label = skui.label({ text: text, icon: icons.Comment });
  let button = skui.button({
    onfire: (count: number) => {
      total += 1;
      text.set("The button was clicked " + total + 
               " times with an instant click count of " + count);
    },
    text: "Click me",
  });
  return skui.vcflex({children: [label, button]});
}

skui.init(example2);

```

## Unify web and native experience

SKUI lets you build both web apps and native apps using the same skills.
