# Fork notice
This is a fork of [elm-css](https://github.com/rtfeldman/elm-css). Elm-css is
abandoning support for generating CSS files and moving to locally scoped CSS
rules. The original author believes the new locally scoped design is the One
True Way and will be devoting his energy to the new design. This fork is ensure
that the 11.x branch (the last version before the design change) of css-in-elm
will be ported to future versions of Elm. This fork is commited to maintaining
the old stylesheet generating design forward into future versions of Elm.

If you like using Elm to write CSS rules, i.e. you like the power and
flexibility of a fully featured functional programming language compared to
Sass, Less, or other css preprocessors, then this is the project for you.



[![Logo](./assets/logo.png)](http://package.elm-lang.org/packages/ThinkAlexandria/css-in-elm/latest)

# css-in-elm [![Version](https://img.shields.io/npm/v/css-in-elm.svg)](https://www.npmjs.com/package/css-in-elm) [![Travis build Status](https://travis-ci.org/ThinkAlexandria/css-in-elm.svg?branch=master)](http://travis-ci.org/ThinkAlexandria/css-in-elm) [![AppVeyor build status](https://ci.appveyor.com/api/projects/status/0j7x0mpggmtu6mms/branch/master?svg=true)](https://ci.appveyor.com/project/ThinkAlexandria/css-in-elm/branch/master)

`css-in-elm` lets you define CSS in Elm.

Here's an example of how to define some `css-in-elm` styles:

```elm
module MyCss exposing (..)

import Css exposing (..)
import Css.Elements exposing (body, li)
import Css.Namespace exposing (namespace)


type CssClasses
    = NavBar


type CssIds
    = Page


css =
    (stylesheet << namespace "dreamwriter")
    [ body
        [ overflowX auto
        , minWidth (px 1280)
        ]
    , id Page
        [ backgroundColor (rgb 200 128 64)
        , color (hex "CCFFFF")
        , width (pct 100)
        , height (pct 100)
        , boxSizing borderBox
        , padding (px 8)
        , margin zero
        ]
    , class NavBar
        [ margin zero
        , padding zero
        , children
            [ li
                [ (display inlineBlock) |> important
                , color primaryAccentColor
                ]
            ]
        ]
    ]


primaryAccentColor =
    hex "ccffaa"
```

Here's what you can do with this code:

* You can *generate a `.css` file from it.*
* You can *use it to generate type-checked inline styles.*
* You can *share `NavBar` and `Page`* with your Elm view code, so your classes and IDs can never get out of sync due to a typo or refactor.
* You can *move this code into your view file* and have your styles live side-by-side with your view functions themselves.

`css-in-elm` works hard to prevent invalid styles from being generated; for example,
if you write `color "blah"` or `margin (rgb 1 2 3)`, you'll get a type mismatch. If you write `(rgb 3000 0 -3)` you'll get a build-time validation error (RGB values must be between 0 and 255) if you try to compile it to a stylesheet.

`css-in-elm` draws inspiration from the excellent [Sass](http://sass-lang.com/), [Stylus](http://stylus-lang.com/), and [CSS Modules](http://glenmaddern.com/articles/css-modules). It includes popular features like:

* [Mixins](http://package.elm-lang.org/packages/ThinkAlexandria/css-in-elm/latest/Css#mixin)
* [namespaces](http://package.elm-lang.org/packages/ThinkAlexandria/css-in-elm/latest/Css-Namespace#namespace)
* [nested media queries](https://davidwalsh.name/write-media-queries-sass) (and nested selectors in general, like how [Sass](http://sass-lang.com/) does them)

There are two popular approaches to using it; you can use either or combine both of these, depending on your needs and preferences.

#### Approach 1: Inline Styles

One way to use `css-in-elm` is for inline styles, using the `asPairs` function:

```elm
styles =
    Css.asPairs >> Html.Attributes.style

button [ styles [ position absolute, left (px 5) ] ]
    [ text "Whee!" ]
```

This approach is the simplest way to get started with `css-in-elm`. One advantage of inline styles is that these can be dynamically changed at runtime; a limitation is that CSS pseudo-classes and pseudo-elements cannot be used with inline styles.

#### Approach 2: Generating CSS files

You can also use `css-in-elm` as a CSS preprocessor which generates separate .css files.

To do this, you will need to create a special directory at the top level of
your process to contain an elm application used only to generated CSS files.

    mkdir css
    cd css/
    elm init

Then you will need to install both the node module and the Elm library:

    npm install -g css-in-elm
    elm package install ThinkAlexandria/css-in-elm

Finally you'll need a special file with a port for `css-in-elm` to access inside the `css/src` directory:

```elm
module Stylesheets exposing (..)

import MyCss
import HomepageCss

fileStructure =
        [ ( "index.css", [ MyCss.css ] )
        , ( "homepage.css", [ Homepage.css, MyCss.css ] )
        ]

```

Run `css-in-elm` from the root of your project (containing the css directory).
Then include that css file in your web page.

The above `css-in-elm` stylesheet compiles to the following .css file:

```css
body {
    overflow-x: auto;
    min-width: 1280px;
}

#dreamwriterPage {
    background-color: rgb(200, 128, 64);
    color: #CCFFFF;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 8px;
    margin: 0;
}

.dreamwriterNavBar {
    margin: 0;
    padding: 0;
}

.dreamwriterNavBar > li {
    display: inline-block !important;
    color: #ccffaa;
}
```

Try it out! (make sure you already have [elm](http://elm-lang.org) installed, e.g. with `npm install -g elm`)

```
$ npm install -g css-in-elm
$ git clone https://github.com/ThinkAlexandria/css-in-elm.git
$ cd css-in-elm/examples
$ css-in-elm
$ less homepage.css
```

A gentle introduction to some of the features of `css-in-elm` is also available in
[the tutorial](Tutorial.md).

### Examples

There are a few examples to check out!

- [json-to-elm](https://github.com/eeue56/json-to-elm) which can see be seen live [here](https://noredink.github.io/json-to-elm)
- the [examples](https://github.com/ThinkAlexandria/css-in-elm/tree/master/examples) folder, which contains a working project with a README
- the example above

#### Using `css-in-elm` with Elm view code

Here's how to use `css-in-elm` in your projects:

In your Elm code, use the same union types to represent classes and ids. Then they can't get out of sync with your CSS. To do this, you'll need special versions the of `id`, `class`, and `classList` functions from `elm-html`.


#### Missing CSS properties

`css-in-elm` is still in development. Not all CSS properties have been added yet.
If you run into this problem, `css-in-elm` includes the `property` function. It takes
two `Strings`; the property key, and its value.

**e.g.**

We want `z-index`, but suppose `css-in-elm` did not implement it. We would define it ourselves:

```elm
import Css exposing (..)

zIndex : Int -> Mixin
zIndex i =
    property "z-index" <| toString i
```

Now `zIndex 9999` is available to use inside our `Stylesheet`.

## Related Projects

* [Elm CSS Normalize](https://github.com/scottcorgan/css-in-elm-normalize)
