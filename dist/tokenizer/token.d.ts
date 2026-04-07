export declare const TokenTypes: {
    readonly Identifier: {
        readonly display: "Identifier";
    };
    readonly LetKeyword: {
        readonly display: "let";
        readonly mapping: "let";
    };
    readonly FnKeyword: {
        readonly display: "fn";
        readonly mapping: "fn";
    };
    readonly IfKeyword: {
        readonly display: "if";
        readonly mapping: "if";
    };
    readonly ElseKeyword: {
        readonly display: "else";
        readonly mapping: "else";
    };
    readonly StringLiteral: {
        readonly display: "String";
    };
    readonly NumberLiteral: {
        readonly display: "Number";
    };
    readonly DoubleEquals: {
        readonly display: "==";
        readonly mapping: "==";
    };
    readonly NotEquals: {
        readonly display: "!=";
        readonly mapping: "!=";
    };
    readonly GreaterEquals: {
        readonly display: ">=";
        readonly mapping: ">=";
    };
    readonly LessEquals: {
        readonly display: "<=";
        readonly mapping: "<=";
    };
    readonly Equals: {
        readonly display: "=";
        readonly mapping: "=";
    };
    readonly Greater: {
        readonly display: ">";
        readonly mapping: ">";
    };
    readonly Less: {
        readonly display: "<";
        readonly mapping: "<";
    };
    readonly Not: {
        readonly display: "!";
        readonly mapping: "!";
    };
    readonly LeftParen: {
        readonly display: "(";
        readonly mapping: "(";
    };
    readonly RightParen: {
        readonly display: ")";
        readonly mapping: ")";
    };
    readonly LeftBracket: {
        readonly display: "[";
        readonly mapping: "[";
    };
    readonly RightBracket: {
        readonly display: "]";
        readonly mapping: "]";
    };
    readonly LeftCurly: {
        readonly display: "{";
        readonly mapping: "{";
    };
    readonly RightCurly: {
        readonly display: "}";
        readonly mapping: "}";
    };
    readonly At: {
        readonly display: "@";
        readonly mapping: "@";
    };
};
export type TokenType = keyof typeof TokenTypes;
export type TokenValue<T extends string | number> = T;
export declare class Token {
    type: TokenType;
    value: string;
    lineNumber: number;
    constructor(type: TokenType, value: string, lineNumber: number);
}
//# sourceMappingURL=token.d.ts.map