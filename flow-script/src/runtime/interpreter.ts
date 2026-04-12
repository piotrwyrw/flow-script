import type {AstInterpreter} from "./ast-interpreter.js";
import {AST} from "../syntax/ast/ast.js";
import type {AnyValue} from "./values.js";
import {evalBinaryExpression} from "./interpreters/binary-expr.js";
import {runtimeError} from "../error/FSError.js";

export class Interpreter implements AstInterpreter {

    private readonly handlers: AstInterpreter = {
        ArrayLiteral: this.ArrayLiteral.bind(this),
        Assignment: this.Assignment.bind(this),
        BinaryExpr: this.BinaryExpr.bind(this),
        BlockExpr: this.BlockExpr.bind(this),
        BooleanLiteral: this.BooleanLiteral.bind(this),
        CallExpr: this.CallExpr.bind(this),
        False: this.False.bind(this),
        For: this.For.bind(this),
        FunctionDefExpr: this.FunctionDefExpr.bind(this),
        IfExpr: this.IfExpr.bind(this),
        NumberLiteral: this.NumberLiteral.bind(this),
        ReturnExpr: this.ReturnExpr.bind(this),
        StringLiteral: this.StringLiteral.bind(this),
        Symbol: this.Symbol.bind(this),
        True: this.True.bind(this),
        Unit: this.Unit.bind(this),
        VariableDeclaration: this.VariableDeclaration.bind(this),
        VectorLiteral: this.VectorLiteral.bind(this),
        While: this.While.bind(this)
    }

    private dispatch<T extends AST.Expr["kind"]>(node: Extract<AST.Expr, { kind: T }>): AnyValue {
        return this.handlers[node.kind](node)
    }

    evaluate(expr: AST.Expr): AnyValue {
        return this.dispatch(expr)
    }

    ArrayLiteral(expr: Extract<AST.Expr, { kind: "ArrayLiteral" }>): AnyValue {
        return {type: "Unit"};
    }

    Assignment(expr: Extract<AST.Expr, { kind: "Assignment" }>): AnyValue {
        return {type: "Unit"};
    }

    BinaryExpr(expr: Extract<AST.Expr, { kind: "BinaryExpr" }>): AnyValue {
        return evalBinaryExpression(this, expr)
    }

    BlockExpr(expr: Extract<AST.Expr, { kind: "BlockExpr" }>): AnyValue {
        return {type: "Unit"};
    }

    BooleanLiteral(expr: Extract<AST.Expr, { kind: "BooleanLiteral" }>): AnyValue {
        return {type: "Boolean", value: expr.value};
    }

    CallExpr(expr: Extract<AST.Expr, { kind: "CallExpr" }>): AnyValue {
        return {type: "Unit"};
    }

    False(expr: Extract<AST.Expr, { kind: "False" }>): AnyValue {
        return {type: "Boolean", value: false};
    }

    For(expr: Extract<AST.Expr, { kind: "For" }>): AnyValue {
        return {type: "Unit"};
    }

    FunctionDefExpr(expr: Extract<AST.Expr, { kind: "FunctionDefExpr" }>): AnyValue {
        return {type: "Unit"};
    }

    IfExpr(expr: Extract<AST.Expr, { kind: "IfExpr" }>): AnyValue {
        return {type: "Unit"};
    }

    NumberLiteral(expr: Extract<AST.Expr, { kind: "NumberLiteral" }>): AnyValue {
        return {type: "Number", value: expr.value};
    }

    ReturnExpr(expr: Extract<AST.Expr, { kind: "ReturnExpr" }>): AnyValue {
        return {type: "Unit"};
    }

    StringLiteral(expr: Extract<AST.Expr, { kind: "StringLiteral" }>): AnyValue {
        return {type: "String", value: expr.value};
    }

    Symbol(expr: Extract<AST.Expr, { kind: "Symbol" }>): AnyValue {
        return {type: "Unit"};
    }

    True(expr: Extract<AST.Expr, { kind: "True" }>): AnyValue {
        return {type: "Boolean", value: true};
    }

    Unit(expr: Extract<AST.Expr, { kind: "Unit" }>): AnyValue {
        return {type: "Unit"};
    }

    VariableDeclaration(expr: Extract<AST.Expr, { kind: "VariableDeclaration" }>): AnyValue {
        return {type: "Unit"};
    }

    VectorLiteral(expr: Extract<AST.Expr, { kind: "VectorLiteral" }>): AnyValue {
        const x = this.evaluate(expr.x)
        if (x.type !== "Number")
            runtimeError(`X Component of vector must be a Number, got ${x.type} ${expr.x.loc}`)

        const y = this.evaluate(expr.y)
        if (y.type !== "Number")
            runtimeError(`Y Component of vector must be a Number, got ${y.type} ${expr.y.loc}`)

        const z = this.evaluate(expr.z)
        if (z.type !== "Number")
            runtimeError(`Z Component of vector must be a Number, got ${z.type} ${expr.z.loc}`)

        return {
            type: "Vector", value: {
                x: x.value,
                y: y.value,
                z: z.value
            }
        }
    }

    While(expr: Extract<AST.Expr, { kind: "While" }>): AnyValue {
        return {type: "Unit"};
    }
}