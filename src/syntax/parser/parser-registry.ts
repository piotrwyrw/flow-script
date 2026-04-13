/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {AST} from "../ast/ast.js";
import type {TokenType} from "../tokenizer/token-type.js";

export type ParserFunction = () => AST.Expr

const ParserFunctionRegistry = {
    exprFacParsers: new Map<TokenType, ParserFunction>()
}

export function RegisterParser(detectionToken: TokenType) {
    return (value: ParserFunction, context: ClassMethodDecoratorContext) => {
        if (ParserFunctionRegistry.exprFacParsers.has(detectionToken)) {
            throw new Error(`A factor parser for an expression starting with "${detectionToken}" was already registered.`)
        }

        ParserFunctionRegistry.exprFacParsers.set(detectionToken, value)
    }
}

export function findFactorParser(current: TokenType): ParserFunction | undefined {
    for (const [tok, fn] of ParserFunctionRegistry.exprFacParsers) {
        if (tok !== current)
            continue;

        return fn
    }
    return undefined
}