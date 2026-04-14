/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {Interpreter} from "../interpreter";
import {AST} from "../../../syntax/ast/ast";
import {type AnyValue, typeFromIdentifier} from "../../values";
import {castValue} from "../../casting/type-cast";
import {runtimeError} from "../../../log/error";

export function evalCast(interpreter: Interpreter, expr: AST.CastExpr): AnyValue {
    const value = interpreter.evaluate(expr.expr)

    const type = typeFromIdentifier(expr.type)
    if (!type) {
        runtimeError(`Unable to perform type cast: Type ${expr.type.value} does not exist.`)
    }

    return castValue(value, type)
}