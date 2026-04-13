/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {Interpreter} from "../interpreter.js";
import {AST} from "../../../syntax/ast/ast.js";
import {type AnyValue, typeFromIdentifier} from "../../values.js";
import {castValue} from "../../casting/type-cast.js";
import {runtimeError} from "../../../log/error.js";

export function evalCast(interpreter: Interpreter, expr: AST.CastExpr): AnyValue {
    const value = interpreter.evaluate(expr.expr)

    const type = typeFromIdentifier(expr.type)
    if (!type) {
        runtimeError(`Unable to perform type cast: Type ${expr.type.value} does not exist.`)
    }

    return castValue(value, type)
}