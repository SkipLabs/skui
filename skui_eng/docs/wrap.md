# Wrap

A container that displays its children in multiple horizontal or vertical runs.

## Usage

A **Wrap** lays out each child and attempts to place the child adjacent to the previous child in the main axis, given by direction, leaving spacing space in between.
If there is not enough space to fit the child, **Wrap** creates a new run adjacent to the existing children in the cross axis.

After all the children have been allocated to runs, the children within the runs are positioned according to the alignment in the main axis and according to the `crossalignment` in the cross axis.

The runs themselves are then positioned in the cross axis according to the `runspacing` and `runalignment`.


## Types

| Name              | Definition                                                               |
|-------------------|--------------------------------------------------------------------------|
| []{#main}*Main*   | "start", "end", "center", "spacebetween", "spacearound" or "spaceevenly" |
| []{#cross}*Cross* | "start", "end", "center" or "stretch"                                    |

## Properties

+----------------------+------------------------------------------------------------------------+-----------+------------------------------------------------------------------------+
| Property             | Type                                                                   | Default   | Description                                                            |
+======================+========================================================================+===========+========================================================================+
| children&nbsp;       | &nbsp;(Component&nbsp;or&nbsp;Prop`<`Component`>`)[]                   | []        | The children component to place.                                       |
|                      | &nbsp;or&nbsp;Prop`<`(Component&nbsp;or&nbsp;Prop`<`Component`>`)[]`>` |           |                                                                        |
+----------------------+------------------------------------------------------------------------+-----------+------------------------------------------------------------------------+
| vertical&nbsp;       | &nbsp;boolean or Prop`<`boolean`>`                                     | false     | The direction to use as the main axis.                                 |
+----------------------+------------------------------------------------------------------------+-----------+------------------------------------------------------------------------+
| mainreversed&nbsp;   | &nbsp;boolean or Prop`<`boolean`>`                                     | false     | The main axis run direction.<br/>                                      |
|                      |                                                                        |           |                                                                        |
|                      |                                                                        |           | - **false:**                                                           |
|                      |                                                                        |           |                                                                        |
|                      |                                                                        |           |   Left to right for horizontal direction.                              |
|                      |                                                                        |           |                                                                        |
|                      |                                                                        |           |   Up to down for vertical direction.                                   |
|                      |                                                                        |           |                                                                        |
|                      |                                                                        |           | - **true:**                                                            |
|                      |                                                                        |           |                                                                        |
|                      |                                                                        |           |   Right to left for horizontal direction.                              |
|                      |                                                                        |           |                                                                        |
|                      |                                                                        |           |   Down to up for vertical direction.                                   |
+----------------------+------------------------------------------------------------------------+-----------+------------------------------------------------------------------------+
| crossreversed&nbsp;  | &nbsp;boolean or Prop`<`boolean`>`                                     | false     | The cross axis run direction.                                          |
|                      |                                                                        |           |                                                                        |
|                      |                                                                        |           | - **false:**                                                           |
|                      |                                                                        |           |                                                                        |
|                      |                                                                        |           |   Left to right for horizontal direction.                              |
|                      |                                                                        |           |                                                                        |
|                      |                                                                        |           |   Up to down for vertical direction.                                   |
|                      |                                                                        |           |                                                                        |
|                      |                                                                        |           | - **true:**                                                            |
|                      |                                                                        |           |                                                                        |
|                      |                                                                        |           |   Right to left for horizontal direction.                              |
|                      |                                                                        |           |                                                                        |
|                      |                                                                        |           |   Down to up for vertical direction.                                   |
+----------------------+------------------------------------------------------------------------+-----------+------------------------------------------------------------------------+
| mainalignment&nbsp;  | &nbsp;[*Main*](#main) or Prop`<`*Main*`>`                              | "start"   | How the children should be placed along the main axis.                 |
+----------------------+------------------------------------------------------------------------+-----------+------------------------------------------------------------------------+
| crossalignment&nbsp; | &nbsp;[*Cross*](#cross) or Prop`<`*Cross*`>`                           | "start"   | How the children should be placed along the cross axis.                |
+----------------------+------------------------------------------------------------------------+-----------+------------------------------------------------------------------------+
| spacing&nbsp;        | &nbsp;number or Prop`<`number`>`                                       | 0.0       | How much space to place between children in a run in the main axis.    |
+----------------------+------------------------------------------------------------------------+-----------+------------------------------------------------------------------------+
| runalignment&nbsp;   | &nbsp;[*Main*](#main) or Prop`<`*Main*`>`                              | "start"   | How the children should be placed along the main axis.                 |
+----------------------+------------------------------------------------------------------------+-----------+------------------------------------------------------------------------+
| runspacing&nbsp;     | &nbsp;number or Prop`<`number`>`                                       | 0.0       | How much space to place between the runs themselves in the cross axis. |
+----------------------+------------------------------------------------------------------------+-----------+------------------------------------------------------------------------+
| configuration&nbsp;  | &nbsp;?Configuration or ?Prop`<`Configuration`>`                       | none      | Container configuration properties.                                    |
+----------------------+------------------------------------------------------------------------+-----------+------------------------------------------------------------------------+

\newpage