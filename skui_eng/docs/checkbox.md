# Checkbox

Checkboxes allow users to select one or more items from a set. Checkboxes can turn an option on or off.

There's one type of checkbox in SKUI. Use this selection control when the user needs to select one or more options from a list.

## Usage

Checkboxes may be standalone, pre-checked, or indeterminate.

Three checkboxes in a row that are unselected, selected, and indeterminate

``` javascript

import { skui } from "skui";
  
function myapp(scope) {
  let unselected = scope.create(false);
  let ucheckbox = skui.checkbox({selected: unselected});
  let selected = scope.create(true);
  let scheckbox = skui.checkbox({selected: selected});
  let indeterminate = scope.create(true);
  let icheckbox = skui.checkbox({ selected : selected, indeterminate : indeterminate})
  return skui.vcflex({children: [ucheckbox, scheckbox, icheckbox]});
}

skui.init(myapp);

```


## Label

Associate a label with a checkbox using the text property.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let selection = scope.create(false);
  let checkbox = skui.checkbox({
    selected: selection,
    text: "Checkbox"
  });
  return skui.vcflex({children: [checkbox]});
}

skui.init(myapp);

```

### Icon

An icon may optionally be added to a checkbox to help draw attention.

``` javascript

import { skui, icons } from "skui";

function myapp(scope) {
  let selection = scope.create(false);
  let checkbox = skui.checkbox({
    selected: selection,
    text: "Checkbox",
    icon: icons.Lock
  });
  return skui.vcflex({children: [checkbox]});
}

skui.init(myapp);

```

### Tooltip

A tooltip may optionally be added to a checkboxes to express more descriptive label.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let selection = scope.create(false);
  let checkbox = skui.checkbox({
    selected: selection,
    text: "Privaty",
    tooltip: "Specify if the element is private";
  });
  return skui.vcflex({children: [checkbox]});
}

skui.init(myapp);

```

### Accessibility

Add an aria property to checkboxes whose labels need an accessibility descriptive label.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let selection = scope.create(false);
  let checkbox = skui.checkbox({
    selected: selection,
    text: "Privaty",
    aria: "Specify if the element is private";
  });
  return skui.vcflex({children: [checkbox]});
}

skui.init(myapp);

```

## Properties

| Property      | Type                                     | Default | Description                                      |
|---------------|------------------------------------------|---------|--------------------------------------------------|
| disabled      | boolean or Prop`<boolean>`               | false   | Whether or not the checkbox is disabled.         |
| text          | string or Prop`<string>`                 | ""      | The displayed label.                             |
| tooltip       | string or Prop`<string>`                 | ""      | The tooltip description.                         |
| icon          | ?icon or ?Prop`<icon>`                   | none    | The leading icon.                                |
| aria          | string or Prop`<string>`                 | ""      | The accessibility description.                   |
| selected      | Prop`<boolean>`                          |         | The property that owns the selection status.     |
| indeterminate | ?Prop`<boolean>`                         | none    | The property that owns the indeterminate status. |
| configuration | ?Configuration or ?Prop`<Configuration>` | none    | Container configuration properties.              |

