/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {AST} from "../syntax/ast/ast.js";
import type {BuiltinFunction} from "./builtin-function.js";

export type UnitValue = { type: "Unit" }

export type NumberValue = { type: "Number", value: number }

export type StringValue = { type: "String", value: string }

export type BooleanValue = { type: "Boolean", value: boolean }

export type VectorValue = { type: "Vector", value: { x: number, y: number, z: number } }

export type FunctionValue = { type: "Function", identifier: string, params: string[], block: AST.BlockExpr }

export type BuiltinFunctionValue = { type: "BuiltinFunction", function: BuiltinFunction}

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