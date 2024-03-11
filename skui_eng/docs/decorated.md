# Decorated

A container that paints a [*Decoration*](#decoration) before its positioning child.

## []{#colored}*Colored* decoration

| Property       | Type                                              | Default     | Description                                   |
|----------------|---------------------------------------------------|-------------|-----------------------------------------------|
| color          | [*Color*](./color.md)                             | transparent | The color of the component.                   |
| padding        | [*Insets*](#insets)                               | {}          | The space between its content and its border. |
| radius         | ?[*Size*](./size.md)                              | none        | The corner radius.                            |

## []{#padding}*Padding* decoration

| Property       | Type                                              | Default     | Description                                   |
|----------------|---------------------------------------------------|-------------|-----------------------------------------------|
| padding        | [*Insets*](#insets)                               | {}          | The space between its content and its border. |

## []{#borderline}*BorderLine* decoration

| Property       | Type                                              | Default     | Description                                   |
|----------------|---------------------------------------------------|-------------|-----------------------------------------------|
| color          | [*Color*](./color.md)                             |             | The color of the border.                      |
| padding        | [*Insets*](#insets)                               | {}          | The thikness of the border.                   |

## []{#nested}*Nested* decoration

| Property       | Type                                              | Default     | Description                                   |
|----------------|---------------------------------------------------|-------------|-----------------------------------------------|
| decorations    | [*Decoration*](#decoration)[]                     |             | The nested decoration.                        |


## Types

| Name                        | Definition                                                                                                |
|-----------------------------|-----------------------------------------------------------------------------------------------------------|
| []{#decoration}*Decoration* | [*Colored*](#colored), [*Padding*](#padding), [*BorderLine*](#borderline) or [*Nested*](#nested)          |
| []{#insets}*Insets*         | {start?: [*Size*](./size.md), left?: *Size*, top?: *Size*, end?: *Size*, right?: *Size*, bottom?: *Size*} |

## Properties

| Property       | Type                                                | Default   | Description                                             |
|----------------|-----------------------------------------------------|-----------|---------------------------------------------------------|
| child          | ?Component or ?Prop`<`Component`>`                  | none      | The child component to place.                           |
| rigthtoleft    | boolean or Prop`<`boolean`>`                        | false     | Whether or not the decoration is painted rigth to left. |
| decoration     | [*Decoration*](#decoration) or Prop`<`Decoration`>` |           | The decoration to paint.                                |
| configuration  | ?Configuration or ?Prop`<`Configuration`>`          | none      | Container configuration properties.                     |

\newpage