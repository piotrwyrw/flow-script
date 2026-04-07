export const TokenTypes = {
    Identifier: { display: "Identifier" },
    // Keywords
    LetKeyword: { display: "let", mapping: "let" },
    FnKeyword: { display: "fn", mapping: "fn" },
    IfKeyword: { display: "if", mapping: "if" },
    ElseKeyword: { display: "else", mapping: "else" },
    // Literals
    StringLiteral: { display: "String" },
    NumberLiteral: { display: "Number" },
    // Compound Symbols
    DoubleEquals: { display: "==", mapping: "==" },
    NotEquals: { display: "!=", mapping: "!=" },
    GreaterEquals: { display: ">=", mapping: ">=" },
    LessEquals: { display: "<=", mapping: "<=" },
    // Symbols
    Equals: { display: "=", mapping: "=" },
    Greater: { display: ">", mapping: ">" },
    Less: { display: "<", mapping: "<" },
    Not: { display: "!", mapping: "!" },
    LeftParen: { display: "(", mapping: "(" },
    RightParen: { display: ")", mapping: ")" },
    LeftBracket: { display: "[", mapping: "[" },
    RightBracket: { display: "]", mapping: "]" },
    LeftCurly: { display: "{", mapping: "{" },
    RightCurly: { display: "}", mapping: "}" },
    At: { display: "@", mapping: "@" }
};
export class Token {
    constructor(type, value, lineNumber) {
        this.type = type;
        this.value = value;
        this.lineNumber = lineNumber;
    }
}
//# sourceMappingURL=token.js.map