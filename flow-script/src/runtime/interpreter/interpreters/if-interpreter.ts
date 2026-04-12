/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {Interpreter} from "../interpreter.js";
import {AST} from "../../../syntax/ast/ast.js";
import {runtimeError} from "../../../error/FSError.js";
import type {AnyValue} from "../../values.js";

export function evalIf(interpreter: Interpreter, expr: AST.IfExpr): AnyValue {
    for (let branch of expr.branches) {
        const cond = interpreter.evaluate(branch.condition)

        if (cond.type !== "Boolean")
            runtimeError(`If expression must be a boolean, got ${cond.type} ${expr.loc}`)

        if (cond.value)
            return interpreter.evaluate(branch.block)
    }

    if (!expr.elseBranch)
        return {type: "Unit"}

    return interpreter.evaluate(expr.elseBranch)
}