module Colors exposing (expectEqualsRgba, hexInt, hexTests, smallHexInt)

import Css exposing (..)
import Expect exposing (Expectation)
import Fuzz exposing (Fuzzer)
import Hex
import Test exposing (..)


hexTests : Test
hexTests =
    describe "hex color mixing"
        [ test "fff works" <|
            \() ->
                hex "fff"
                    |> expectEqualsRgba { red = 255, green = 255, blue = 255, alpha = 1 }
        , test "#fff works" <|
            \() ->
                hex "#fff"
                    |> expectEqualsRgba { red = 255, green = 255, blue = 255, alpha = 1 }
        , test "000 works" <|
            \() ->
                hex "000"
                    |> expectEqualsRgba { red = 0, green = 0, blue = 0, alpha = 1 }
        , test "#0f0 works" <|
            \() ->
                hex "#0f0"
                    |> expectEqualsRgba { red = 0, green = 255, blue = 0, alpha = 1 }
        , test "#00f works" <|
            \() ->
                hex "#00f"
                    |> expectEqualsRgba { red = 0, green = 0, blue = 255, alpha = 1 }
        , test "#f00 works" <|
            \() ->
                hex "#f00"
                    |> expectEqualsRgba { red = 255, green = 0, blue = 0, alpha = 1 }
        , test "#000 works" <|
            \() ->
                hex "#000"
                    |> expectEqualsRgba { red = 0, green = 0, blue = 0, alpha = 1 }
        , fuzz validHexString "a valid 8-char hex string" <|
            \(value, expectedResult) ->
                value
                    |> hex
                    |> expectEqualsRgba expectedResult
        ]


validHexString : Fuzzer (String, { red: Int, green: Int, blue: Int, alpha: Float})
validHexString =
    Fuzz.map4
        (\r g b a ->
            [ r, g, b, a ]
                |> List.map (Hex.toString >> String.padLeft 2 '0')
                |> String.join ""
                |> (\string ->
                    (string, { red = r, green = g, blue = b, alpha = ((Basics.toFloat a) / 255) })
                )
        )
        hexInt
        hexInt
        hexInt
        hexInt


smallHexInt : Fuzzer Int
smallHexInt =
    Fuzz.intRange 0 15


hexInt : Fuzzer Int
hexInt =
    Fuzz.intRange 0 255


expectEqualsRgba :
    { red : Int, green : Int, blue : Int, alpha : Float }
    -> { record | red : Int, green : Int, blue : Int, alpha : Float }
    -> Expectation
expectEqualsRgba expectedColor { red, green, blue, alpha } =
    Expect.equal
        { red = red, green = green, blue = blue, alpha = alpha }
        expectedColor
