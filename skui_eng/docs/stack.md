# Stack

**Stack** container lays out its children in a back-to-front stack.

## Usage

The z-order of the children is defined by the order of the children list with the 0th child being the bottom and last child on top.

## Properties

| Property       | Type                                                                               | Default   | Description                         |
|----------------|------------------------------------------------------------------------------------|-----------|-------------------------------------|
| children       | (Component or Prop`<`Component`>`)[] or Prop`<`(Component or Prop<Component>)[]`>` | []        | The children component to place.    |
| configuration  | ?Configuration or ?Prop`<`Configuration`>`                                         | none      | Container configuration properties. |

## Child configuration

| Property | Type                               | Default | Description                                                                  |
|----------|------------------------------------|---------|------------------------------------------------------------------------------|
| fit      | "loose", "expend" or "passthrough" | 0       | Specify how the child size is constraint.                                    |
| opaque   | boolean                            | false   | Specify if the events (mouse, key and point) are ignored in back components. |

\newpage