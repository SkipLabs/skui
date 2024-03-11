# Tree

The **Tree** control provides a view on to a tree root. By using a **Tree**, it is possible to drill down into the children of a [*TreeItem*](#item), recursively until a [*TreeItem*](#item) has no children (that is, it is a leaf node in the tree).

## []{#item}*TreeItem* properties

| Property     | Type                                                     | Default   | Description                                         |
|--------------|----------------------------------------------------------|-----------|-----------------------------------------------------|
| id           | string                                                   | []        | The identifier of the *TreeItem*.                   |
| text         | string or Prop`<`string`>`                               | ""        | The displayed label.                                |
| icon         | ?icon or ?Prop`<`icon`>`                                 | none      | The icon of the *TreeItem*.                         |
| tooltip      | string or Prop`<`string`>`                               | ""        | The tooltip description.                            |
| aria         | string or Prop`<`string`>`                               | ""        | The accessibility description.                      |
| badge        | string or Prop`<`string`>`                               | ""        | A bagde label added on top right of the *TreeItem*. |
| progress     | ?string or ?Prop`<`number`>`                             | none      | Progress indication displayed on *TreeItem*.        |
| items        | [*TreeItem*](#item)[] or Prop`<`[*TreeItem*](#item)[]`>` | []        | The children of the *TreeItem*.                     |

## Properties

| Property                | Type                                                                 | Default | Description                                                                        |
|-------------------------|----------------------------------------------------------------------|---------|------------------------------------------------------------------------------------|
| items&nbsp;             | &nbsp;[*TreeItem*](#item)[] or Prop`<`[*TreeItem*](#item)[]`>`       | []      | The root items of the **Tree**.                                                    |
| multipleselection&nbsp; | &nbsp;boolean or Prop`<`boolean`>`                                   | false   | Whether or not the **Tree** allows multiple selection.                             |
| badgemaxlenght&nbsp;    | &nbsp;?number or ?Prop`<`number`>`                                   | none    | The maximum lenght of the bagde label.                                             |
| contextmenu&nbsp;       | &nbsp;?(string[], string[][]) `=>` [**DDElement**](./ddelement.md)[] | none    | The context menu elements supplier to show for this the given actor and selection. |
| configuration&nbsp;     | &nbsp;?Configuration or ?Prop`<`Configuration`>`                     | none    | Container configuration properties.                                                |

## Events

| Name                | Type                            | Default | Description                                            |
|---------------------|---------------------------------|---------|--------------------------------------------------------|
| onexpansionchange   | ?(string[], boolean) `=>` void  | none    | Triggered on **Tree** expansion change.                |
| onselectionchange   | ?(string[][]) `=>` void         | none    | Triggered on **Tree** selection change.                |
| ontreeperform       | ?(string[][]) `=>` void         | none    | Triggered on **Tree** action perform. (on enter press) |
| ontreedrop          | ?(string[], string[]) `=>` void | none    | Triggered on **Tree** drop perform.                    |

## Methods

| Name                | Type                           | Default | Description                                                                  |
|---------------------|--------------------------------|---------|------------------------------------------------------------------------------|
| setexpansion        | ?(string[], boolean) `=>` void | none    | Allows to change expansion state of given [*TreeItem*](#item) given is path. |

\newpage