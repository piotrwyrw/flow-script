/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {Interpreter} from "../interpreter.js";
import {AST} from "../../../syntax/ast/ast.js";
import type {AnyValue} from "../../values.js";

export function evalArray(interpreter: Interpreter, expr: AST.ArrayLiteral): AnyValue {
    const value: AnyValue[] = []

    for (let element of expr.elements) {
        const elementResult = interpreter.evaluate(element)
        value.push(elementResult)
    }

    return {type: "Array", value}
}