# Slider

Sliders allow users to view and select a value (or range) along a track.
They're ideal for adjusting settings such as volume and brightness, or for applying image filters.

Sliders can use icons or labels to represent a numeric or relative scale.

## Usage

Sliders may be continuous or discrete, and may also represent a range.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let vcontinuous = scope.create(0);
  let continuous = skui.slider({value: vcontinuous});
  let vcdiscrete = scope.create(50);
  let discrete = skui.slider({value: vcdiscrete, step: 5});
  let vrange = scope.create({start: 25, end: 75});
  let range = skui.slider({value: vrange});
  return skui.vcflex({children: [continuous, discrete, range]});
}

skui.init(myapp);

```

### Continuous


Allows users to select a value along a subjective range.


``` javascript

import { skui } from "skui";

function myapp(scope) {
  let value = scope.create(0);
  let slider = skui.slider({value, bounds: {min: 0, max: 100}});
  return skui.vcflex({children: [slider]});
}

skui.init(myapp);

```

### Discrete

Allows users to select a specific value from a predetermined range. Tick marks may be used to indicate available values.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let value = scope.create(0);
  let slider = skui.slider({value, bounds: {min: 0, max: 20}, step: 5});
  return skui.vcflex({children: [slider]});
}

skui.init(myapp);

```

\newpage

### Range

A range slider has two handles, and indicates a minimum and maximum value in a range.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let value = scope.create({start: 25, end: 75});
  let slider = skui.slider({value});
  return skui.vcflex({children: [slider]});
}

skui.init(myapp);

```
## Value label

A value label displays the specific value that corresponds with the handle's placement.

The label appears when the handle is selected. For range sliders, labels appear when either handle is selected.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let value = scope.create(0);
  let slider = skui.slider({value, labeled: true});
  return skui.vcflex({children: [slider]});
}

skui.init(myapp);

```

### Accessibility

Add an aria property to slider whose need an accessibility description.

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

\newpage

## Properties

| Property      | Type                                                               | Default          | Description                                  |
|---------------|--------------------------------------------------------------------|------------------|----------------------------------------------|
| disabled      | boolean or Prop`<`boolean`>`                                       | false            | Whether or not the slider is disabled.       |
| value         | Prop`<`number`>` or Prop`<`{start: number,end: number}`>`          |                  | The value of the slider.                     |
| bounds        | {min: number, max: number} or Prop`<`{min: number, max: number}`>` | {min:0, max:100} | The minimun and maximum value of the slider. |
| step          | ?number or ?Prop`<`number`>`                                       | none             | The discrete step.                           |
| ticks         | ?number or ?Prop`<`number`>`                                       | none             | Tick marks to show.                          |
| vertical      | boolean or Prop`<`boolean`>`                                       | false            | Display the slider verticaly.                |
| small         | boolean or Prop`<`boolean`>`                                       | false            | Display a smaller slider.                    |
| labeled       | boolean or Prop`<`boolean`>`                                       | false            | Specify if value label shall be showed.      |
| aria          | string or Prop`<`string`>`                                         | ""               | The accessibility description.               |
| configuration | ?Configuration or ?Prop`<`Configuration`>`                         | none             | Container configuration properties.          |

\newpage