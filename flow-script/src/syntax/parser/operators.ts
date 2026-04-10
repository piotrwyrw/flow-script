import {AST} from "../ast/ast.js";

export type BinaryOperatorGroup =
    | "Arithmetic"
    | "Boolean"
    | "Comparative"

type BinaryOperatorGroupDescriptor = {
    allowChaining: boolean
}

type BinaryOperatorGroupDescriptorMap = Record<BinaryOperatorGroup, BinaryOperatorGroupDescriptor>
export const BinaryOperatorGroups: BinaryOperatorGroupDescriptorMap = {
    Arithmetic: {allowChaining: true},
    Boolean: {allowChaining: true},
    Comparative: {allowChaining: false}
}

export type BinaryOperatorDescriptor = {
    precedence: number,
    group: BinaryOperatorGroup
}

type BinaryOperatorPrecedenceMap = Record<AST.BinaryOp.BinaryExprOperator, BinaryOperatorDescriptor>
export const BinaryOperatorDescriptors: BinaryOperatorPrecedenceMap = {
    "||": {precedence: 1, group: "Boolean"},
    "&&": {precedence: 2, group: "Boolean"},
    "==": {precedence: 3, group: "Comparative"},
    "!=": {precedence: 3, group: "Comparative"},
    "<=": {precedence: 4, group: "Comparative"},
    "<": {precedence: 4, group: "Comparative"},
    ">=": {precedence: 4, group: "Comparative"},
    '>': {precedence: 4, group: "Comparative"},
    "-": {precedence: 5, group: "Arithmetic"},
    "+": {precedence: 5, group: "Arithmetic"},
    "*": {precedence: 6, group: "Arithmetic"},
    "/": {precedence: 6, group: "Arithmetic"}
}