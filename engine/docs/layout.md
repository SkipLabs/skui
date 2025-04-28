# Layouts 

Some of SKUI supplied predefined component are layout containers:

- [constrained](./constrained.md)
- [flex](./flex.md)
- [center](./center.md)
- [wrap](./wrap.md)
- [stack](./stack.md)
- [aspectratio](./aspectratio.md)
- [decorated](./decorated.md)

You create a layout by composing component to build more complex components.

Use a [**Decorated**](./decorated.md) when you want to add padding, margins, borders, or background color.

## How do you lay out a single component in SKUI? 

This section shows you how to create and display a simple component. It also shows the entire code for a simple Hello World app.

In SKUI, it takes only a few steps to put text, an icon, or an image on the screen.

1. Select a layout container
   
   Choose from a variety of layout containers based on how you want to align or constrain the visible component, as these characteristics are typically passed on to the contained component.

   This example uses [**Center**](./center.md) which centers its content horizontally and vertically.
2. Create a visible component

   For example, create a [**Label**](./label.md) component:

   ``` javascript

   skui.label({text: "Hello World"});

   ```

3. Add the visible component to the layout container

   All layout containers have either of the following:

   - A child property if they take a single child
    
     for example, [**Center**](./center.md), [**Decorated**](./decorated.md) or [**Constrained**](./constrained.md).
   - A children property if they take a list of components
  
     for example, [**Flex**](./flex.md), [**Wrap**](./wrap.md), or [**Stack**](./stack.md).

   Add the [**Label**](./label.md) component to the [**Center**](./center.md) container:
  
   ``` javascript

   skui.center({
     child: skui.label({text: "Hello World"})
   })

   ```
\newpage

4. Add the layout container to SKUI app.

   ``` javascript
 
   import { skui } from "skui";

   function myapp(scope) {
     return skui.center({
       child: skui.label({text: "Hello World"})
     })
   }

   skui.init(myapp);

   ```

That's all! When you run the app, you should see "Hello World" displayed.

## Layout configuration


Some containers, such as [**Flex**](./flex.md) or [**Stack**](./stack.md), provide the option to customize their children individually.

To achieve this, all predefined components have a `configuration` property that allows you to set specific settings for the layout container.

For example, with [**Flex**](./flex.md) container, it's possible to define a flex factor for it's children.

``` javascript

import { skui } from "skui";

function myapp(scope) {
  return skui.flex({
    children: [
      skui.label({text: "Label without flex"}),
      skui.label({text: "Label with flex=1", configuration:{flex:1}}),
      skui.label({text: "Label with flex=2", configuration:{flex:2}}),
      crossalignment: "center"
    ]
  })
}

skui.init(myapp);

```

\newpage