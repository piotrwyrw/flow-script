/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {Interpreter} from "../interpreter";
import {AST} from "../../../syntax/ast/ast";
import {castValue} from "../../casting/type-cast";
import type {AnyValue} from "../../values";
import {BreakSignal, ContinueSignal, ErrorSignal, ReturnSignal} from "../control-flow";

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