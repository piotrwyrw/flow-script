/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {Interpreter} from "../interpreter";
import {AST} from "../../../syntax/ast/ast";
import type {AnyValue, FunctionValue} from "../../values";
import {ReturnSignal} from "../control-flow";
import {runtimeError} from "../../../log/error";
import debugFunctionName = AST.debugFunctionName;

export function evalFunctionDefinition(interpreter: Interpreter, expr: AST.FunctionDefExpr): AnyValue {
    const params: string[] = []

    for (let param of expr.params) {
        if (param.value in params)
            runtimeError(`Duplicate parameter "${param.value}" in function ${debugFunctionName(expr)}`)

        params.push(param.value)
    }

    const fn: FunctionValue = {
        type: "Function",
        block: expr.block,
        params: expr.params.map(id => id.value),
        identifier: debugFunctionName(expr),
        capturedScope: interpreter.runtime.scopeTree.currentScope()
    }

    // Only define the function as a symbol if it's not anon
    if (expr.name) {
        interpreter.runtime.scopeTree.defineSymbol(expr.name, fn)
    }

    return fn
}

export function evalCall(interpreter: Interpreter, expr: AST.CallExpr): AnyValue {
    const callee = interpreter.evaluate(expr.callee)

    if (callee.type !== "Function" && callee.type !== "BuiltinFunction")
        runtimeError(`Expression of type ${callee.type} is not callable ${expr.loc}`)

    const params = (callee.type === "Function") ? callee.params : callee.function.parameters
    const identifier = (callee.type === "Function") ? callee.identifier : callee.function.identifier

    if (expr.args.length !== params.length)
        runtimeError(`Function "${identifier}" expected ${params.length} parameters, but received ${expr.args.length}`)

    const args = new Map<string, AnyValue>()

    for (let i = 0; i < expr.args.length; i++) {
        const callArg = expr.args[i]!
        const fnParam = params[i]!

        const arg = interpreter.evaluate(callArg)

        if (args.has(fnParam))
            runtimeError(`Duplicate parameter "${fnParam}" in function ${identifier}`)

        args.set(fnParam, arg)
    }

    if (callee.type === "BuiltinFunction") {
        return callee.function.callback(...args.values())
    }

    try {
        // Enter the function scope
        interpreter.runtime.scopeTree.enterNewScope(expr, callee.capturedScope)

        // Define parameter variables in the function scope
        args.forEach((expr, name) => {
            interpreter.runtime.scopeTree.defineSymbol(name, expr)
        })

        return interpreter.evaluate(callee.block)
    } catch (e) {
        if (e instanceof ReturnSignal) return e.value;
        throw e
    } finally {
        interpreter.runtime.scopeTree.leaveScope()
    }
}