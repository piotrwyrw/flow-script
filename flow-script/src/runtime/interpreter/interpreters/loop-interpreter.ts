/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {Interpreter} from "../interpreter.js";
import {AST} from "../../../syntax/ast/ast.js";
import type {AnyValue} from "../../values.js";
import {BreakSignal, ContinueSignal} from "../control-flow.js";
import {runtimeError} from "../../../log/error.js";

export function evalFor(interpreter: Interpreter, expr: AST.ForExpr): AnyValue {
    const iterable = interpreter.evaluate(expr.iterable)

    if (iterable.type !== "Array")
        runtimeError(`For loop iterable is expected to be an array, got ${iterable.type} ${expr.loc}`)

    // Enter new scope for the loop
    interpreter.runtime.scopeTree.enterNewScope(expr)

    // Define the loop variable
    interpreter.runtime.scopeTree.defineSymbol(expr.variable, {type: "Unit"})

    let value: AnyValue = {type: "Unit"}

    for (let i = 0; i < iterable.value.length; i++) {
        interpreter.runtime.scopeTree.assignSymbol(expr.variable, iterable.value[i]!)

        try {
            value = interpreter.evaluate(expr.block)
        } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
        }
    }

    // Leave the loop scope
    interpreter.runtime.scopeTree.leaveScope()

    return value;
}

export function evalWhile(interpreter: Interpreter, expr: AST.WhileExpr): AnyValue {
    // Enter a new scope for the while block
    interpreter.runtime.scopeTree.enterNewScope(expr)

    let value: AnyValue = {type: "Unit"}

    while (true) {
        const condition = interpreter.evaluate(expr.condition)

        if (condition.type !== "Boolean")
            runtimeError(`While loop condition must be a boolean, got ${condition.type} ${expr.loc}`)

        if (!condition.value)
            break;

        try {
            value = interpreter.evaluate(expr.body)
        } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
        }
    }

    interpreter.runtime.scopeTree.leaveScope()

    return value
}