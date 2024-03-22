# Flex

A container that displays its children in a one-dimensional array.

## Usage

The **Flex** container allows you to control the axis along which the children are placed (horizontal or vertical).
This is referred to as the main axis.

To cause a child to expand to fill the available space in the direction of this component's main axis.

The **Flex** container does not manage scrolling.

The **Flex** container does not allow its children to wrap across multiple horizontal or vertical runs. For a widget that allows its children to wrap, consider using the [**Wrap**](./wrap.md) container instead of **Flex**.

## Layout algorithm

This section outlines how a **Flex** is rendered within the framework.

Layout for a **Flex** proceeds in six steps:

1. Arrange each child with a flex factor of null or zero, as specified in the child's `configuration` property, using unbounded constraints along the main axis and the incoming constraints along the cross axis.

   If the `mainalignment` is set to `"stretch"`, employ tight cross axis constraints that align with the incoming maximum extent in the cross axis.
2. Allocate the remaining space along the main axis among the children with non-zero flex factors based on their individual flex factors.

   For instance, a child with a flex factor of 2.0 will be allotted twice the amount of main axis space compared to a child with a flex factor of 1.0.
3. Arrange each of the remaining children using the same cross axis constraints as in step 1.

   Instead of employing unbounded main axis constraints, utilize maximum axis constraints determined by the allocated space in step 2.

   Children with `fitloose` `configuration` properties set to `false` are subjected to tight constraints, meaning they are compelled to fill the allocated space.

   Conversely, children with `fitloose` `configuration` properties set to `true` are provided with loose constraints, meaning they are not obligated to fill the allocated space.
4. The cross axis extent of the **Flex** is determined by the maximum cross axis extent among its children.
5. The main axis extent of the **Flex** is dictated by the `maxsize` property.

   If the `maxsize` property is set to `true`, then the main axis extent of the **Flex** equals the maximum extent of the incoming main axis constraints.

   If the `maxsize` property is set to `false`, then the main axis extent of the **Flex** is the sum of the main axis extents of its children.
6. Calculate the position for each child based on the `mainalignment` and the `crossalignment`.

   For instance, if the `mainalignment` is set to `"spacebetween"`, any remaining main axis space not allocated to children is evenly divided and positioned between the children.


## Types

| Name              | Definition                                                               |
|-------------------|--------------------------------------------------------------------------|
| []{#main}*Main*   | "start", "end", "center", "spacebetween", "spacearound" or "spaceevenly" |
| []{#cross}*Cross* | "start", "end", "center" or "stretch"                                    |


## Properties
+----------------------+------------------------------------------------------------------------------+-----------+---------------------------------------------------------+
| Property             | Type                                                                         | Default   | Description                                             |
+======================+==============================================================================+===========+=========================================================+
| children&nbsp;       | &nbsp;(Component&nbsp;or&nbsp;Prop`<`Component`>`)[]                         | []        | The children component to place.                        |
|                      | &nbsp;or&nbsp;Prop`<`(Component&nbsp;or&nbsp;Prop`<`Component`>`)[]`>`       |           |                                                         |
+----------------------+------------------------------------------------------------------------------+-----------+---------------------------------------------------------+
| vertical&nbsp;       | &nbsp;boolean or Prop`<`boolean`>`                                           | false     | The direction to use as the main axis.                  |
+----------------------+------------------------------------------------------------------------------+-----------+---------------------------------------------------------+
| mainreversed&nbsp;   | &nbsp;boolean or Prop`<`boolean`>`                                           | false     | The main axis run direction.<br/>                       |
|                      |                                                                              |           |                                                         |
|                      |                                                                              |           | - **false:**                                            |
|                      |                                                                              |           |                                                         |
|                      |                                                                              |           |   Left to right for horizontal direction.               |
|                      |                                                                              |           |                                                         |
|                      |                                                                              |           |   Up to down for vertical direction.                    |
|                      |                                                                              |           |                                                         |
|                      |                                                                              |           | - **true:**                                             |
|                      |                                                                              |           |                                                         |
|                      |                                                                              |           |   Right to left for horizontal direction.               |
|                      |                                                                              |           |                                                         |
|                      |                                                                              |           |   Down to up for vertical direction.                    |
+----------------------+------------------------------------------------------------------------------+-----------+---------------------------------------------------------+
| crossreversed&nbsp;  | &nbsp;boolean or Prop`<`boolean`>`                                           | false     | The cross axis run direction.                           |
|                      |                                                                              |           |                                                         |
|                      |                                                                              |           | - **false:**                                            |
|                      |                                                                              |           |                                                         |
|                      |                                                                              |           |   Left to right for horizontal direction.               |
|                      |                                                                              |           |                                                         |
|                      |                                                                              |           |   Up to down for vertical direction.                    |
|                      |                                                                              |           |                                                         |
|                      |                                                                              |           | - **true:**                                             |
|                      |                                                                              |           |                                                         |
|                      |                                                                              |           |   Right to left for horizontal direction.               |
|                      |                                                                              |           |                                                         |
|                      |                                                                              |           |   Down to up for vertical direction.                    |
+----------------------+------------------------------------------------------------------------------+-----------+---------------------------------------------------------+
| mainalignment&nbsp;  | &nbsp;[*Main*](#main) or Prop`<`[*Main*](#main)`>`                           | "start"   | How the children should be placed along the main axis.  |
+----------------------+------------------------------------------------------------------------------+-----------+---------------------------------------------------------+
| crossalignment&nbsp; | &nbsp;[*Cross*](#cross) or Prop`<`[*Cross*](#cross)`>`                       | "center"  | How the children should be placed along the cross axis. |
+----------------------+------------------------------------------------------------------------------+-----------+---------------------------------------------------------+
| maxsize&nbsp;        | &nbsp;boolean or Prop`<`boolean`>`                                           | false     | How much space should be occupied in the main axis.     |
+----------------------+------------------------------------------------------------------------------+-----------+---------------------------------------------------------+
| configuration&nbsp;  | &nbsp;?Configuration or ?Prop`<`Configuration`>`                             | none      | Container configuration properties.                     |
+----------------------+------------------------------------------------------------------------------+-----------+---------------------------------------------------------+

## Child configuration

| Property    | Type               | Default | Description                                                                             |
|-------------|--------------------|---------|-----------------------------------------------------------------------------------------|
| flex        | number             | 0       | The flex factor of concerned child.                                                     |
| fitloose    | boolean            | false   | Specify if the child is tigth or not.                                                   |
| ignorecross | boolean            | false   | Specify whether the child cross size is ignored during the cross size computation step. |

\newpage