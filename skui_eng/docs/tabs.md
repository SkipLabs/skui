# Tabs

A control that allows switching between a group of tabs. Only one tab is visible at a time.

## Usage

Tabs in a **Tabs** component can be positioned at any of the four sides by specifying the `side`.

A **Tabs** has two modes `"basic"` or `"flat"`, and two kinds `"fixed"` or `"scrollable"`.

The tabs can be reordered by drag and drop.

The **Tabs** component have buttons by specifying the `actions`.

## Types

| Name            | Definition                         |
|-----------------|------------------------------------|
| []{#kind}*Kind* | "fixed" or "scrollable"            |
| []{#mode}*Mode* | "regular" or "flat"                |
| []{#side}*Side* | "left", "top", "right" or "bottom" |

## Action properties

| Property     | Type                             | Default   | Description                                                                   |
|--------------|----------------------------------|-----------|-------------------------------------------------------------------------------|
| disabled     | boolean or Prop`<`boolean`>`     | false     | Whether or not the action is disabled.                                        |
| icon         | icon or Prop`<`icon`>`           | none      | The icon of the tabs.                                                         |
| onfire       | () `=>` void                     |           | The action fire handler. Triggered on click, on enter press or on space press.|
| tooltip      | string or Prop`<`string`>`       | ""        | The tooltip description.                                                      |
| aria         | string or Prop`<`string`>`       | ""        | The accessibility description.                                                |

## []{#tab}*Tab* properties

| Property     | Type                             | Default   | Description                                               |
|--------------|----------------------------------|-----------|-----------------------------------------------------------|
| id           | string                           | []        | The identifier of the *Tab*.                              |
| disabled     | boolean or Prop`<`boolean`>`     | false     | Whether or not the *Tab* is disabled.                     |
| content      | Component or Prop`<`Component`>` | []        | The component shwon when the *Tab* is selected.           |
| text         | string or Prop`<`string`>`       | ""        | The displayed label.                                      |
| discriminant | string or Prop`<`string`>`       | ""        | A discriminant label in case of two tabs have same label. |
| tooltip      | string or Prop`<`string`>`       | ""        | The tooltip description.                                  |
| icon         | ?icon or ?Prop`<`icon`>`         | none      | The icon of the *Tab*.                                    |
| aria         | string or Prop`<`string`>`       | ""        | The accessibility description.                            |
| badge        | string or Prop`<`string`>`       | ""        | A bagde label added on top right of the *Tab*.            |
| progress     | ?string or ?Prop`<`number`>`     | none      | Progress indication shonw on *Tab*.                       |
| closable     | boolean or Prop`<`boolean`>`     | false     | Whether or not the *Tab* is closable.                     |

\newpage

## Properties

| Property       | Type                                       | Default      | Description                                                          |
|----------------|--------------------------------------------|--------------|----------------------------------------------------------------------|
| tabs           | [*Tab*](#tab)[] or Prop`<`*Tab*[]`>`       | []           | The tabs to display in the **Tabs** component.                       |
| active         | string or Prop`<`string`>`                 | ""           | The active tab.                                                      |
| kind           | [*Kind*](#kind) or Prop`<`Kind`>`          | "scrollable" | The kind of the **Tabs** component.                                  |
| mode           | [*Mode*](#mode) or Prop`<`Mode`>`          | "regular"    | The mode of the **Tabs** component.                                  |
| side           | [*Side*](#side) or Prop`<`Side`>`          | "top"        | The current position of the tabs in the **Tabs** component.          |
| placeholder    | string or Prop`<`string`>`                 | ""           | The displayed message when no tabs are neither present nor selected. |
| iconontop      | boolean or Prop`<`boolean`>`               | false        | Specify it the icons of tabs has to be placed above the tabs labels. |
| minwidth       | ?number or ?Prop`<`number`>`               | none         | Specify it the min width of the tabs in the **Tabs** component.      |
| maxwidth       | ?number or ?Prop`<`number`>`               | none         | Specify it the max width of the tabs in the **Tabs** component.      |
| configuration  | ?Configuration or ?Prop`<`Configuration`>` | none         | Container configuration properties.                                  |

\newpage