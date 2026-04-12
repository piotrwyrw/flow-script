/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {type IdentifierToken, Token} from "../tokenizer/token.js";
import {Location} from "../tokenizer/location.js";

export namespace AST {
    // === Literal Nodes ===
    export type StringLiteral = {
        kind: "StringLiteral",
        loc: Location,

        value: string
    }

    export type NumberLiteral = {
        kind: "NumberLiteral",
        loc: Location,

        value: number
    }

    export type BooleanLiteral = {
        kind: "BooleanLiteral",
        loc: Location,

        value: boolean
    }

    export type ArrayLiteral = {
        kind: "ArrayLiteral",
        loc: Location,

        elements: Expr[]
    }

    export type VectorLiteral = {
        kind: "VectorLiteral",
        loc: Location,

        x: Expr,
        y: Expr,
        z: Expr
    }

    export type Literal =
        | StringLiteral
        | NumberLiteral
        | BooleanLiteral
        | ArrayLiteral
        | VectorLiteral

    export namespace BinaryOp {
        export type BinaryExprOperator =
            | "+"
            | "-"
            | "||"
            | "*"
            | "/"
            | "&&"
            | "<"
            | "<="
            | ">"
            | ">="
            | "=="
            | "!="

        export function binaryOperatorFrom(token: Token): BinaryExprOperator | undefined {
            switch (token.type) {
                case "Plus":
                    return "+";
                case "Minus":
                    return "-";
                case "Multiply":
                    return "*";
                case "Divide":
                    return "/";
                case "Greater":
                    return ">";
                case "GreaterEquals":
                    return ">=";
                case "Less":
                    return "<";
                case "LessEquals":
                    return "<=";
                case "And":
                    return "&&";
                case "Or":
                    return "||";
                case "DoubleEquals":
                    return "==";
                case "NotEquals":
                    return "!=";
                default:
                    return undefined;
            }
        }
    }

    export type BinaryExpr = {
        kind: "BinaryExpr",
        loc: Location,

        left: Expr,
        right: Expr,
        operator: BinaryOp.BinaryExprOperator
    }

    export type BlockExpr = {
        kind: "BlockExpr",
        loc: Location,

        body: Expr[]
    }

    export type FunctionDefExpr = {
        kind: "FunctionDefExpr",
        loc: Location,

        name?: IdentifierToken,
        params: IdentifierToken[],
        block: BlockExpr
    }

    export type CallExpr = {
        kind: "CallExpr",
        loc: Location,

        callee: Expr,
        args: Expr[]
    }

    export type IfBranch = {
        condition: Expr,
        block: BlockExpr
    }

    export type IfExpr = {
        kind: "IfExpr",
        loc: Location,

        branches: IfBranch[],
        elseBranch?: BlockExpr
    }

    export type Symbol = {
        kind: "Symbol",
        loc: Location,

        name: IdentifierToken
    }

    export type VariableDeclaration = {
        kind: "VariableDeclaration",
        loc: Location,
        name: IdentifierToken,
        value?: Expr
    }

    export type Assignment = {
        kind: "Assignment",
        loc: Location,

        target: IdentifierToken,
        value: Expr
    }

    export type WhileExpr = {
        kind: "While",
        loc: Location,

        condition: Expr,
        body: BlockExpr
    }

    export type ForExpr = {
        kind: "For",
        loc: Location,

        variable: IdentifierToken,
        iterable: Expr,
        block: BlockExpr
    }

    export type TrueExpr = {
        kind: "True",
        loc: Location
    }

    export type FalseExpr = {
        kind: "False",
        loc: Location
    }

    export type UnitExpr = {
        kind: "Unit",
        loc: Location
    }

    // === Control flow operators ===
    export type ReturnExpr = {
        kind: "ReturnExpr",
        loc: Location,

        expr?: Expr
    }

    export type ContinueExpr = {
        kind: "ContinueExpr",
        loc: Location
    }

    export type BreakExpr = {
        kind: "BreakExpr",
        loc: Location,
    }

    export type ErrorExpr = {
        kind: "ErrorExpr",
        loc: Location,

        message: Expr
    }

    export type Expr =
        | Literal
        | BlockExpr
        | BinaryExpr
        | FunctionDefExpr
        | CallExpr
        | Symbol
        | VariableDeclaration
        | Assignment
        | IfExpr
        | WhileExpr
        | ForExpr
        | TrueExpr
        | FalseExpr
        | UnitExpr
        | ReturnExpr
        | ContinueExpr
        | BreakExpr
        | ErrorExpr

    // Map node types to prettier names. Useful for displaying informative error messages
    type ExprKindsNameMapping = { [T in Expr["kind"]]: string }
    const ExprPrettyNames: ExprKindsNameMapping = {
        StringLiteral: "String Literal",
        NumberLiteral: "Number Literal",
        BooleanLiteral: "Boolean Literal",
        ArrayLiteral: "Array Literal",
        VectorLiteral: "Vector Literal",
        BlockExpr: "Block Expression",
        BinaryExpr: "Binary Expression",
        FunctionDefExpr: "Function Definition Expression",
        CallExpr: "Call Expression",
        Symbol: "Symbol Reference",
        VariableDeclaration: "Variable Declaration",
        Assignment: "Variable Assignment",
        IfExpr: "If Expression",
        While: "While Expression",
        For: "For Expression",
        True: "True",
        False: "False",
        Unit: "Unit",
        ReturnExpr: "Return Expression",
        ContinueExpr: "Continue Expression",
        BreakExpr: "Break Expression",
        ErrorExpr: "Error Expression"
    }

    export function prettyName<T extends Expr>(expr: T): string {
        return ExprPrettyNames[expr.kind]
    }

    export type Program = {
        expressions: Expr[]
    }

    export function debugFunctionName(expr: AST.FunctionDefExpr): string {
        return expr.name?.value || `<anon:${expr.loc}>`
    }
}