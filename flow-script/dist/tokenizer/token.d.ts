/**
 * Defines how the `mapping` field influences the deduction of token types in the lexical analysis.
 * @prop Identifier Specifies that the token type represents an identifier, such as Keywords
 * @prop CharSequence Specifies that the token type represents a sequence of adjacent characters,
 *                          such as single or multi-character operators
 * @prop None Specifies that the `mapping` field should not be considered when deducing the token type
 */
export declare const TokenMappingStrategies: {
    readonly Identifier: "identifier";
    readonly CharSequence: "char_seq";
    readonly None: "none";
};
export type TokenMappingStrategy = typeof TokenMappingStrategies[keyof typeof TokenMappingStrategies];
export declare const TokenTypes: {
    readonly Identifier: {
        readonly display: string;
        readonly mapping: undefined;
        readonly mappingStrategy: "none";
    };
    readonly LetKeyword: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "identifier";
    };
    readonly FnKeyword: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "identifier";
    };
    readonly IfKeyword: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "identifier";
    };
    readonly ElseKeyword: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "identifier";
    };
    readonly StringLiteral: {
        readonly display: string;
        readonly mapping: undefined;
        readonly mappingStrategy: "none";
    };
    readonly NumberLiteral: {
        readonly display: string;
        readonly mapping: undefined;
        readonly mappingStrategy: "none";
    };
    readonly GenericSymbol: {
        readonly display: string;
        readonly mapping: undefined;
        readonly mappingStrategy: "none";
    };
    readonly DoubleEquals: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
    readonly NotEquals: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
    readonly GreaterEquals: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
    readonly LessEquals: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
    readonly Equals: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
    readonly Greater: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
    readonly Less: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
    readonly Not: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
    readonly LeftParen: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
    readonly RightParen: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
    readonly LeftBracket: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
    readonly RightBracket: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
    readonly LeftCurly: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
    readonly RightCurly: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
    readonly At: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
    readonly Semicolon: {
        readonly display: string;
        readonly mapping: string;
        readonly mappingStrategy: "char_seq";
    };
};
export type TokenType = keyof typeof TokenTypes;
/**
 * Represents a single lexical token
 */
export declare class Token {
    type: TokenType;
    value: string;
    lineNumber: number;
    columnNumber: number;
    constructor(type: TokenType, value: string, lineNumber: number, columnNumber: number);
    /**
     * Check if the token is of a specified type by the token type key
     * @param other The token type key to check against
     */
    isOfType(other: TokenType): boolean;
}
//# sourceMappingURL=token.d.ts.map