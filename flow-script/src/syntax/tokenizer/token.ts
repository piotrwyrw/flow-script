/**
 * Defines how the `mapping` field influences the deduction of token types in the lexical analysis.
 * @prop Identifier Specifies that the token type represents an identifier, such as Keywords
 * @prop CharSequence Specifies that the token type represents a sequence of adjacent characters,
 *                          such as single or multi-character operators
 * @prop None Specifies that the `mapping` field should not be considered when deducing the token type
 */
export const TokenMappingStrategies = {
    Identifier: "identifier",
    CharSequence: "char_seq",
    None: "none"
} as const

export type TokenMappingStrategy = typeof TokenMappingStrategies[keyof typeof TokenMappingStrategies]

function IdentifierMappedToken(identifier: string) {
    return {
        display: identifier,
        mapping: identifier,
        mappingStrategy: TokenMappingStrategies.Identifier
    } as const
}

function CharSeqMappedToken(sequence: string) {
    return {
        display: sequence,
        mapping: sequence,
        mappingStrategy: TokenMappingStrategies.CharSequence
    } as const
}

function UnmappedToken(display: string) {
    return {
        display: display,
        mapping: undefined,
        mappingStrategy: TokenMappingStrategies.None
    } as const
}

export const TokenTypes = {
    // Used by the TokenStream to signal the end of the token stream
    EOF: UnmappedToken("EOF"),

    Identifier: UnmappedToken("identifier"),

    // Keywords
    LetKeyword: IdentifierMappedToken("let"),
    FnKeyword: IdentifierMappedToken("fn"),
    IfKeyword: IdentifierMappedToken("if"),
    ElseKeyword: IdentifierMappedToken("else"),

    // Literals
    StringLiteral: UnmappedToken("string literal"),
    NumberLiteral: UnmappedToken("number literal"),

    // This type should never make it to the final token stream.
    // It is used as a placeholder to parse symbols and especially compound symbols
    GenericSymbol: UnmappedToken("generic symbol"),

    // Compound Symbols
    DoubleEquals: CharSeqMappedToken("=="),
    NotEquals: CharSeqMappedToken("!="),
    GreaterEquals: CharSeqMappedToken(">="),
    LessEquals: CharSeqMappedToken("<="),

    // Symbols
    Equals: CharSeqMappedToken("="),
    Greater: CharSeqMappedToken(">"),
    Less: CharSeqMappedToken("<"),
    Not: CharSeqMappedToken("!"),
    LeftParen: CharSeqMappedToken("("),
    RightParen: CharSeqMappedToken(")"),
    LeftBracket: CharSeqMappedToken("["),
    RightBracket: CharSeqMappedToken("]"),
    LeftCurly: CharSeqMappedToken("{"),
    RightCurly: CharSeqMappedToken("}"),
    At: CharSeqMappedToken("@"),
    Semicolon: CharSeqMappedToken(";")
} as const;

export type TokenType = keyof typeof TokenTypes;

export type IdentifierToken = Token & { type: 'Identifier' }

export type Location = { line: number, column: number }

/**
 * Represents a single lexical token
 */
export class Token {
    readonly type: TokenType
    readonly value: string
    readonly location: Location

    constructor(type: TokenType, value: string, lineNumber: number, columnNumber: number);
    constructor(type: TokenType, value: string, location: Location);

    constructor(type: TokenType, value: string, arg3: number | Location, arg4?: number) {
        this.type = type
        this.value = value

        if (typeof arg3 === "number") {
            this.location = { line: arg3, column: arg4! }
        } else {
            this.location = arg3
        }
    }

    static eof(): Token {
        return new Token('EOF', "", -1, -1)
    }

    isEof(): boolean {
        return this.type === 'EOF'
    }

    clone(): Token {
        return new Token(this.type, this.value, this.location)
    }

    isIdentifier(): this is IdentifierToken {
        return this.type === 'Identifier'
    }
}