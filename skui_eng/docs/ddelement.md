# DDElement

A component displayed in dropdown menu.

## Usage

The **DDElement** could be a **DropdownItem** or a **DropdownMenu**.

## Types

| Name                      | Definition                                                                |
|---------------------------|---------------------------------------------------------------------------|
| []{#separator}*Separator* | "none", "before", "after", "both"                                         |
| []{#shortcut}*Shortcut*   | {key: string, ctrl: boolean, shift: boolean, alt: boolean, meta: boolean} |


## DropdownItem properties

| Property       | Type                       | Default | Description                                             |
|----------------|----------------------------|---------|---------------------------------------------------------|
| disabled       | boolean                    | false   | Whether or not the item is disabled.                    |
| id             | string                     |         | The identifier of the item.                             |
| text           | string                     | ""      | The displayed label.                                    |
| icon           | ?icon                      | none    | The leading icon.                                       |
| tooltip        | string                     | ""      | The tooltip description.                                |
| aria           | string                     | ""      | The accessibility description.                          |
| separator      | ?[*Separator*](#separator) | none    | How the item is seperated from previous and after item. |
| shortcut       | ?[*Shorcut*](#shorcut)     | none    | The shorcut to perform the item action.                 |
| perform        | () `=>` void               |         | The action performed the item action.                   |

## DropdownMenu properties

| Property       | Type                                       | Default | Description                                             |
|----------------|--------------------------------------------|---------|---------------------------------------------------------|
| disabled       | boolean                                    | false   | Whether or not the item is disabled.                    |
| id             | string                                     |         | The identifier of the item.                             |
| text           | string                                     | ""      | The displayed label.                                    |
| icon           | ?icon                                      | none    | The leading icon.                                       |
| tooltip        | string                                     | ""      | The tooltip description.                                |
| aria           | string                                     | ""      | The accessibility description.                          |
| separator      | ?[*Separator*](#separator)                 | none    | How the item is seperated from previous and after item. |
| items          | **DDElement**[] or () `=>` **DDElement**[] | []      | The menu items.                                         |

\newpage