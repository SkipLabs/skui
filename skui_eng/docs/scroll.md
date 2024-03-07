# Scroll

A control that provides a scrolled, clipped viewport of its contents.

## Usage

It allows the user to scroll the content around either directly (panning) or by using scroll bars.

The **Scroll** allows specification of the scroll bar policy, which determines when scroll bars are displayed: always, never, or only when they are needed.
The scroll bar policy can be specified independently for the horizontal and vertical scroll bars.

## Types

| Name                          | Definition                                |
|-------------------------------|-------------------------------------------|
| <a name="policy">*Policy*</a> | "always", "asneeded", "never" or "hidden" |


## Properties

| Property       | Type                                     | Default    | Description                         |
|----------------|----------------------------------------- |------------|-------------------------------------|
| content        | Component or Prop`<Component>`           | []         | The child component to scroll.      |
| hscroll        | number or Prop`<number>`                 | 0          | The horizontal scroll position.     |
| vscroll        | number or Prop`<number>`                 | 0          | The vertical scroll position.       |
| hpolicy        | [*Policy*](#policy) or Prop`<Policy>`    | "asneeded" | The horizontal scroll bar policy.   |
| vpolicy        | [*Policy*](#policy) or Prop`<Policy>`    | "asneeded" | The vertical scroll bar policy.     |
| unit           | ?number or ?Prop`<number>`               | none       | The scroll unit value               |
| negative       | boolean or Prop`<boolean>`               | false      | Use base color for scroll bars      |
| configuration  | ?Configuration or ?Prop`<Configuration>` | none       | Container configuration properties. |
