# Constrained

A container that imposes additional constraints on its child.

For example, if you wanted child to have a minimum height of 50.0 pixels, you could use {minheight: "50 px"} as the constraints.

## Types

| Name                                    | Definition                                                                                  |
|-----------------------------------------|---------------------------------------------------------------------------------------------|
| <a name="constraints">*Constraints*</a> | {minwidth?: [*Size*](./size.md), maxwidth?: *Size*, minheight?: *Size*, maxheight?: *Size*} |


## Properties

| Property       | Type                                                 | Default   | Description                                 |
|----------------|------------------------------------------------------|-----------|---------------------------------------------|
| child          | ?Component or ?Prop`<Component>`                     | none      | The child component to constrain.           |
| constraints    | [*Constraints*](#constraints) or Prop`<Constraints>` |           | The constraints to apply.                   |
| enforced       | boolean or Prop`<boolean>`                           | false     | Whether or not the constraints is enforced. |
| configuration  | ?Configuration or ?Prop`<Configuration>`             | none      | Container configuration properties.         |
