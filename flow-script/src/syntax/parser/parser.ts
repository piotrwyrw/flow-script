/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {TokenStream} from "../tokenizer/token-stream.js";
import {AST} from "../ast/ast.js";
import {type TokenType, TokenTypes} from "../tokenizer/token-type.js";
import assert from "node:assert/strict";
import {type IdentifierToken, Token} from "../tokenizer/token.js";
import {findFactorParser, type ParserFunction, RegisterParser} from "./parser-registry.js";
import {type BinaryOperatorDescriptor, BinaryOperatorDescriptors, BinaryOperatorGroups} from "./operators.js";
import {type Log, type LogField, LogLevel} from "../../log/logger.js";

class SyntaxError {
    log: Log

    constructor(message: string, fields?: LogField[]) {
        this.log = {level: LogLevel.ERROR, message, fields: [...fields || []]}
    }
}

export class Parser {
    private readonly exprFacParsers = new Map<TokenType, ParserFunction>()

    private failed: boolean = false

    private stream: TokenStream

    private current: Token
    private next: Token

    constructor(stream: TokenStream) {
        this.stream = stream
        this.current = this.stream.getCurrent()
        this.next = this.stream.getNext()
    }

    ok(): boolean {
        return !this.failed;
    }

    private consume() {
        this.stream.consume()
        this.current = this.stream.getCurrent()
        this.next = this.stream.getNext()
    }

    // Recover to after the next semicolon and continue parsing there
    private recover() {
        while (this.stream.isCurrentPresent() && this.current.isNot("Semicolon"))
            this.consume()

        if (this.current.is("Semicolon"))
            this.consume() // Skip ';'
    }

    private error(msg: string, fields?: LogField[]): never {
        this.failed = true
        throw new SyntaxError(msg, [...fields || [],
            {name: "Line", value: this.current.location.line.toString()},
            {name: "Col", value: this.current.location.column.toString()},
            {name: "Token", value: this.current.toString()}
        ])
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

        this.error(`Expected ${expected}, ${actual} on ${this.current.location}`)
    }


    parse(): AST.Program {
        const expressions: AST.Expr[] = []
        while (this.stream.isCurrentPresent()) {
            try {
                const expr = this.parseExpression()

                this.expect("Semicolon")
                this.consume()

                expressions.push(expr)
            } catch (e) {
                if (e instanceof SyntaxError) {
                    logger.log(e.log)
                    this.recover()
                    continue;
                }

                throw e;
            }
        }

        if (this.failed) {
            logger.critical({message: "Parsing failed.", fields: []})
            return {expressions: []} as AST.Program
        }

        logger.info({message: "Parsing successful.", fields: []})
        return {expressions} as AST.Program
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

        // Assignment
        if (expr.kind === "Symbol" && this.current.is("Equals")) {
            this.consume() // Skip '='
            const value = this.parseExpression()

            return {kind: "Assignment", loc, target: expr.name, value}
        }

        // Type check
        if (this.current.is("IsKeyword")) {
            this.consume() // Skip 'is'

            this.expect("Identifier")
            const typeName = this.current
            assert(typeName.isIdentifier())

            this.consume() // Skip type identifier

            return {kind: "Is", loc, expr, type: typeName}
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
                this.error(`Chaining ${descriptor.group.toLowerCase()} operators is not allowed. Failed on ${this.current.location}`)
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
            this.error(`Reached end of file while parsing expression on ${this.current.location}`)

        const loc = this.current.location
        const fn = findFactorParser(this.current.type)
        if (fn) {
            let fac = (fn.bind(this))()

            // Call expr
            while (this.stream.isCurrentPresent() && this.current.is("LeftParen") || this.current.is("LeftBracket") || this.current.is("CastKeyword") || this.current.is("Pipe")) {
                let loc = this.current.location

                if (this.current.is("LeftParen")) {
                    const args: AST.Expr[] = this.parseCommaSeparated("LeftParen", "RightParen", this.parseExpression)
                    fac = {kind: "CallExpr", loc, callee: fac, args}
                    continue;
                }

                if (this.current.is("LeftBracket")) {
                    this.consume() // Skip '['
                    const index = this.parseExpression()
                    this.expect("RightBracket")
                    this.consume() // Skip ']'
                    fac = {kind: "ArrayAccess", loc, array: fac, index}
                    continue;
                }

                if (this.current.is("CastKeyword")) {
                    this.consume() // Skip 'cast'
                    this.expect("Identifier")

                    const typeIdentifier = this.current
                    assert(typeIdentifier.isIdentifier())

                    fac = {kind: "CastExpr", loc, expr: fac, type: typeIdentifier}

                    this.consume() // Skip type identifier
                }

                if (this.current.is("Pipe")) {
                    this.consume() // Skip '|'

                    const callee = this.parseExpression()
                    fac = {kind: "CallExpr", loc, args: [fac], callee}
                }
            }

            return fac
        }

        this.error(`Unknown expression starting with ${this.current}`)
    }

    @RegisterParser("ContinueKeyword")
    private parseContinue(): AST.ContinueExpr {
        const loc = this.current.location

        this.consume() // Skip 'continue'

        return {kind: "ContinueExpr", loc}
    }

    @RegisterParser("BreakKeyword")
    private parseBreak(): AST.BreakExpr {
        const loc = this.current.location

        this.consume() // Skip 'break'

        return {kind: "BreakExpr", loc}
    }

    @RegisterParser("ErrorKeyword")
    private parseError(): AST.ErrorExpr {
        const loc = this.current.location

        this.consume() // Skip 'error'

        const message = this.parseExpression()

        return {kind: "ErrorExpr", loc, message}
    }

    @RegisterParser("NumberLiteral")
    private parseNumberLiteral(): AST.NumberLiteral {
        const loc = this.current.location

        const value = Number.parseFloat(this.current.value)

        if (Number.isNaN(value))
            this.error(
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
            this.error(`Reached end of file while parsing sub-expression starting on ${loc}`)

        this.expect("RightParen")

        this.consume() // Skip ')'

        return expr
    }

    @RegisterParser("VectorStart")
    private parseVector(): AST.VectorLiteral {
        const loc = this.current.location

        this.consume()

        // === X Component ===
        const xExpr = this.parseExpression()
        if (this.current.isEof())
            this.error(`Reached end of file while parsing vector expression starting on ${loc}`)
        this.expect("Comma")
        this.consume() // Skip ','

        // === Y Component ===
        const yExpr = this.parseExpression()
        if (this.current.isEof())
            this.error(`Reached end of file while parsing vector expression starting on ${loc}`)
        this.expect("Comma")
        this.consume() // Skip ','

        // === Z Component ===
        const zExpr = this.parseExpression()
        if (this.current.isEof())
            this.error(`Reached end of file while parsing vector expression starting on ${loc}`)
        this.expect("VectorEnd")
        this.consume() // Skip '>'

        return {kind: "VectorLiteral", loc: loc, x: xExpr, y: yExpr, z: zExpr}
    }

    @RegisterParser("LeftBracket")
    private parseArray(): AST.ArrayLiteral {
        const loc = this.current.location
        const elements = this.parseCommaSeparated("LeftBracket", "RightBracket", this.parseExpression)
        return {kind: "ArrayLiteral", loc, elements}
    }

    @RegisterParser("LetKeyword")
    private parseVariableDeclaration(): AST.VariableDeclaration {
        const loc = this.current.location

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

        this.consume() // Skip 'return'

        let value: AST.Expr | undefined = undefined

        if (this.current.isNot("Semicolon"))
            value = this.parseExpression()

        return {kind: "ReturnExpr", loc, expr: value}
    }

    @RegisterParser("IfKeyword")
    private parseIf(): AST.IfExpr {
        const loc = this.current.location

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

        this.consume() // Skip 'while'

        const condition = this.parseExpression()
        const body = this.parseBlock()

        return {kind: "While", loc, body, condition}
    }

    @RegisterParser("ForKeyword")
    private parseFor(): AST.ForExpr {
        const loc = this.current.location

        this.consume() // Skip 'for'

        this.expect('Identifier')

        const variable = this.current
        assert(variable.isIdentifier())

        this.consume() // Skip variable

        this.expect('InKeyword')
        this.consume() // Skip 'in'

        const iterable = this.parseExpression()
        const block = this.parseBlock()

        return {kind: "For", loc, variable, iterable, block}
    }

    @RegisterParser("TrueKeyword")
    private parseTrue(): AST.TrueExpr {
        const loc = this.current.location

        this.consume()

        return {kind: "True", loc}
    }

    @RegisterParser("FalseKeyword")
    private parseFalse(): AST.FalseExpr {
        const loc = this.current.location

        this.consume()

        return {kind: "False", loc}
    }

    @RegisterParser("UnitKeyword")
    private parseUnit(): AST.UnitExpr {
        const loc = this.current.location

        this.consume()

        return {kind: "Unit", loc}
    }
}