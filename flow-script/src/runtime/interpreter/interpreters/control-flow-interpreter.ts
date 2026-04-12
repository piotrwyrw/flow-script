/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {Interpreter} from "../interpreter.js";
import {AST} from "../../../syntax/ast/ast.js";
import {castValue} from "../../casting/type-cast.js";
import type {AnyValue} from "../../values.js";
import {BreakSignal, ContinueSignal, ErrorSignal, ReturnSignal} from "../control-flow.js";

export function evalReturn(interpreter: Interpreter, expr: AST.ReturnExpr): AnyValue {
    let value: AnyValue = {type: "Unit"}
    if (expr.expr)
        value = interpreter.evaluate(expr.expr)

    throw new ReturnSignal(value)
}

export function evalContinue(interpreter: Interpreter, expr: AST.ContinueExpr): AnyValue {
    throw new ContinueSignal()
}

export function evalBreak(interpreter: Interpreter, expr: AST.BreakExpr): AnyValue {
    throw new BreakSignal()
}

export function evalError(interpreter: Interpreter, expr: AST.ErrorExpr): AnyValue {
    const message = castValue(interpreter.evaluate(expr.message), "String")
    throw new ErrorSignal(message.value)
}