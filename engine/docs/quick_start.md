# Quick Start

Welcome to the SKUI documentation!
This page will give you an introduction to the SKUI concepts that you will use on a daily basis.

You will learn:

- How to create and nest custom components
- How to respond to events
- How to create reactive property and update the screen
- How to share data between components
- How to render conditions

SKUI supplies a collection of component:

- [label](./label.md)
- [image](./image.md)
- [textview](./textview.md)
- [button](./button.md)
- [checkbox](./checkbox.md)
- [radio](./radio.md)
- [switch](./switch.md)
- [input](./input.md)
- [slider](./slider.md)
- [indicator](./indicator.md)
- [flex](./flex.md)
- [wrap](./wrap.md)
- [stack](./stack.md)
- [aspectratio](./aspectratio.md)
- [split](./split.md)
- [tabs](./tabs.md)
- [tree](./tree.md)
- [scroll](./scroll.md)
- [decorated](./decorated.md)
- [constrained](./constrained.md)

You can compose that component to creates a custom one.

## Creating and nesting components

SKUI apps are made out of components.
A component is a piece of the UI (user interface) that has its own logic and appearance.
A component can be as small as a button, or as large as an entire page.

SKUI custom components are JavaScript functions that return SKUI predifined component.

``` javascript

import { skui } from "skui";

function mybutton(scope) {
  return skui.button({text: "I'm a button"});
}

skui.init(mybutton);

```

\newpage

Now that you’ve declared mybutton, you can nest it into another component:

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let label = skui.label({ text: "Welcome to my app" });
  return skui.vcflex({
    children: [label, mybutton],
  });
}

skui.init(myapp);

```

## Responding to events

Some supplied predefined compenents, likes button and input, defines some handlers to respond to events.
You can respond to events by declaring event handler functions inside your components

``` javascript

import { skui } from "skui";

function onButtonClick(clickCount) {
  alert("You clicked me " + clickCount + " times!");
}

function myapp(scope) {
  let button = skui.button(
    {
      text: "I'm a button",
      onfire: onButtonClick
    }
  );
  let label = skui.label({ text: "Welcome to my app" });
  return skui.vcflex({
    children: [label, button],
  });
};

skui.init(myapp);

```

## Update screen with reactive properties

SKUI reactivity is essentialy based on reactive properties.
A reactive property is a state that can be modified to trigger an update.

You can declare a reactive property inside your component using supplied scope:

``` javascript

function myapp(scope) {
  let text = scope.create("");
  // ...
}

```

Thanks to the created property you can: get the current value with get, (`text.get()`), and update the value with set (`text.set(<newval>)`).

At start time the text value will be empty because you passed "" to `scope.create("")`.
When you want to change state, call `text.set()` and pass the text property to the component that display it.

\newpage

SKUI component parameters can be either const values or reactive properties.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let text = scope.create("");
  let label = skui.label({ text: "Welcome to my app" });
  let input = skui.input(
    {
      placeholder: "What needs to be displayed ?",
      onaction: (value) => text.set(value.trim()),
    }
  );
  let diplayed = skui.label({text});
  return skui.vcflex({
    children: [label, input, diplayed],
  });
}

skui.init(myapp);

```

In that example, the first label has a const value as text and the second one have a reactive property as text, entering a text in the input field and pressing "Enter" display the entered text in the second label.

## Combining properties

In SKUI reactive properties can be combined to create update chain.

``` javascript

import { skui } from "skui";

function mybutton(scope) {
  const count = scope.create(0);
  const text = scope.combine((values) => "Clicked " + values[0] + " times", [count]);
  return skui.button({text, onfire: count.set(count.get() + 1)});
}

skui.init(mybutton);

```

Clicking on the button will update the `count` property, which in turn will update the `text` property, which will update the displayed button text.

If you render the same component multiple times, each will get its own state.

## Sharing properties between components

In the previous example, each mybutton had its own independent count.
However, often you’ll need components to share data and always update together.

To make multiple components display the same property and update together, you need to move the property from the individual component “upwards” to the closest component containing all of them.

\newpage

First, move the state up from mybutton into myapp, and pass the property down from myapp to each mybutton.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let count = scope.create("");
  let text = scope.combine((values) => "Clicked " + values[0] + " times", [count]);
  return 
  skui.vcflex({children: [mybutton, mybutton]}, {count, text});
}

function mybutton(scope) {
  // ... we're moving code from here ...
}

skui.init(myapp);

```

Finally, change mybutton to read the property you have passed from its parent component:

``` javascript

function mybutton(scope, {count, text}) {
  return skui.button({text, onfire: count.set(count.get() + 1)});
}

```

When you click the button, the onfire handler fires. Each button’s onfire prop update the count property from myapp, which will update the `text` property, which in turn will update the both button display text.

## Conditional rendering 

SKUI reactive properties combination can be use to manage conditioned rendering

``` javascript

import { skui } from "skui";

function adminpanel(scope) {
  // ... we're moving code from here ...
}

function loginfrom(scope) {
  // ... we're moving code from here ...
}

function myapp(scope, {isLoggedIn}) {
  let widgets = scope.combine(
    (values) => {
      if (values[0]) {
        return adminpanel
      }
      return loginfrom
    },
    [isLoggedIn]
  );
  return skui.vcflex({widgets});
}

const app = await skui.create();
const isLoggedIn = app.create(false);
app.setContent(myapp, {isLoggedIn});

```

\newpage