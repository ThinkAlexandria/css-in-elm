module Css.String exposing (fromListMediaQuery, fromListString, fromMediaExpression, fromMediaQuery, fromMediaType, fromPseudoElement, fromRepeatableSimpleSelector, fromSelectorCombinator)

import Css.Structure exposing (MediaExpression, MediaQuery(..), MediaType(..), PseudoElement(..), RepeatableSimpleSelector(..), SelectorCombinator(..))


fromRepeatableSimpleSelector : RepeatableSimpleSelector -> String
fromRepeatableSimpleSelector selector =
    case selector of
        ClassSelector str ->
            "ClassSelector " ++ str

        IdSelector str ->
            "IdSelector " ++ str

        PseudoClassSelector str ->
            "PseudoClassSelector" ++ str


fromSelectorCombinator : SelectorCombinator -> String
fromSelectorCombinator selector =
    case selector of
        AdjacentSibling ->
            "AdjacentSibling"

        GeneralSibling ->
            "GeneralSibling"

        Child ->
            "Child"

        Descendant ->
            "Descendant"


fromPseudoElement : PseudoElement -> String
fromPseudoElement pseudoElement =
    case pseudoElement of
        PseudoElement str ->
            "PseudoElement " ++ str


fromListMediaQuery : List MediaQuery -> String
fromListMediaQuery mediaQueries =
    fromListString (List.map fromMediaQuery mediaQueries)


fromMediaQuery : MediaQuery -> String
fromMediaQuery mediaQuery =
    case mediaQuery of
        AllQuery mediaExpressions ->
            "AllQuery " ++ fromListString (List.map fromMediaExpression mediaExpressions)

        OnlyQuery mediaType mediaExpressions ->
            "OnlyQuery " ++ fromMediaType mediaType ++ " " ++ fromListString (List.map fromMediaExpression mediaExpressions)

        NotQuery mediaType mediaExpressions ->
            "NotQuery " ++ fromMediaType mediaType ++ " " ++ fromListString (List.map fromMediaExpression mediaExpressions)

        CustomQuery str ->
            "CustomQuery " ++ str


fromMediaType : MediaType -> String
fromMediaType mediaType =
    case mediaType of
        Print ->
            "Print"

        Screen ->
            "Screen"

        Speech ->
            "Speech"


fromMediaExpression : MediaExpression -> String
fromMediaExpression mediaExpression =
    let
        value =
            case mediaExpression.value of
                Just x ->
                    "Just " ++ x

                Nothing ->
                    "Nothing"
    in
    "{ feature = " ++ mediaExpression.feature ++ ", value = " ++ value ++ " }"


fromListString : List String -> String
fromListString list =
    "[ " ++ String.join ", " list ++ " ]"
