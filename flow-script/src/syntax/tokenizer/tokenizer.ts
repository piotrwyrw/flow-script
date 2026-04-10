import {Token, TokenMappingStrategies, type TokenMappingStrategy, type TokenType, TokenTypes} from "./token.js";
import {FSError, FSErrorType, tokenizerError} from "../../error/FSError.js";

type PendingToken = {
    type: TokenType
    value: string,
    line: number
    col: number
}

export class Tokenizer {
    private input: string
    private tokens: Token[] = []
    private pending?: PendingToken

    private column: number = 1
    private line: number = 1

    constructor(input: string) {
        this.input = input
    }

    private consume() {
        if (this.input.length === 0)
            tokenizerError("Could not consume: Tokenizer buffer is empty")

        this.column++
        this.input = this.input.substring(1)
    }

    private createTokenFrom(token: PendingToken): Token {
        return new Token(
            token.type,
            token.value,
            token.line,
            token.col
        )
    }

    // Find a token type whose `mapping` directly matches the value
    private directTokenFor(mappingStrategy: TokenMappingStrategy, value: string): TokenType | undefined {
        for (let typeKey in TokenTypes) {
            if (!TokenTypes.hasOwnProperty(typeKey)) {
                continue;
            }

            const tokTypeKey = typeKey as TokenType;
            const type = TokenTypes[tokTypeKey];

            if (type.mappingStrategy !== mappingStrategy)
                continue;

            if (type.mapping === value) {
                return tokTypeKey
            }
        }

        return undefined
    }

    // Find a token type whose `mapping` matches the largest portion of the value
    private matchLongestToken(mappingStrategy: TokenMappingStrategy, value: string): [TokenType, string] | undefined {
        type Match = { value: string, type: TokenType }
        let bestMatch: Match | undefined

        for (let typeKey in TokenTypes) {
            if (!TokenTypes.hasOwnProperty(typeKey)) {
                continue;
            }

            const tokTypeKey = typeKey as TokenType;
            const type = TokenTypes[tokTypeKey];

            if (type.mappingStrategy !== mappingStrategy)
                continue;

            if (type.mapping && value.startsWith(type.mapping)) {
                if (!bestMatch || bestMatch.value.length < value.length) {
                    bestMatch = {
                        value: type.mapping,
                        type: tokTypeKey
                    }
                }

                // We already found the best possible match. No need to continue
                if (bestMatch.value.length === value.length)
                    break;
            }
        }

        if (!bestMatch)
            return undefined

        return [bestMatch.type, bestMatch.value]
    }

    private processGenericSymbolToken(token: PendingToken): PendingToken[] {
        // This should never happen, but let's cover for it anyway
        if (token.type !== 'GenericSymbol')
            return [{...token}]

        // First, check if this token maps directly to an existing token type.
        // This is the optimistic variant.
        const directMappedType = this.directTokenFor('char_seq', token.value)
        if (directMappedType) {
            return [{...token, type: directMappedType}]
        }

        // If no direct mapping is available, try to recursively split the token into more primitive tokens
        const bestMatch = this.matchLongestToken('char_seq', token.value)
        if (!bestMatch)
            tokenizerError(`Could not handle symbol '${token.value}'`)

        return [{
            type: bestMatch[0],
            value: bestMatch[1],
            line: token.line,
            col: token.col
        }, ...this.processGenericSymbolToken({
            ...token,
            value: token.value.substring(bestMatch[1].length),
            col: token.col + bestMatch[1].length
        })]
    }

    private postProcessToken(token: PendingToken): PendingToken[] {
        const results: PendingToken[] = []

        mapping: {
            // Map identifiers to keywords
            if (token.type === 'Identifier') {
                const mappedType = this.directTokenFor(TokenMappingStrategies.Identifier, token.value)
                if (!mappedType)
                    results.push({...token})
                else
                    results.push({...token, type: mappedType})
                break mapping;
            }

            // Map generic symbols to the proper types
            if (token.type === 'GenericSymbol') {
                results.push(...this.processGenericSymbolToken(token))
                break mapping;
            }

            // No mapping is required or possible in case of any other type
            results.push({...token})
        }

        return results
    }

    // If present, commit the pending token to the token array and reset the pending token object
    private flush(): boolean {
        // No pending token, so nothing to do
        if (!this.pending)
            return false;

        const tokens = this.postProcessToken(this.pending).map(tok => this.createTokenFrom(tok))
        this.tokens.push(...tokens)
        this.pending = undefined
        return true;
    }

    private isDigit(char: string): boolean {
        return /[0-9]/.test(char)
    }

    private isIdentifierCharacter(char: string): boolean {
        return /[a-zA-Z_]/.test(char)
    }

    private isSpace(char: string): boolean {
        return char === " " || char === "\t"
    }

    private isNewline(char: string): boolean {
        return char === "\n"
    }

    tokenize(): this {
        let isEscapeActive: boolean = false
        let current: string | undefined = undefined

        const acquireChar = () => {
            current = this.input[0]
            if (!current) tokenizerError(`Tokenizer encountered undefined character at ${this.line}:${this.column}`)
        }

        while (this.input.length !== 0) {
            const line = this.line
            const col = this.column

            acquireChar()
            if (!current) tokenizerError("Tokenizer encountered unexpected undefined character. This should not happen.")

            // Escape characters in string literals
            if (current === "\\") {
                if (this.pending?.type !== 'StringLiteral')
                    tokenizerError("Character escapes are only valid inside of string literals.")

                isEscapeActive = true
                this.consume()

                acquireChar()
                if (!current)
                    tokenizerError("Expected character to escape after '\\'.")

            } else {
                isEscapeActive = false;
            }

            // String literals
            if (current === '"') {
                if (this.pending?.type === 'StringLiteral') {
                    if (isEscapeActive) {
                        this.pending.value += '"'
                        this.consume()
                        continue;
                    }

                    this.flush()
                    this.consume()
                    continue;
                } else {
                    // End the previous token before starting a string literal
                    this.flush()
                    this.consume()

                    this.pending = {
                        type: 'StringLiteral',
                        value: '',
                        line: line,
                        col: col,
                    }
                    continue;
                }
            }

            if (this.pending?.type === 'StringLiteral') {
                if (this.isNewline(current))
                    tokenizerError(`Line ended before string literal was terminated at ${this.line}:${this.column}`)

                this.pending.value += current
                this.consume()
                continue;
            }

            // Skip spaces and newlines, but use them for flushing pending tokens
            if (this.isSpace(current)) {
                this.flush()
                this.consume()
                continue;
            }

            if (this.isNewline(current)) {
                this.flush()
                this.consume()
                this.line++
                this.column = 1
                continue;
            }

            if (this.isDigit(current)) {
                if (this.pending?.type === 'NumberLiteral') {
                    this.pending.value += current
                    this.consume()
                } else {
                    this.flush()
                    this.consume()
                    this.pending = {
                        type: 'NumberLiteral',
                        value: current,
                        line: line,
                        col: col
                    }
                }
                continue;
            }

            if (this.isIdentifierCharacter(current)) {
                if (this.pending?.type === 'Identifier') {
                    this.pending.value += current
                    this.consume()
                } else {
                    this.flush()
                    this.consume()
                    this.pending = {
                        type: 'Identifier',
                        value: current,
                        line: line,
                        col: col
                    }
                }
                continue;
            }

            // At this point, the token is assumed to be a symbol
            if (this.pending?.type !== 'GenericSymbol') {
                this.flush()
                this.consume()
                this.pending = {
                    type: 'GenericSymbol',
                    value: current,
                    line: line,
                    col: col
                }
                continue
            }

            // Symbols that are next to each other with no spaces are assumed to be compound symbols for now.
            // They are split later in the post-processing stage if necessary
            this.pending.value += current
            this.consume()
        }

        // Flush anything that's still pending
        this.flush()

        return this
    }

    getTokens(): Token[] {
        return this.tokens
    }
}