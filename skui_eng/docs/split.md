# Split

A component that has two sides, separated by a divider, which can be dragged by the user to give more space to one of the sides, resulting in the other side shrinking by an equal amount.

## Usage

Sides can be positioned horizontally next to each other, or stacked vertically.

The divider in a **Split** cannot overlap a side.

## Types

| Name                                  | Definition                                   |
|---------------------------------------|----------------------------------------------|
| <a name="separation">*Separation*</a> | {start:number}, {end:number} or {"%":number} |

## Properties

| Property       | Type                                              | Default      | Description                                                                             |
|----------------|---------------------------------------------------|--------------|-----------------------------------------------------------------------------------------|
| first          | Component or Prop`<Component>`                    |              | The first side of **Split**.                                                            |
| second         | Component or Prop`<Component>`                    |              | The second side of **Split**.                                                           |
| vertical       | boolean or Prop`<boolean>`                        | false        | Specify if sides are positioned horizontally next to each other, or stacked vertically. |
| separation     | [*Separation*](#separation) or Prop`<Separation>` | {start: 100} | Specify the position of the divider.                                                    |
| configuration  | ?Configuration or ?Prop`<Configuration>`          | none         | Container configuration properties.                                                     |
