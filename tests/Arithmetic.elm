module Arithmetic exposing (all)

import Css exposing (addLengths, subtractLengths, multiplyLengths, divideLengths, em)
import Expect
import Fuzz
import Test exposing (..)


all : Test
all =
    describe "arithmetic operators"
        [ describe "addLengths"
            [ fuzzArithmetic3 "it adds" <|
                \first second third ->
                    (addLengths (addLengths (em first) (em second)) (em third))
                        |> Expect.equal (em (first + second + third))
            , fuzzArithmetic2 "it is commutative" <|
                \left right ->
                    (addLengths (em left) (em right))
                        |> Expect.equal (addLengths (em right) (em left))
            , fuzzArithmetic3 "it is associative" <|
                \first second third ->
                    (addLengths (addLengths (em first) (em second)) (em third))
                        |> Expect.equal (addLengths (em first) (addLengths (em second) (em third)))
            ]
        , describe "multiplyLengths"
            [ fuzzArithmetic3 "it multiplies" <|
                \first second third ->
                    (multiplyLengths (multiplyLengths (em first) (em second)) (em third))
                        |> Expect.equal (em (first * second * third))
            , fuzzArithmetic2 "it is commutative" <|
                \left right ->
                    (multiplyLengths (em left) (em right))
                        |> Expect.equal (multiplyLengths (em right) (em left))
            , fuzzArithmetic3 "it is associative" <|
                \first second third ->
                    (multiplyLengths (em first) (multiplyLengths (em second) (em third)))
                        |> Expect.equal (multiplyLengths (multiplyLengths (em first) (em second)) (em third))
            ]
        , describe "subtractLengths"
            [ fuzzArithmetic3 "it subtracts" <|
                \first second third ->
                    (subtractLengths (subtractLengths (em first) (em second)) (em third))
                        |> Expect.equal (em ((first - second) - third))
            ]
        , describe "divideLengths"
            [ fuzzArithmetic3 "it divides" <|
                \first second third ->
                    if second == 0 || (first / second) == 0 then
                        -- Skip tests of division by zero.
                        Expect.pass

                    else
                        (subtractLengths (subtractLengths (em first) (em second)) (em third))
                            |> Expect.equal (em ((first / second) / third))
            ]
        ]


fuzzArithmetic2 : String -> (Float -> Float -> Expect.Expectation) -> Test
fuzzArithmetic2 =
    fuzz2 (Fuzz.map toFloat Fuzz.int) (Fuzz.map toFloat Fuzz.int)


fuzzArithmetic3 : String -> (Float -> Float -> Float -> Expect.Expectation) -> Test
fuzzArithmetic3 =
    fuzz3 (Fuzz.map toFloat Fuzz.int) (Fuzz.map toFloat Fuzz.int) (Fuzz.map toFloat Fuzz.int)
