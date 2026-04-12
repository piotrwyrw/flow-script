/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {Interpreter} from "../interpreter.js";
import {AST} from "../../../syntax/ast/ast.js";
import type {AnyValue} from "../../values.js";

export function evalBlock(interpreter: Interpreter, expr: AST.BlockExpr): AnyValue {
    let lastValue: AnyValue = {type: "Unit"}

    for (let e of expr.body) {
        lastValue = interpreter.evaluate(e)
    }

    return lastValue
}