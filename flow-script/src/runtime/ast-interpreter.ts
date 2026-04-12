import {AST} from "../syntax/ast/ast.js";
import type {AnyValue} from "./values.js";

export type AstInterpreter = {
    [T in AST.Expr["kind"]]: (expr: Extract<AST.Expr, { kind: T }>) => AnyValue
}