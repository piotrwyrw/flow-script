/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {AST} from "../../syntax/ast/ast.js";
import type {IdentifierToken} from "../../syntax/tokenizer/token.js";
import type {RuntimeSymbol} from "../symbol/runtime-symbol.js";
import {runtimeError} from "../../error/FSError.js";
import type {AnyValue} from "../values.js";
import type {Runtime} from "../runtime.js";

export type Scope = {
    holder?: AST.Expr,
    parent?: Scope,
    symbols: Map<string, RuntimeSymbol>
}

export class ScopeTree {
    private scopes: Scope[] = []

    readonly runtime: Runtime

    constructor(runtime: Runtime) {
        this.runtime = runtime

        // Enter the global scope
        this.enter()
    }

    private enter(holder?: AST.Expr, parent?: Scope) {
        this.scopes.push({holder, parent, symbols: new Map<string, RuntimeSymbol>()})
    }

    enterNewScope(holder: AST.Expr) {
        this.enter(holder, this.currentScope())
    }

    currentScope(): Scope {
        const scope = this.scopes[this.scopes.length - 1]
        if (!scope)
            runtimeError("Not currently in a scope. This should not happen.")

        return scope
    }

    leaveScope() {
        if (this.scopes.length === 0)
            runtimeError("No scope to leave. This should not happen.")

        this.scopes.pop()
    }

    // Recursively find a symbol in the current scope tree
    findSymbol(identifier: IdentifierToken | string, scope?: Scope): RuntimeSymbol {
        const id = (typeof identifier === "string") ? identifier : identifier.value;
        const currentScope = scope || this.currentScope()

        if (currentScope.symbols.has(id))
            return currentScope.symbols.get(id)!

        if (!currentScope.parent) {
            const builtinFunction = this.runtime.builtinFunctions.find(fn => fn.identifier === id)
            if (!builtinFunction)
                runtimeError(`Could not find symbol "${id}"`)
            return {value: {type: "BuiltinFunction", function: builtinFunction}}
        }

        return this.findSymbol(identifier, currentScope.parent)
    }

    defineSymbol(identifier: IdentifierToken | string, value: AnyValue): AnyValue {
        const id = (typeof identifier === "string") ? identifier : identifier.value;
        const scope = this.currentScope()

        if (scope.symbols.has(id))
            runtimeError(`Duplicate definition of symbol "${id}"`)

        scope.symbols.set(id, {value})

        return value
    }

    assignSymbol(identifier: string | IdentifierToken, value: AnyValue, initialScope?: Scope): AnyValue {
        const id = (typeof identifier === "string") ? identifier : identifier.value
        const scope = initialScope || this.currentScope()

        if (!scope.symbols.has(id)) {
            if (!scope.parent)
                runtimeError(`Could not assign undefined symbol "${id}"`)

            return this.assignSymbol(identifier, value, scope.parent)
        }

        scope.symbols.set(id, {
            ...scope.symbols.get(id)!,
            value
        })

        return value
    }

}