import {Tokenizer} from "./tokenizer.js";
import {Location, Token} from "./token.js";
import {tokenizerError} from "../../error/FSError.js";

export class TokenStream {

    private readonly input: string
    private tokenizer: Tokenizer

    private tokens: Token[] | undefined = undefined

    private tokenIndex: number = 0

    private currentToken: Token = Token.eof(new Location(-1, -1))
    private nextToken: Token = Token.eof(new Location(-1, -1))

    constructor(input: string) {
        this.input = input
        this.tokenizer = new Tokenizer(this.input)
    }

    tokenize() {
        if (this.tokens)
            tokenizerError("The Tokenizer of this TokenStream was already previously invoked.")

        this.tokens = this.tokenizer.tokenize().getTokens()

        this.consume()
        this.consume()
    }

    isCurrentPresent() {
        return !this.currentToken.isEof()
    }

    consume() {
        if (!this.tokens)
            tokenizerError("Could not consume token: the input of this TokenStream has not been tokenized yet.")

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