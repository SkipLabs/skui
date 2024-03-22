# TextView

The **TextView** defines a component that displays a text. Paragraphs are separated by '\n' and the text is wrapped on paragraph boundaries.

## Usage

A *TextStyle* can be applied to the text in **TextView**.

## Types

| Name                        | Definition                                                                                    |
|-----------------------------|-----------------------------------------------------------------------------------------------|
| []{#transform}*Transform*   | "no", "upercase", "lowercase", "uppercasefirst" or "capitalize"                               |
| []{#overflow}*Overflow*     | "leadingchar", "centerchar", "endingchar", "leadingword", "centerword" or "endingword"        |
| []{#warpping}*Wrapping*     | "no", "char", or "word"                                                                       |
| []{#halignment}*HAlignment* | "center", "justify", "left" or "right"                                                        |
| []{#halignment}*VAlignment* | "top", "middle", or "bottom"                                                                  |
| []{#weight}*Weight*         | "thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold" or "black" |
| []{#slant}*Slant*           | "normal" or "italic"                                                                          |

## []{#style}*TextStyle* properties

| Property     | Type                                                | Default       | Description                                                                |
|--------------|-----------------------------------------------------|---------------|----------------------------------------------------------------------------|
| color        | ?[*Color*](color.md)                                | none          | The color to apply to the text.                                            |
| size         | ?[*Size*](size.md)                                  | none          | The size to apply to the text.                                             |
| slant        | [*Slant*](#slant) or Prop`<`Slant`>`                | "normal"      | The slant to apply to the text.                                            |
| weight       | [*Weight*](#weight) or Prop`<`Weight`>`             | "normal"      | The weight to apply to the text.                                           |
| halignment   | [*HAlignment*](#halignment) or Prop`<`HAlignment`>` | "left"        | The horizontal alignment to apply to the text.                             |
| valignment   | [*VAlignment*](#valignment) or Prop`<`VAlignment`>` | "top"         | The vertical alignment to apply to the text.                               |
| linespacing  | ?[*Size*](size.md)                                  | none          | The space to keep between text lines.                                      |
| wrapping     | [*Wrapping*](#wrapping) or Prop`<`Wrapping`>`       | "word"        | How the text is wrapped.                                                   |
| overflow     | [*Overflow*](#overflow) or Prop`<`Overflow`>`       | "endingchar"  | Where an how the ellipsis appear when the text overflow on it's container. |
| transform    | [*Transform*](#transform) or Prop`<`Transform`>`    | "no"          | The transforamtion to apply to the text.                                   |

## Properties

| Property       | Type                                            | Default    | Description                         |
|----------------|-------------------------------------------------|------------|-------------------------------------|
| text           | string or Prop`<`string`>`                      | ""         | The text to display.                |
| style          | ?[*TextStyle*](#style)  or ?Prop`<`TextStyle`>` | none       | The style to apply to the text.     |
| configuration  | ?Configuration or ?Prop`<`Configuration`>`      | none       | Container configuration properties. |

\newpage