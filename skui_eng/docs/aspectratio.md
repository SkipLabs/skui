# AspectRatio

A container that attempts to size the child to a specific aspect ratio.

The aspect ratio is expressed as a ratio of width to height. For example, a 16:9 width:height aspect ratio would have a value of 16.0/9.0.

## Usage

First, the **AspectRatio** container attempts the largest width permitted by the layout constraints and determines the height of the widget by applying the given aspect ratio to the width, expressed as a ratio of width to height.

If the maximum width is infinite, the initial width is determined by applying the aspect ratio to the maximum height instead.

Subsequently, the **AspectRatio** container constrains computed dimensions according to the parent's constraints.

If the container fails to find a feasible size after considering each constraint, it will eventually select a size for the child that meets the layout constraints but fails to satisfy the aspect ratio constraints.

## Properties

| Property       | Type                                       | Default   | Description                                                                              |
|----------------|--------------------------------------------|-----------|------------------------------------------------------------------------------------------|
| child          | Component or Prop<Component>               | []        | The children component to place.                                                         |
| ratio          | ?number or ?Prop`<`number`>`               | none      | The ratio with which to represent the child componant.                                   |
| center         | boolean or Prop`<`boolean`>`               | false     | Indicates whether the child is centered in the space remaining after applying the ratio. |
| configuration  | ?Configuration or ?Prop`<`Configuration`>` | none      | Container configuration properties.                                                      |

\newpage