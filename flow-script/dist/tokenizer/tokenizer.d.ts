import { Token, type TokenType } from "./token";
type PendingToken = {
    type: TokenType;
    value: string;
    line: number;
    col: number;
};
export declare class Tokenizer {
    input: string;
    column: number;
    line: number;
    tokens: Token[];
    pending?: PendingToken;
    constructor(input: string);
    private consume;
    private createTokenFrom;
    private findFirstDirectMappingTokenType;
    private findBestMatchTokenType;
    private processGenericSymbolToken;
    private postProcessToken;
    private flush;
    private isDigit;
    private isIdentifierCharacter;
    private isSpace;
    private isNewline;
    tokenize(): void;
}
export {};
//# sourceMappingURL=tokenizer.d.ts.map