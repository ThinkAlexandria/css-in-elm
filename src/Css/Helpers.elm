module Css.Helpers exposing (toCssIdentifier, identifierToString)

{-| Utility functions for elm-css.

@docs toCssIdentifier, identifierToString

-}

import Regex
import String


regex : String -> Regex.Regex
regex string =
    Maybe.withDefault Regex.never (Regex.fromString string)


{-| Converts an arbitrary value to a valid CSS identifier by calling
`toString` on it, trimming it, replacing chunks of whitespace with `-`,
and stripping out invalid characters.
-}
toCssIdentifier : String -> String
toCssIdentifier identifier =
    identifier
        |> String.trim
        |> Regex.replace (regex "\\s+") (\_ -> "-")
        |> Regex.replace (regex "[^a-zA-Z0-9_-]") (\_ -> "")


{-| Converts an arbitrary identifier to a valid CSS identifier, then prepends
the given namespace.
-}
identifierToString : String -> String -> String
identifierToString name identifier =
    toCssIdentifier name ++ toCssIdentifier identifier
