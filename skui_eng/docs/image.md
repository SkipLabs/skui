# ImageView

A component that allow to display image.

## <a name="image">*ImageDesc*</a> properties

| Property | Type                      | Default   | Description                            |
|----------|---------------------------|-----------|----------------------------------------|
| ref      | Prop<HTMLImage>           |           | The reference to the image to display. |
| width    | number                    |           | The real width of the image in pixel.  |
| height   | number                    |           | The real height of the image in pixel. |

## Properties

| Property      | Type                                       | Default   | Description                             |
|---------------|--------------------------------------------|-----------|-----------------------------------------|
| image         | [*ImageDesc*](#image) or Prop`<ImageDesc>` |           | The definition of the image to display. |
| tooltip       | string or Prop`<string>`                   | ""        | The tooltip description.                |
| placeholder   | string or Prop`<string>`                   | ""        | The placeholde of the image.            |
| aria          | string or Prop`<string>`                   | ""        | The accessibility description.          |
| configuration | ?Configuration or ?Prop`<Configuration>`   | none      | Container configuration properties.     |