# Switch

Switches toggle the state of an item on or off.

## Usage

Switches are similar to checkboxes, and can be unselected or selected.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let unselected = scope.create(false);
  let selected = scope.create(true);
    
  return eng.flex({
    children: [
      scope.switch({selected: unselected}),
      scope.switch({selected: selected}),
    ],
    vertical: true,
    mainAlignment: "center",
    crossAlignment: "center",
  });
}

skui.init(myapp);

```

### Tooltip

A tooltip may optionally be added to a switch to express descriptive info.

``` javascript

import { skui } from "skui";

class MyApp extends Component {
  
function myapp(scope) {
  let selection = scope.create(false);
    
  return eng.flex({
    children: [
      scope.switch({
        selected: selection,
        tooltip: "Switch the light"
      }),
    ],
    vertical: true,
    mainAlignment: "center",
    crossAlignment: "center",
  });
}

skui.init(myapp);

```

### Accessibility

Add an aria property to switches whose need an accessibility description.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let selection = scope.create(false);
    
  return eng.vcflex({
    children: [
      skui.switch({
        selected: selection,
        aria: "Switch the light"
      }),
    ],
  });
}

skui.init(myapp);

```

## Properties

| Property      | Type                                       | Default | Description                                  |
|---------------|--------------------------------------------|---------|----------------------------------------------|
| disabled      | boolean or Prop`<`boolean`>`               | false   | Whether or not the switch is disabled.       |
| tooltip       | string or Prop`<`string`>`                 | ""      | The tooltip description.                     |
| aria          | string or Prop`<`string`>`                 | ""      | The accessibility description.               |
| selected      | Prop`<`boolean`>`                          |         | The property that owns the selection status. |
| configuration | ?Configuration or ?Prop`<`Configuration`>` | none    | Container configuration properties.          |

\newpage