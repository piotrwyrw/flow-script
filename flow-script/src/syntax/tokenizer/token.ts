import {type TokenType, TokenTypes} from "./token-type.js";
import {Location} from "./location.js";

export type IdentifierToken = Token & { type: 'Identifier' }

export class Token {
    readonly type: TokenType
    readonly value: string
    readonly location: Location

    constructor(type: TokenType, value: string, loc: Location) {
        this.type = type
        this.value = value
        this.location = loc
    }

    static create(type: TokenType, value: string, line: number, col: number): Token {
        return new Token(type, value, new Location(line, col));
    }

    static eof(loc: Location): Token {
        return new Token('EOF', "", loc)
    }

    isEof(): boolean {
        return this.type === 'EOF'
    }

    is(type: TokenType): boolean {
        return this.type === type
    }

    isNot(type: TokenType): boolean {
        return !this.is(type)
    }

    isIdentifier(): this is IdentifierToken {
        return this.type === 'Identifier'
    }

    clone(): Token {
        return new Token(this.type, this.value, this.location)
    }

    toString() {
        if (this.type === 'EOF')
            return "EOF";

        if (TokenTypes[this.type].mappingStrategy !== 'none') {
            return `"${this.value}" at ${this.location}`
        }

        let str = ""
        if (this.value.length === 0)
            str = "Empty "
        str += this.type

        if (this.value.length > 0)
            str += ` "${this.value}"`

        str += ` at ${this.location}`

        return str
    }
}