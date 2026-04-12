import type {TokenStream} from "../tokenizer/token-stream.js";
import {AST} from "../ast/ast.js";
import {type TokenType, TokenTypes} from "../tokenizer/token-type.js";
import {syntaxError} from "../../error/FSError.js";
import assert from "node:assert/strict";
import {type IdentifierToken, Token} from "../tokenizer/token.js";
import {RegisterParser, findFactorParser, type ParserFunction} from "./parser-registry.js";
import {type BinaryOperatorDescriptor, BinaryOperatorDescriptors, BinaryOperatorGroups} from "./operators.js";

export class Parser {
    private readonly exprFacParsers = new Map<TokenType, ParserFunction>()

    private stream: TokenStream

    private current: Token
    private next: Token

    constructor(stream: TokenStream) {
        this.stream = stream
        this.stream.tokenize()
        this.current = this.stream.getCurrent()
        this.next = this.stream.getNext()
    }

    private consume() {
        this.stream.consume()
        this.current = this.stream.getCurrent()
        this.next = this.stream.getNext()
    }

    parse(): AST.Program {
        const expressions: AST.Expr[] = []
        while (this.stream.isCurrentPresent()) {
            const expr = this.parseExpression()

            this.expect("Semicolon")
            this.consume()

            expressions.push(expr)
        }
        return {expressions} as AST.Program
    }

    private expect(...types: TokenType[]): void | never {
        if (types.length === 0)
            throw new Error("Invalid call to Parser#expect(...): Expected one or more expected token types")

        let isExpected = false
        types.forEach(type => {
            if (this.current.is(type))
                isExpected = true
        })

        // Everything"s fine
        if (isExpected)
            return

        const actual = this.current.is("EOF")
            ? "but reached end of file" :
            this.current.is("Identifier")
                ? `got identifier "${this.current.value}"`
                : `got ${this.current.type} "${this.current.value}"`

        const expected = types.map(type => {
            const mapping = TokenTypes[type].mapping
            if (mapping)
                return `"${mapping}"`
            else
                return type
        }).join(" or ")

        syntaxError(`Expected ${expected}, ${actual} on ${this.current.location}`)
    }

    private parseCommaSeparated<T extends AST.Expr>(initialToken: TokenType, terminatingToken: TokenType, parseFn: () => T): T[] {
        const fn = parseFn.bind(this)

        this.expect(initialToken)
        this.consume() // Skip start delimiter

        const entries: T[] = []

        while (this.stream.isCurrentPresent() && this.current.isNot(terminatingToken)) {
            const entry = fn()
            entries.push(entry)

            this.expect("Comma", terminatingToken)
            if (this.current.is("Comma")) {
                this.consume() // Skip ","
            }
        }

        this.expect(terminatingToken)
        this.consume() // Consume terminating token

        return entries
    }

    private parseExpression(): AST.Expr {
        const loc = this.current.location
        const expr = this.parseBinaryExpression()
        if (this.current.is("LeftParen")) {
            const args: AST.Expr[] = this.parseCommaSeparated("LeftParen", "RightParen", this.parseExpression)
            return {kind: "CallExpr", loc, callee: expr, args}
        }
        return expr
    }

    private parseBinaryExpression(minPrecedence: number = 0): AST.Expr {
        let left = this.parseFactor()

        let lastDescriptor: BinaryOperatorDescriptor | undefined = undefined

        while (true) {
            const op = AST.BinaryOp.binaryOperatorFrom(this.current)
            if (!op)
                break

            const descriptor = BinaryOperatorDescriptors[op]
            const precedence = descriptor.precedence

            if (precedence < minPrecedence) break;

            if (lastDescriptor && lastDescriptor.group === descriptor.group && !BinaryOperatorGroups[lastDescriptor.group].allowChaining) {
                syntaxError(`Chaining ${descriptor.group.toLowerCase()} operators in an expression is not allowed. Failed on ${this.current.location}`)
            }

            lastDescriptor = descriptor

            this.consume()

            const right = this.parseBinaryExpression(precedence + 1)

            left = {kind: "BinaryExpr", loc: left.loc, operator: op, left, right}
        }

        return left
    }

    private parseBlock(): AST.BlockExpr {
        const loc = this.current.location

        this.expect("LeftCurly")
        this.consume() // Skip '{'

        const body: AST.Expr[] = []

        while (this.stream.isCurrentPresent() && this.current.isNot("RightCurly")) {
            const expr = this.parseExpression()

            body.push(expr)

            this.expect("Semicolon")
            this.consume()
        }

        this.expect("RightCurly")
        this.consume()

        return {kind: "BlockExpr", loc, body}
    }

    private parseIfBranch(): AST.IfBranch {
        this.expect("IfKeyword")
        this.consume() // Skip 'if

        const condition = this.parseExpression()

        const block = this.parseBlock()

        return {block, condition}
    }

    private parseFactor(): AST.Expr {
        if (this.current.type === "EOF")
            syntaxError(`Reached end of file while parsing expression on ${this.current.location}`)

        const fn = findFactorParser(this.current.type)
        if (fn) {
            return (fn.bind(this))()
        }

        syntaxError(`Unknown expression starting with ${this.current}`)
    }

    @RegisterParser("NumberLiteral")
    private parseNumberLiteral(): AST.NumberLiteral {
        const loc = this.current.location

        const value = Number.parseFloat(this.current.value)

        if (Number.isNaN(value))
            syntaxError(
                "Could not parse number literal because the value of the number literal token is " +
                "not a valid number. This should not happen."
            )

        const node = {kind: "NumberLiteral", loc, value: value} as AST.NumberLiteral
        this.consume()

        return node;
    }

    @RegisterParser("StringLiteral")
    private parseStringLiteral(): AST.StringLiteral {
        const loc = this.current.location

        const node = {kind: "StringLiteral", loc, value: this.current.value} as AST.StringLiteral
        this.consume()

        return node;
    }

    @RegisterParser("Identifier")
    private parseSymbol(): AST.Symbol {
        const loc = this.current.location

        const name = this.current
        assert(name.isIdentifier())

        this.consume() // Skip identifier

        return {kind: "Symbol", loc, name}
    }

    @RegisterParser("LeftParen")
    private parseSubExpression(): AST.Expr {
        const loc = this.current.location

        this.consume()

        const expr = this.parseExpression()

        if (this.current.isEof())
            syntaxError(`Reached end of file while parsing sub-expression starting on ${loc}`)

        this.expect("RightParen")

        this.consume() // Skip ')'

        return expr
    }

    @RegisterParser("VectorStart")
    private parseVector(): AST.VectorLiteral {
        // Should not happen
        this.expect("VectorStart")

        const loc = this.current.location

        this.consume()

        // === X Component ===
        const xExpr = this.parseExpression()
        if (this.current.isEof())
            syntaxError(`Reached end of file while parsing vector expression starting on ${loc}`)
        this.expect("Comma")
        this.consume() // Skip ','

        // === Y Component ===
        const yExpr = this.parseExpression()
        if (this.current.isEof())
            syntaxError(`Reached end of file while parsing vector expression starting on ${loc}`)
        this.expect("Comma")
        this.consume() // Skip ','

        // === Z Component ===
        const zExpr = this.parseExpression()
        if (this.current.isEof())
            syntaxError(`Reached end of file while parsing vector expression starting on ${loc}`)
        this.expect("VectorEnd")
        this.consume() // Skip '>'

        return {kind: "VectorLiteral", loc: loc, x: xExpr, y: yExpr, z: zExpr}
    }

    @RegisterParser("LetKeyword")
    private parseVariableDeclaration(): AST.VariableDeclaration {
        const loc = this.current.location

        this.expect("LetKeyword")
        this.consume() // Skip 'let'

        this.expect("Identifier")

        const name = this.current
        assert(name.isIdentifier())

        this.consume() // Skip name

        let value: AST.Expr | undefined

        if (this.current.is("Equals")) {
            this.consume() // Skip '='
            value = this.parseExpression()
        }

        return {kind: "VariableDeclaration", loc, name, value}
    }

    @RegisterParser("FnKeyword")
    private parseFunctionDefinition(): AST.FunctionDefExpr {
        const loc = this.current.location

        let name: IdentifierToken | undefined
        const params: IdentifierToken[] = []

        this.expect("FnKeyword")
        this.consume() // Skip 'fn'

        this.expect("LeftParen", "Identifier")

        if (this.current.isIdentifier()) {
            name = this.current
            this.consume()
        }

        this.expect("LeftParen")

        this.consume() // Skip '('

        while (this.stream.isCurrentPresent() && this.current.isNot("RightParen")) {
            this.expect("Identifier")

            const param = this.current
            assert(param.isIdentifier())

            params.push(param)

            this.consume() // Skip param name

            this.expect("Comma", "RightParen")
            if (this.current.is("Comma"))
                this.consume()
        }

        this.expect("RightParen")
        this.consume()

        const block = this.parseBlock()

        return {kind: "FunctionDefExpr", loc, name, params, block}
    }

    @RegisterParser("ReturnKeyword")
    private parseReturn(): AST.ReturnExpr {
        const loc = this.current.location

        this.expect("ReturnKeyword")
        this.consume() // Skip 'return'

        let value: AST.Expr | undefined = undefined

        if (this.current.isNot("Semicolon"))
            value = this.parseExpression()

        return {kind: "ReturnExpr", loc, expr: value}
    }

    @RegisterParser("IfKeyword")
    private parseIf(): AST.IfExpr {
        const loc = this.current.location

        this.expect("IfKeyword")

        let elseBranch: AST.BlockExpr | undefined = undefined

        const branches: AST.IfBranch[] = [this.parseIfBranch()]

        while (this.current.is("ElseKeyword")) {
            this.consume() // Skip 'else'

            if (this.current.is("IfKeyword")) {
                branches.push(this.parseIfBranch())
                continue;
            }

            elseBranch = this.parseBlock()
            break
        }

        return {kind: "IfExpr", loc, elseBranch, branches}
    }

    @RegisterParser("WhileKeyword")
    private parseWhile(): AST.WhileExpr {
        const loc = this.current.location

        this.expect("WhileKeyword")
        this.consume() // Skip 'while'

        const condition = this.parseExpression()
        const body = this.parseBlock()

        return {kind: "While", loc, body, condition}
    }

    @RegisterParser("TrueKeyword")
    private parseTrue(): AST.TrueExpr {
        const loc = this.current.location

        this.expect("TrueKeyword")
        this.consume()

        return {kind: "True", loc}
    }

    @RegisterParser("FalseKeyword")
    private parseFalse(): AST.FalseExpr {
        const loc = this.current.location

        this.expect("FalseKeyword")
        this.consume()

        return {kind: "False", loc}
    }

    @RegisterParser("UnitKeyword")
    private parseUnit(): AST.UnitExpr {
        const loc = this.current.location

        this.expect("UnitKeyword")
        this.consume()

        return {kind: "Unit", loc}
    }
}