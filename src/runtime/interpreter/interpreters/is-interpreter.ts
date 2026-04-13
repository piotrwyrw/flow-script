/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {Interpreter} from "../interpreter.js";
import {AST} from "../../../syntax/ast/ast.js";
import {type AnyValue, typeFromIdentifier} from "../../values.js";

export function evalIs(interpreter: Interpreter, expr: AST.IsExpr): AnyValue {
    const value = interpreter.evaluate(expr.expr)
    const expectedType = typeFromIdentifier(expr.type)

    return {type: "Boolean", value: value.type === expectedType}
}