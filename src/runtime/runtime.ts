/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {AST} from "../syntax/ast/ast";
import {Interpreter} from "./interpreter/interpreter";
import {ScopeTree} from "./scope/scope";
import {BreakSignal, ContinueSignal, ErrorSignal, ReturnSignal} from "./interpreter/control-flow";
import {type BuiltinFunction, DefaultBuiltinFunctions} from "./builtin-function";
import {runtimeError} from "../log/error";

export class Runtime {
    readonly interpreter: Interpreter
    readonly builtinFunctions: BuiltinFunction[]
    scopeTree!: ScopeTree

    constructor(builtinFunctions?: BuiltinFunction[]) {
        this.interpreter = new Interpreter(this)
        this.builtinFunctions = builtinFunctions || DefaultBuiltinFunctions
    }

    private eraseScopes() {
        this.scopeTree = new ScopeTree(this)
    }

    interpret(program: AST.Program) {
        this.eraseScopes()
        program.expressions.forEach(expr => {
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