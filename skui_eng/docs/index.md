% SKUI
\newpage
# SKUI

The **HTML free** library for web and native fully reactive user interfaces

## Create user interfaces from component

SKUI lets you build user interfaces out of individual pieces called components.

Create your own SKUI components.

Then combine them into entire apps.

## Write component with code

SKUI components are either predefined objects or functions.

Want to show some content conditionally? Use an if statement.

``` javascript

import { skui } from "skui";

function example1(scope, {confirm}) {
  return skui.button({
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

SKUI components receive data and return what should be rendered on the screen.

You can provide them with new data in response to an interaction, such as when the user clicks on a button.

SKUI will update the screen to reflect the new data.

``` javascript

import { skui, icons } from "skui";

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

SKUI is a reactive user interface rendering engine developed from scratch, relying only on OpenGL/WebGL.

It enables the creation of both web apps and native apps using the same skill set.

Therefore, it allows you to achieve exactly the same user experience regardless of the platform.

\newpage