/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {Interpreter} from "../interpreter.js";
import {AST} from "../../../syntax/ast/ast.js";
import type {AnyValue, ArrayValue} from "../../values.js";
import {runtimeError} from "../../../log/error.js";

export function evalArray(interpreter: Interpreter, expr: AST.ArrayLiteral): AnyValue {
    const value: AnyValue[] = []

    for (let element of expr.elements) {
        const elementResult = interpreter.evaluate(element)
        value.push(elementResult)
    }

    return {type: "Array", value}
}

export function evalArrayAccess(interpreter: Interpreter, expr: AST.ArrayAccessExpr): AnyValue {
    const array = interpreter.evaluate(expr.array)

    if (array.type !== "Array")
        runtimeError(`Cannot perform indexed access on value of type ${array.type} ${expr.loc}`)

    const index = interpreter.evaluate(expr.index)
    if (index.type !== "Number")
        runtimeError(`Index must be a number, got ${index.type} ${expr.index.loc}`)

    if (index.value >= array.value.length)
        runtimeError(`Array access is out of bounds: Index ${index.value} for length ${array.value.length} ${expr.loc}`)

    return array.value[index.value]!
}