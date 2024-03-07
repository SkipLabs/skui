# Size

In SKUI the size is expressed as string composed with a number value and an unit.

That units can be absolute or relalive to a context.

## Absolute size unit

| Name  | Definition        |
|-------|-------------------|
| px    | Pixel             |
| cm    | Centimeter        |
| mm    | Millimeter        |
| in    | Inch              |
| pt    | Point             |
| pc    | Pica              |

The relation between the absolute units is as follows: 1in = 2.54cm = 25.4mm = 72pt = 6pc = 96px

## Relative size unit

| Name  | Definition                                                                                     |
|-------|------------------------------------------------------------------------------------------------|
| %w    | The size is computed according the width of the container.                                     |
| %h    | The size is computed according the height of the container.                                    |
| %min  | The size is computed according the minumum between the width and this height of the container. |
| %max  | The size is computed according the maximum between the width and this height of the container. |
