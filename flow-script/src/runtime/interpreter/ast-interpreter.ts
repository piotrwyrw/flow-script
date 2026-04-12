/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {AST} from "../../syntax/ast/ast.js";
import type {AnyValue} from "../values.js";

export type AstInterpreter = {
    [T in AST.Expr["kind"]]: (expr: Extract<AST.Expr, { kind: T }>) => AnyValue
}