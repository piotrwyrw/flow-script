/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {AST} from "../../../syntax/ast/ast";
import type {Interpreter} from "../interpreter";
import type {AnyValue} from "../../values";
import {runtimeError} from "../../../log/error";

export function evalVectorLiteral(interpreter: Interpreter, expr: AST.VectorLiteral): AnyValue {
    const x = interpreter.evaluate(expr.x)
    if (x.type !== "Number")
        runtimeError(`X Component of vector must be a Number, got ${x.type} ${expr.x.loc}`)

    const y = interpreter.evaluate(expr.y)
    if (y.type !== "Number")
        runtimeError(`Y Component of vector must be a Number, got ${y.type} ${expr.y.loc}`)

    const z = interpreter.evaluate(expr.z)
    if (z.type !== "Number")
        runtimeError(`Z Component of vector must be a Number, got ${z.type} ${expr.z.loc}`)

    return {
        type: "Vector", value: {
            x: x.value,
            y: y.value,
            z: z.value
        }
    }
}