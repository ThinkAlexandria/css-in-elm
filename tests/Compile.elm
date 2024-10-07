module Compile exposing (colorWarnings, compileTest, dreamwriter, getRgbWarnings, getRgbaWarnings, unstyledDiv)

import CompileFixtures
import Css exposing (..)
import Expect
import Fuzz exposing (Fuzzer, triple)
import Test exposing (..)
import TestUtil exposing (..)


getRgbaWarnings : { record | red: Int, green: Int, blue: Int, alpha: Float } -> Int
getRgbaWarnings { red, green, blue, alpha } =
    rgba red green blue alpha |> .warnings |> List.length


getRgbWarnings : ( Int, Int, Int ) -> Int
getRgbWarnings ( red, green, blue ) =
    rgb red green blue |> .warnings |> List.length




colorWarnings : Test
colorWarnings =
    describe "color warnings"
        [ describe "rgb"
            [ fuzz (triple validRgbValue validRgbValue validRgbValue )
                "does not warn when everything is valid"
                (getRgbWarnings >> Expect.equal 0)
            , fuzz (triple invalidRgbValue validRgbValue validRgbValue )
                "warns for invalid r values"
                (getRgbWarnings >> Expect.equal 1)
            , fuzz (triple validRgbValue invalidRgbValue validRgbValue )
                "warns for invalid g values"
                (getRgbWarnings >> Expect.equal 1)
            , fuzz (triple validRgbValue validRgbValue invalidRgbValue )
                "warns for invalid b values"
                (getRgbWarnings >> Expect.equal 1)
            ]
        , describe "rgba"
            [ fuzz (mapRgbaRecord validRgbValue validRgbValue validRgbValue validAlphaValue )
                "does not warn when everything is valid"
                (getRgbaWarnings >> Expect.equal 0)
            , fuzz (mapRgbaRecord invalidRgbValue validRgbValue validRgbValue validAlphaValue )
                "warns for invalid r values"
                (getRgbaWarnings >> Expect.equal 1)
            , fuzz (mapRgbaRecord validRgbValue invalidRgbValue validRgbValue validAlphaValue )
                "warns for invalid g values"
                (getRgbaWarnings >> Expect.equal 1)
            , fuzz (mapRgbaRecord validRgbValue validRgbValue invalidRgbValue validAlphaValue )
                "warns for invalid b values"
                (getRgbaWarnings >> Expect.equal 1)
            , fuzz (mapRgbaRecord validRgbValue validRgbValue validRgbValue invalidAlphaValue )
                "warns for invalid a values"
                (getRgbaWarnings >> Expect.equal 1)
            ]
        ]


unstyledDiv : Test
unstyledDiv =
    let
        input =
            CompileFixtures.unstyledDiv

        output =
            ""
    in
    describe "unstyled div"
        [ test "pretty prints the expected output" <|
            \() ->
                prettyPrint input
                    |> Expect.equal output
        ]


dreamwriter : Test
dreamwriter =
    let
        input =
            CompileFixtures.dreamwriter

        output =
            """
            html, body {
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              padding: 0;
              margin: 0;
            }

            body {
              min-width: 1280px;
              overflow-x: auto;
            }

            body > div {
              width: 100%;
              height: 100%;
            }

            .dreamwriterHidden {
              display: none !important;
            }

            #Page {
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              margin: 0;
              padding: 8px;
              background-color: rgb(100, 90, 128);
              color: rgb(40, 35, 76);
            }
        """
    in
    describe "Sample stylesheet from Dreamwriter"
        [ test "pretty prints the expected output" <|
            \() ->
                outdented (prettyPrint input)
                    |> Expect.equal (outdented output)
        ]


compileTest : Test
compileTest =
    let
        input =
            compile
                [ CompileFixtures.basicStyle1
                , CompileFixtures.basicStyle2
                ]

        output =
            """
            .basic1BasicStyle1 {
                display: none;
            }

            .basic2BasicStyle2 {
                display: none;
            }
            """
    in
    describe "compiles multiple stylesheets"
        [ test "compile output" <|
            \() ->
                input
                    |> .css
                    |> outdented
                    |> Expect.equal (outdented output)
        , test "compile warnings" <|
            \() ->
                input
                    |> .warnings
                    |> Expect.equal []
        ]
