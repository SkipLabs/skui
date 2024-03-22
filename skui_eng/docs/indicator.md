# Progress indicators

Progress indicators inform users about the status of ongoing processes, such as loading an app or submitting a form.

There are two types of progress indicators: linear and circular.

## Usage

Progress indicators may be determinate to show progress, or indeterminate for an unspecified amount of progress.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let progress = scope.create(0.75);
  let circular_determinated = skui.indicator({progress});
  let circular_indeterminated = skui.indicator({});
  let linear_determinated = skui.indicator({progress, linear:true});
  let linear_indeterminated = skui.indicator({linear:true});
  return skui.vcflex({children: [circular_determinated, circular_indeterminated, linear_determinated, linear_indeterminated]});
}

skui.init(myapp);

```

### Tooltip

A tooltip may optionally be added to indicators to express more descriptive label.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let progress = scope.create(0.5);
  return skui.vcflex({
    children: [
      skui.indicator({
        progress,
        tooltip: "Page refresh progress"
      })
    ]
  });
}

skui.init(myapp);

```

\newpage

### Accessibility

Add an aria property to indicators whose labels need an accessibility descriptive label.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let progress = scope.create(0.5);
  return skui.vcflex({
    children: [
      skui.indicator({
        progress,
        aria: "Page refresh progress"
      })
    ]
  });
}

skui.init(myapp);

```

## Properties

| Property      | Type                                          | Default | Description                                  |
|---------------|-----------------------------------------------|---------|----------------------------------------------|
| progress      | ?number or ?Prop`<`number`>`                  | none    | The progress value (none for indeterminated) |
| tooltip       | string or Prop`<`string`>`                    | ""      | The tooltip description.                     |
| aria          | string or Prop`<`string`>`                    | ""      | The accessibility description.               |
| linear        | boolean or Prop`<`boolean`>`                  | false   | Indicated if the indicator is linear.        |
| configuration | ?Configuration or ?Prop`<`Configuration`>`    | none    | Container configuration properties.          |

\newpage