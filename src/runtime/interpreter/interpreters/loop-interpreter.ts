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

    let value: AnyValue = {type: "Unit"}

    for (let i = 0; i < iterable.value.length; i++) {
        try {
            // Enter new scope for the iteration
            interpreter.runtime.scopeTree.enterNewScope(expr)

            const element = iterable.value[i]

            // This should not happen, but whatever
            if (!element) continue;

            // Define the loop variable
            interpreter.runtime.scopeTree.defineSymbol(expr.variable, element)

            value = interpreter.evaluate(expr.block)
        } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
        } finally {
            interpreter.runtime.scopeTree.leaveScope();
        }
    }

    return value;
}

export function evalWhile(interpreter: Interpreter, expr: AST.WhileExpr): AnyValue {
    let value: AnyValue = {type: "Unit"}

    while (true) {
        try {
            // New scope per iteration
            interpreter.runtime.scopeTree.enterNewScope(expr)

            const condition = interpreter.evaluate(expr.condition)

            if (condition.type !== "Boolean")
                runtimeError(`While loop condition must be a boolean, got ${condition.type} ${expr.loc}`)

            if (!condition.value)
                break;

            value = interpreter.evaluate(expr.body)
        } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
        } finally {
            interpreter.runtime.scopeTree.leaveScope()
        }
    }

    return value
}