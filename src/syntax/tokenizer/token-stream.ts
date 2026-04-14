/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {Tokenizer} from "./tokenizer";
import {Token} from "./token";
import {Location} from "./location";
import {
    type AnySourceResolutionStrategy,
    type RedundantSourceResolutionStrategy,
    resolveSource
} from "./source-resolution";
import {retrieveErrorMessage} from "../../utils";

export class TokenStream {
    private tokenizer: Tokenizer

    private tokens: Token[] | undefined = undefined

    private tokenIndex: number = 0

    private currentToken: Token = Token.eof(new Location(-1, -1))
    private nextToken: Token = Token.eof(new Location(-1, -1))

    constructor(tokenizer: Tokenizer) {
        this.tokenizer = tokenizer
    }

    static async fromResolvedSource(strategy: AnySourceResolutionStrategy | RedundantSourceResolutionStrategy, tokenize: boolean = false): Promise<TokenStream | undefined> {
        try {
            const source = await resolveSource(strategy);

            logger.info({
                message: "Source resolution successful.",
                fields: [{name: "strategy", value: strategy.kind}]
            })

            const instance = new this(new Tokenizer(source));
            if (tokenize)
                instance.tokenize()
            return instance
        } catch (e) {
            logger.error({
                message: `Failed to resolve the source with the "${strategy.kind}" strategy.`,
                fields: [{name: "error", value: retrieveErrorMessage(e)}]
            })

            if (!("fallback" in strategy) || !strategy.fallback)
                return undefined

            logger.info({
                message: `Attempting to resolve the source with fallback strategy "${strategy.fallback.kind}"`,
                fields: [
                    {name: "fallbackStrategy", value: strategy.fallback.kind}
                ]
            })

            return this.fromResolvedSource(strategy.fallback)
        }
    }

    tokenize(): this {
        if (this.tokens) {
            logger.warn({message: "The Tokenizer of this TokenStream was already previously invoked.", fields: []})
            return this
        }

        this.tokens = this.tokenizer.tokenize().getTokens()

        this.consume()
        this.consume()

        return this
    }

    isCurrentPresent() {
        return !this.currentToken.isEof()
    }

    consume() {
        if (!this.tokens) {
            const err = "Could not consume token: the input of this TokenStream has not been tokenized yet, or there are no remaining tokens.";
            logger.error({message: err, fields: []})
            throw new Error(err);
        }

        this.currentToken = this.nextToken.clone()

        if (this.tokenIndex < this.tokens.length) {
            this.nextToken = this.tokens[this.tokenIndex++]!
        } else this.nextToken = Token.eof(new Location(
            this.currentToken.location.line,
            this.currentToken.location.column + this.currentToken.value.length
        ))
    }

    getCurrent(): Token {
        return this.currentToken
    }

    getNext(): Token {
        return this.nextToken
    }

}