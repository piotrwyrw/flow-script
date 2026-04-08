import type {TokenStream} from "../tokenizer/token-stream";
import {AST} from "../ast/ast";
import type {Token} from "../tokenizer/token";
import {syntaxError} from "../../error/FSError";

export class Parser {
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

    parse(): AST.Expr {
        return this.parseExpression()
    }

    parseExpression(): AST.Expr {
        let left = this.parseTerm()

        let op = AST.BinaryOp.binaryOperatorFrom(this.current)
        if (!op)
            return left;

        while (op && AST.BinaryOp.isAdditiveOperator(op)) {
            this.consume() // Skip the operator

            const right = this.parseExpression()
            left = {
                kind: 'BinaryExpr',
                loc: left.loc,
                operator: op,
                left: left,
                right: right
            } as AST.BinaryExpr

            op = AST.BinaryOp.binaryOperatorFrom(this.current)
        }

        return left
    }

    parseTerm(): AST.Expr {
        let left = this.parseFactor()

        let op = AST.BinaryOp.binaryOperatorFrom(this.current)
        if (!op)
            return left;

        while (op && AST.BinaryOp.isMultiplicativeOperator(op)) {
            this.consume() // Skip the operator

            const right = this.parseTerm()
            left = {
                kind: 'BinaryExpr',
                loc: left.loc,
                operator: op,
                left: left,
                right: right
            } as AST.BinaryExpr

            op = AST.BinaryOp.binaryOperatorFrom(this.current)
        }

        return left
    }

    parseFactor(): AST.Expr {
        if (this.current.is('NumberLiteral')) {
            const value = Number.parseFloat(this.current.value)

            if (Number.isNaN(value))
                syntaxError(
                    "Could not parse number literal because the value of the number literal token is " +
                    "not a valid number. This should not happen."
                )

            const node = {
                kind: 'NumberLiteral',
                loc: this.current.location,
                value: value
            } as AST.NumberLiteral

            this.consume()

            return node;
        }

        if (this.current.is('StringLiteral')) {
            this.consume()

            const node = {
                kind: 'StringLiteral',
                loc: this.current.location,
                value: this.current.value
            } as AST.StringLiteral

            this.consume()

            return node;
        }

        if (this.current.is('LeftParen')) {
            const loc = this.current.location

            this.consume()

            const expr = this.parseExpression()

            if (this.current.isEof())
                syntaxError(`Reached end of file while parsing sub-expression starting on ${loc}`)

            if (this.current.isNot('RightParen'))
                syntaxError(`Expected ')' after sub-expression starting on ${loc}, got ${this.current}`)

            this.consume() // Skip ')'

            return expr
        }

        // Vector expression <|x, y, z|>
        if (this.current.is('VectorStart')) {
            const loc = this.current.location

            this.consume()

            // === X Component ===
            const xExpr = this.parseExpression()
            if (this.current.isEof())
                syntaxError(`Reached end of file while parsing vector expression starting on ${loc}`)
            if (this.current.isNot('Comma'))
                syntaxError(`Expected ',' after the X component expression of vector starting on ${loc}`)
            this.consume() // Skip ','

            // === Y Component ===
            const yExpr = this.parseExpression()
            if (this.current.isEof())
                syntaxError(`Reached end of file while parsing vector expression starting on ${loc}`)
            if (this.current.isNot('Comma'))
                syntaxError(`Expected ',' after the Y component expression of vector starting on ${loc}`)
            this.consume() // Skip ','

            // === Z Component ===
            const zExpr = this.parseExpression()
            if (this.current.isEof())
                syntaxError(`Reached end of file while parsing vector expression starting on ${loc}`)

            if (this.current.isNot('VectorEnd'))
                syntaxError(`Expected '|>' after the Z component expression of vector starting on ${loc}`)
            this.consume() // Skip '>'

            return {
                kind: 'VectorLiteral',
                loc: loc,
                x: xExpr,
                y: yExpr,
                z: zExpr
            } as AST.VectorLiteral
        }

        if (this.current.type === 'EOF')
            syntaxError(`File ended while parsing an expression on ${this.current.location}`)

        syntaxError(`Unknown expression factor starting with ${this.current}`)
    }

}