/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {AST} from "../syntax/ast/ast";
import type {BuiltinFunction} from "./builtin-function";
import type {Scope} from "./scope/scope";
import type {IdentifierToken} from "../syntax/tokenizer/token";

export type UnitValue = { type: "Unit" }

export type NumberValue = { type: "Number", value: number }

export type StringValue = { type: "String", value: string }

export type BooleanValue = { type: "Boolean", value: boolean }

export type VectorValue = { type: "Vector", value: { x: number, y: number, z: number } }

export type TypeValue = { type: "Type", value: IdentifierToken }

export type FunctionValue = {
    type: "Function",
    identifier: string,
    params: string[],
    block: AST.BlockExpr,
    capturedScope: Scope
}

export type BuiltinFunctionValue = { type: "BuiltinFunction", function: BuiltinFunction }

export type ArrayValue = { type: "Array", value: AnyValue[] }

export type AnyValue =
    | UnitValue
    | NumberValue
    | StringValue
    | BooleanValue
    | VectorValue
    | FunctionValue
    | BuiltinFunctionValue
    | ArrayValue

const identifierTypeMap: { [key: string]: AnyValue["type"] } = {
    "unit": "Unit",
    "number": "Number",
    "string": "String",
    "boolean": "Boolean",
    "vector": "Vector",
    "function": "Function",
    "array": "Array"
}

export function typeFromIdentifier(identifier: IdentifierToken): AnyValue["type"] | undefined {
    return identifierTypeMap[identifier.value]
}