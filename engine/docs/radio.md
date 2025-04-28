# Radio buttons

Radio buttons let people select one option from a set of options.

![A **Radio** button](./assets/radio.png)

## Usage

One radio button can be selected in a group.

``` javascript

import { skui } from "skui";

class MyApp extends Component {
  
  function myapp(scope) {
    let props = skui.radioGroup(["cats", "dogs", "birds"], "birds");
    return skui.vcflex({
      children: [
        skui.radio({selected: props.cats}),
        skui.radio({selected: props.dogs}),
        skui.radio({selected: props.birds})
      ],
    });
  };
}

skui.init(myapp);

```

## Label

Associate a label with a radio button using the text property.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let props = skui.radioGroup(["cats", "dogs", "birds"], "birds");
  return skui.vcflex({
    children: [
      skui.radio({selected: props.cats, text: "Cats"}),
      skui.radio({selected: props.dogs, text: "Dogs"}),
      skui.radio({selected: props.birds, text: "Birds"})
    ],
  });
}

skui.init(myapp);

```

\newpage

### Tooltip

A tooltip may optionally be added to radio buttons to express more descriptive label.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let props = skui.radioGroup(["cats", "dogs", "birds"], "birds");
  return skui.vcflex({
    children: [
      skui.radio({selected: props.cats, text: "Cats", tooltip: "Specify if you like cats"}),
      skui.radio({selected: props.dogs, text: "Dogs", tooltip: "Specify if you like dogs"}),
      skui.radio({selected: props.birds, text: "Birds", tooltip: "Specify if you like dogs"})
    ],
  });
}

skui.init(myapp);

```

### Accessibility

Add an aria property to radio buttons whose labels need an accessibility descriptive label.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let props = skui.radioGroup(["cats", "dogs", "birds"], "birds");
    
  return skui.vcflex({
    children: [
      skui.radio({selected: props.cats, text: "Cats", aria: "Specify if you like cats"}),
      skui.radio({selected: props.dogs, text: "Dogs", aria: "Specify if you like dogs"}),
      skui.radio({selected: props.birds, text: "Birds", aria: "Specify if you like dogs"})
    ],
  });
}

skui.init(myapp);

```

## Properties

| Property      | Type                                          | Default | Description                                  |
|---------------|-----------------------------------------------|---------|----------------------------------------------|
| disabled      | boolean or Prop`<`boolean`>`                  | false   | Whether or not the radio is disabled.        |
| text          | string or Prop`<`string`>`                    | ""      | The displayed label.                         |
| tooltip       | string or Prop`<`string`>`                    | ""      | The tooltip description.                     |
| icon          | ?icon or ?Prop`<`icon`>`                      | none    | The leading icon.                            |
| aria          | string or Prop`<`string`>`                    | ""      | The accessibility description.               |
| selected      | Prop`<`boolean`>`                             |         | The property that owns the selection status. |
| configuration | ?Configuration or ?Prop`<`Configuration`>`    | none    | Container configuration properties.          |

\newpage