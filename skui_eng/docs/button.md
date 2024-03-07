# Button

Buttons help people initiate actions, from sending an email, to sharing a document, to liking a post.

## Overview

- Can contain an optional leading icon
- Height types: basic, raised, flat, stroked, icon, miniicon, fab and minifab
- Four mode: regular, primary, accent and warn
- Keep labels concise and in sentence-case
- Containers wide enough to fit label text

## Usage

Buttons have label text that describes the action that will occur if a user taps a button.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let stroked = skui.button({kind:"stroked", text:"Send"});
  let basic = skui.button({kind:"basic", text:"Complete"});
  return skui.vcflex({children: [stroked, basic]});
}

skui.init(myapp);

```

### Icon

An icon may optionally be added to a button to help communicate the button's action and help draw attention.

``` javascript

import { skui, icons } from "skui";

function myapp(scope) {
  let button = skui.button({kind:"stroked", text:"Send", icon: icons.Send});
  return skui.vcflex({children: [button]});
}

skui.init(myapp);

```

### Tooltip

A tooltip may optionally be added to a button to express more descriptive label.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let button = skui.button({kind:"stroked", text:"Send", tooltip: "Send the mail"});
  return skui.vcflex({children: [button]});
}

skui.init(myapp);

```

### Accessibility

Add an aria property to buttons whose labels need an accessibility descriptive label.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  let button = skui.button({kind:"stroked", text:"Send", arial: "Send the mail"});
  return skui.vcflex({children: [button]});
}

skui.init(myapp);

```

## Types

| Name                      | Definition                                                                   |
|---------------------------|------------------------------------------------------------------------------|
| <a name="kind">*Kind*</a> | "basic", "raised", "flat", "stroked", "icon", "miniicon", "fab" or "minifab" |
| <a name="mode">*Mode*</a> | "regular", "primary", "accent", "warn"                                       |

## Properties

| Property      | Type                                     | Default   | Description                            |
|---------------|------------------------------------------|-----------|----------------------------------------|
| disabled      | boolean or Prop`<boolean>`               | false     | Whether or not the button is disabled. |
| text          | string or Prop`<string>`                 | ""        | The displayed label.                   |
| tooltip       | string or Prop`<string>`                 | ""        | The tooltip description.               |
| icon          | ?icon or ?Prop`<icon>`                   | none      | The leading icon.                      |
| aria          | string or Prop`<string>`                 | ""        | The accessibility description.         |
| kind          | [*Kind*](#kind)                          | "basic"   | The type of the button.                |
| mode          | [*Mode*](#mode)                          | "regular" | The mode of the button.                |
| configuration | ?Configuration or ?Prop`<Configuration>` | none      | Container configuration properties.    |

## Events

| Property | Type               | Default | Description                                                                   |
|----------|--------------------|---------|-------------------------------------------------------------------------------|
| onfire   | ?(count) `=>` void | none    | The button fire handler. Triggered on click, on enter press or on space press.|
