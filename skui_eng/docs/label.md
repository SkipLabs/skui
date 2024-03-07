# Label

**Label** is a non-editable text displayer.

## Usage

A **Label** is useful for displaying text that is required to fit within a specific space, and thus may need to use an ellipsis or truncation to size the string to fit.


``` javascript

import { skui } from "skui";

function myapp(scope) {
  let stroked = skui.label({text:"Send"});
  return skui.vcflex({children: [label]});
}

skui.init(myapp);

```

### Icon

An icon may optionally be added to a label to help draw attention.

``` javascript

import { skui, icons } from "skui";

function myapp(scope) {
  let label = skui.label({text:"Send", icon: icons.Send});
  return skui.vcflex({children: [label]});
}

skui.init(myapp);

```

### Tooltip

A tooltip may optionally be added to a label to express more descriptive label.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let label = skui.label({text:"Send", tooltip: "Send the mail"});
  return skui.vcflex({children: [label]});
}

skui.init(myapp);

```

### Accessibility

Include an `"aria"` property for labels requiring an accessibility descriptive label.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let label = skui.label({text:"Send", arial: "Send the mail"});
  return skui.vcflex({children: [button]});
}

skui.init(myapp);

```

## Properties

| Property      | Type                                     | Default   | Description                            |
|---------------|------------------------------------------|-----------|----------------------------------------|
| text          | string or Prop`<string>`                 | ""        | The displayed label.                   |
| icon          | ?icon or ?Prop`<icon>`                   | none      | The leading icon.                      |
| tooltip       | string or Prop`<string>`                 | ""        | The tooltip description.               |
| aria          | string or Prop`<string>`                 | ""        | The accessibility description.         |
| configuration | ?Configuration or ?Prop`<Configuration>` | none      | Container configuration properties.    |
