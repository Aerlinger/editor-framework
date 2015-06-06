# Create Your Package

Editor Framework loads package before App runs. By default it loads packages from `editor-framework://builtin/` and `~/.{app-name}/packages/`. If you are working with [Fireball](https://github.com/fireball-x/fireball), then it will load packages from `fireball/builtin` and `~/.fireball/packages` folder.

You can customize the location it loads package from through the method `Editor.registerPackagePath` in your `App.init` function.

## Structure

In general, packages should have the following structure:

```plain
MyPackage
  |--(optional)panel
  |   |--mypanel.html
  |   |--(optional)mypanel.js
  |   |--(optional)mypanel.css
  |--(optional)widget
  | 	|--mywidget
  |       |--mywidget.html
  |       |--(optional)mywidget.js
  |       |--(optional)mywidget.css
  |--main.js
  |--package.json
```

Some key parts explained:

- `main.js`: main entry file, read the [Main Entry](#main-entry) section.
- `package.json`: package description file, not used for [npm](https://www.npmjs.com/), read [Package Description](#package-description) section.
- `panel`: this folder is necessary if your package need to open a panel to work. You can create any number of panel html files or sub-folders in this `panel` folder, if you need more than one panel for your package.
- `widget`: this folder is optional, it contains 'elements' you can use in your panels or in panels of other packages. For example buttons, drop-down menu, tabs, etc. You can organize widgets in this folder any way you like. We recommend creating a folder for each of your widget element.

For panels and widgets, you can combine script and styles to a single html file. See [this simple test case](/test/fixtures/packages/simple/panel/panel.html) as an example. You can also write script and styles in any file format that compiles to JavaScript or CSS, such as [coffeescript](http://coffeescript.org/), [stylus](https://learnboost.github.io/stylus/), [less](http://lesscss.org/), [sass](http://sass-lang.com/). Check out [Building Packages](load-and-build-packages.md) documentation for details. 

## Package Description

Each package uses a `package.json` file to describe itself. Just create this file in your package project folder.

  - `name` *String* - Name of the package, this name must be unique, otherwise it can not be published online.
  - `version` *String* - The version number that follows [semver](http://semver.org/) pattern.
  - `description` *String* (Optional) - A simple description of what your package does.
  - `author` *String* (Optional) - Who created this package.
  - `build` *Boolean* (Optional) - If build the package to `bin/dev`
  - `hosts` *Object* (Optional) - The version of the hosts required for this package.
  - `main` *String* (Optional) - A file path to the main entry javascript.
  - `menus` *Object* (Optional) - The menu list.
    - `key` *String* - Menu path, example: `foo/bar/foobar`
    - `value` *Object* - Menu options
      - [Editor Menu Template](https://github.com/fireball-x/editor-framework/blob/master/docs/api/core/menu.md)
  - `panels` *Object* (Optional) - The panel list.
    - `key` *String* - Panel name, this name will be combined with package name to create an unique panelID (e.g. `PackageName.PanelName`).
    - `value` *Object* - Panel options.
      - `frame` *String* - The panel frame html file. ( It is recommended to define it as a Polymer element ).
      - `type` *String* (Optional) - Default is `dockable`, can be `dockable`, `float`, `fixed-size`, `quick`.
      - `title` *String* (Optional) - The panel title shows in the tab label, default to the panelID.
      - `popable` *Boolean* (Optional) - Default is `true`, indicate if the panel is popable.
      - `width` *Integer* (Optional) - The width of the panel frame.
      - `height` *Integer* (Optional) - The height of the panel frame.
      - `min-width` *Integer* (Optional) - The min-width of the panel frame.
      - `min-height` *Integer* (Optional) - The min-height of the panel frame.
      - `shortcuts` *Object* (Optional) - The keyboard shortcut for the panel.
        - `key` *String* - define the key combination (example: `command+k`).
        - `value` *String* - The method name defined in the panel frame.
      - `messages` *Array* (Optional) - The ipc message name list.
      - `profiles` *Object* (Optional) - The list of default profile settings.
        - `key` *String* - The profile type, by default it can be `local` or `global`. You can register more profile type through `Editor.registerProfilePath`.
        - `value` *Object* - The default setting values.
  - `widgets` *Object* (Optional) - The widget list.
    - `key` *String* - Widget name, this name will be used as host name in `widgets://{host-name}/` protocol.
    - `value` *Object* - The widget folder path
  - `dependencies` *Object* (Optional) - The dependencies list.
  - `npmDependencies??` *Object* (Optional) - The npm dependencies list.
  - `bowerDependencies??` *Object* (Optional) - The bower dependencies list.

## Main Entry

TODO:

## Menu Path

TODO:
