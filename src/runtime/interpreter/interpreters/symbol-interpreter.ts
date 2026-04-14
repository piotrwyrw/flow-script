/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {AST} from "../../../syntax/ast/ast";
import type {AnyValue} from "../../values";
import type {Interpreter} from "../interpreter";

export function evalAssignment(interpreter: Interpreter, expr: AST.Assignment): AnyValue {
    let newValue = interpreter.evaluate(expr.value)
    interpreter.runtime.scopeTree.assignSymbol(expr.target, newValue)
    return newValue
}

export function evalVariableDeclaration(interpreter: Interpreter, expr: AST.VariableDeclaration): AnyValue {
    let variableValue: AnyValue = {type: "Unit"}
    if (expr.value)
        variableValue = interpreter.evaluate(expr.value)

    interpreter.runtime.scopeTree.defineSymbol(expr.name, variableValue)

    return variableValue
}

export function evalSymbolRef(interpreter: Interpreter, expr: AST.Symbol): AnyValue {
    return interpreter.runtime.scopeTree.findSymbol(expr.name).value
}