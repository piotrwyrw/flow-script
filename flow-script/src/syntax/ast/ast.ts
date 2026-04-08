import {type IdentifierToken, type Location, Token} from "../tokenizer/token";
import {syntaxError} from "../../error/FSError";

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
        export type BinaryExprAdditiveOperator =
            | '+'
            | '-'
            | '||'

        export type BinaryExprMultiplicativeOperator =
            | '*'
            | '/'
            | '&&'
            | '<'
            | '<='
            | '>'
            | '>='

        export type BinaryExprOperator =
            | BinaryExprAdditiveOperator
            | BinaryExprMultiplicativeOperator

        export function binaryOperatorFrom(token: Token): BinaryExprOperator | undefined {
            switch (token.type) {
                case 'Plus':
                    return '+';
                case 'Minus':
                    return '-';
                case 'Multiply':
                    return '*';
                case 'Divide':
                    return '/';
                case 'Greater':
                    return '>';
                case 'GreaterEquals':
                    return '>=';
                case 'Less':
                    return '<';
                case 'LessEquals':
                    return '<=';
                case 'And':
                    return '&&';
                case 'Or':
                    return '||';
                default:
                    return undefined;
            }
        }

        export function isAdditiveOperator(op: BinaryExprOperator): op is BinaryExprAdditiveOperator {
            return op === '+' || op === '-' || op === '||'
        }

        export function isMultiplicativeOperator(op: BinaryExprOperator): op is BinaryExprMultiplicativeOperator {
            return !isAdditiveOperator(op)
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

        name: IdentifierToken,
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

    export type Variable = {
        kind: "Variable",
        loc: Location,

        name: IdentifierToken
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
        body: BlockExpr
    }

    export type Expr =
        | Literal
        | BinaryExpr
        | FunctionDefExpr
        | CallExpr
        | IfExpr
        | Variable
        | Assignment
        | WhileExpr
        | ForExpr
}