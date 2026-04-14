/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {AST} from "../syntax/ast/ast.js";
import {Interpreter} from "./interpreter/interpreter.js";
import {ScopeTree} from "./scope/scope.js";
import {BreakSignal, ContinueSignal, ErrorSignal, ReturnSignal} from "./interpreter/control-flow.js";
import {type BuiltinFunction, DefaultBuiltinFunctions} from "./builtin-function.js";
import {runtimeError} from "../log/error.js";

export class Runtime {
    private readonly program: AST.Program
    readonly interpreter: Interpreter
    readonly builtinFunctions: BuiltinFunction[]
    scopeTree!: ScopeTree

    constructor(program: AST.Program, builtinFunctions?: BuiltinFunction[]) {
        this.program = program
        this.interpreter = new Interpreter(this)
        this.builtinFunctions = builtinFunctions || DefaultBuiltinFunctions
    }

    eraseScopes() {
        this.scopeTree = new ScopeTree(this)
    }

    interpret() {
        this.eraseScopes()
        this.program.expressions.forEach(expr => {
            try {
                const result = this.interpreter.evaluate(expr)
                console.log(JSON.stringify(result))
            } catch (e) {
                if (e instanceof ErrorSignal) console.log(`Error: ${e.message}`)
                if (e instanceof ReturnSignal) runtimeError("Unexpected 'return' encountered in the global scope.")
                if (e instanceof ContinueSignal) runtimeError("Unexpected 'continue' encountered in the global scope.")
                if (e instanceof BreakSignal) runtimeError("Unexpected 'break' encountered in the global scope.")
                throw e;
            }
        })
    }

}