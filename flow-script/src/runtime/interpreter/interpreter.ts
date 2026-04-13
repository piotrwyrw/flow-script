/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type {AstInterpreter} from "./ast-interpreter.js";
import {Runtime} from "../runtime.js";
import {AST} from "../../syntax/ast/ast.js";
import {evalBinaryExpression} from "./interpreters/binary-interpreter.js";
import {evalAssignment, evalSymbolRef, evalVariableDeclaration} from "./interpreters/symbol-interpreter.js";
import {evalVectorLiteral} from "./interpreters/vector-interpreter.js";
import {evalCall, evalFunctionDefinition} from "./interpreters/function-interpreter.js";
import {evalBreak, evalContinue, evalError, evalReturn} from "./interpreters/control-flow-interpreter.js";
import {evalBlock} from "./interpreters/block-interpreter.js";
import {evalIf} from "./interpreters/if-interpreter.js";
import {evalArray, evalArrayAccess} from "./interpreters/array-interpreter.js";
import {evalFor, evalWhile} from "./interpreters/loop-interpreter.js";
import type {AnyValue} from "../values.js";
import {evalCast} from "./interpreters/cast-interpreter.js";
import {evalIs} from "./interpreters/is-interpreter.js";

export class Interpreter {

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
        StringLiteral: this.StringLiteral.bind(this),
        Symbol: this.Symbol.bind(this),
        True: this.True.bind(this),
        Unit: this.Unit.bind(this),
        VariableDeclaration: this.VariableDeclaration.bind(this),
        VectorLiteral: this.VectorLiteral.bind(this),
        While: this.While.bind(this),
        ArrayAccess: this.ArrayAccess.bind(this),
        CastExpr: this.CastExpr.bind(this),
        ReturnExpr: this.ReturnExpr.bind(this),
        ContinueExpr: this.ContinueExpr.bind(this),
        BreakExpr: this.BreakExpr.bind(this),
        ErrorExpr: this.ErrorExpr.bind(this),
        Is: this.IsExpr.bind(this)
    }

    readonly runtime: Runtime

    constructor(runtime: Runtime) {
        this.runtime = runtime;
    }

    private dispatch<T extends AST.Expr["kind"]>(node: Extract<AST.Expr, { kind: T }>): AnyValue {
        return this.handlers[node.kind](node)
    }

    evaluate(expr: AST.Expr): AnyValue {
        return this.dispatch(expr)
    }

    private ArrayLiteral(expr: Extract<AST.Expr, { kind: "ArrayLiteral" }>): AnyValue {
        return evalArray(this, expr);
    }

    private Assignment(expr: Extract<AST.Expr, { kind: "Assignment" }>): AnyValue {
        return evalAssignment(this, expr);
    }

    private BinaryExpr(expr: Extract<AST.Expr, { kind: "BinaryExpr" }>): AnyValue {
        return evalBinaryExpression(this, expr)
    }

    private BlockExpr(expr: Extract<AST.Expr, { kind: "BlockExpr" }>): AnyValue {
        return evalBlock(this, expr);
    }

    private BooleanLiteral(expr: Extract<AST.Expr, { kind: "BooleanLiteral" }>): AnyValue {
        return {type: "Boolean", value: expr.value};
    }

    private CallExpr(expr: Extract<AST.Expr, { kind: "CallExpr" }>): AnyValue {
        return evalCall(this, expr);
    }

    private False(expr: Extract<AST.Expr, { kind: "False" }>): AnyValue {
        return {type: "Boolean", value: false};
    }

    private For(expr: Extract<AST.Expr, { kind: "For" }>): AnyValue {
        return evalFor(this, expr);
    }

    private FunctionDefExpr(expr: Extract<AST.Expr, { kind: "FunctionDefExpr" }>): AnyValue {
        return evalFunctionDefinition(this, expr);
    }

    private IfExpr(expr: Extract<AST.Expr, { kind: "IfExpr" }>): AnyValue {
        return evalIf(this, expr);
    }

    private NumberLiteral(expr: Extract<AST.Expr, { kind: "NumberLiteral" }>): AnyValue {
        return {type: "Number", value: expr.value};
    }

    private ReturnExpr(expr: Extract<AST.Expr, { kind: "ReturnExpr" }>): AnyValue {
        return evalReturn(this, expr);
    }

    private StringLiteral(expr: Extract<AST.Expr, { kind: "StringLiteral" }>): AnyValue {
        return {type: "String", value: expr.value};
    }

    private Symbol(expr: Extract<AST.Expr, { kind: "Symbol" }>): AnyValue {
        return evalSymbolRef(this, expr);
    }

    private True(expr: Extract<AST.Expr, { kind: "True" }>): AnyValue {
        return {type: "Boolean", value: true};
    }

    private Unit(expr: Extract<AST.Expr, { kind: "Unit" }>): AnyValue {
        return {type: "Unit"};
    }

    private VariableDeclaration(expr: Extract<AST.Expr, { kind: "VariableDeclaration" }>): AnyValue {
        return evalVariableDeclaration(this, expr);
    }

    private VectorLiteral(expr: Extract<AST.Expr, { kind: "VectorLiteral" }>): AnyValue {
        return evalVectorLiteral(this, expr);
    }

    private While(expr: Extract<AST.Expr, { kind: "While" }>): AnyValue {
        return evalWhile(this, expr);
    }

    private ArrayAccess(expr: Extract<AST.Expr, { kind: "ArrayAccess" }>): AnyValue {
        return evalArrayAccess(this, expr)
    }

    private CastExpr(expr: Extract<AST.Expr, { kind: "CastExpr" }>): AnyValue {
        return evalCast(this, expr)
    }

    private ContinueExpr(expr: Extract<AST.Expr, { kind: "ContinueExpr" }>): AnyValue {
        return evalContinue(this, expr);
    }

    private BreakExpr(expr: Extract<AST.Expr, { kind: "BreakExpr" }>): AnyValue {
        return evalBreak(this, expr);
    }

    private ErrorExpr(expr: Extract<AST.Expr, { kind: "ErrorExpr" }>): AnyValue {
        return evalError(this, expr)
    }

    private IsExpr(expr: Extract<AST.Expr, { kind: "Is" }>): AnyValue {
        return evalIs(this, expr)
    }

}