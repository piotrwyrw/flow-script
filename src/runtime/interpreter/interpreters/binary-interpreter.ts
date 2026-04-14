/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {AST} from "../../../syntax/ast/ast";
import {type AnyValue, type BooleanValue} from "../../values";
import {castValue} from "../../casting/type-cast";
import type {Interpreter} from "../interpreter";
import {runtimeError} from "../../../log/error";

type BinaryOpHandler = (l: AnyValue, r: AnyValue) => AnyValue

const BinaryOpHandlers: Record<AST.BinaryOp.BinaryExprOperator, BinaryOpHandler> = {
    "!=": (l: AnyValue, r: AnyValue) => Comparative.notEquals(l, r),
    "<": (l: AnyValue, r: AnyValue) => Comparative.lessThan(l, r),
    "<=": (l: AnyValue, r: AnyValue) => Comparative.lessThanOrEqual(l, r),
    "==": (l: AnyValue, r: AnyValue) => Comparative.equals(l, r),
    ">": (l: AnyValue, r: AnyValue) => Comparative.greaterThan(l, r),
    ">=": (l: AnyValue, r: AnyValue) => Comparative.greaterThanOrEqual(l, r),
    "&&": (l: AnyValue, r: AnyValue) => Boolean.and(l, r),
    "||": (l: AnyValue, r: AnyValue) => Boolean.or(l, r),
    "*": (l: AnyValue, r: AnyValue) => Arithmetic.times(l, r),
    "+": (l: AnyValue, r: AnyValue) => Arithmetic.plus(l, r),
    "-": (l: AnyValue, r: AnyValue) => Arithmetic.minus(l, r),
    "/": (l: AnyValue, r: AnyValue) => Arithmetic.divide(l, r),
}

namespace Comparative {
    export function equals(l: AnyValue, r: AnyValue): BooleanValue {
        if (l.type !== r.type)
            return {type: "Boolean", value: false}

        if (l.type === "Unit" && r.type === "Unit")
            return {type: "Boolean", value: true}

        if (l.type === "Vector" && r.type === "Vector")
            return {
                type: "Boolean",
                value:
                    l.value.x === r.value.x &&
                    l.value.y === r.value.y &&
                    l.value.z === r.value.z
            }

        if ((l.type === "Number" && r.type === "Number")
            || (l.type === "String" && r.type === "String")
            || (l.type === "Boolean" && r.type === "Boolean"))
            return {type: "Boolean", value: l.value === r.value}

        runtimeError(`Cannot compare types ${l.type} and ${r.type}}`)
    }

    export function notEquals(l: AnyValue, r: AnyValue): BooleanValue {
        return {type: "Boolean", value: !equals(l, r)}
    }

    export function lessThan(l: AnyValue, r: AnyValue): BooleanValue {
        if (l.type !== "Number" || r.type !== "Number")
            runtimeError(`Invalid operands for '<' operator: ${l.type} and ${r.type}`)

        return {type: "Boolean", value: l.value < r.value}
    }

    export function lessThanOrEqual(l: AnyValue, r: AnyValue): BooleanValue {
        if (l.type !== "Number" || r.type !== "Number")
            runtimeError(`Invalid operands for '<=' operator: ${l.type} and ${r.type}`)

        return {type: "Boolean", value: l.value <= r.value}
    }

    export function greaterThan(l: AnyValue, r: AnyValue): BooleanValue {
        if (l.type !== "Number" || r.type !== "Number")
            runtimeError(`Invalid operands for '>' operator: ${l.type} and ${r.type}`)

        return {type: "Boolean", value: l.value > r.value}
    }

    export function greaterThanOrEqual(l: AnyValue, r: AnyValue): BooleanValue {
        if (l.type !== "Number" || r.type !== "Number")
            runtimeError(`Invalid operands for '>=' operator: ${l.type} and ${r.type}`)

        return {type: "Boolean", value: l.value >= r.value}
    }
}

namespace Boolean {
    export function and(l: AnyValue, r: AnyValue): BooleanValue {
        if (l.type !== "Boolean" || r.type !== "Boolean")
            runtimeError(`Invalid operands for '&&' operator: ${l.type} and ${r.type}`)

        return {type: "Boolean", value: l.value && r.value}
    }

    export function or(l: AnyValue, r: AnyValue): BooleanValue {
        if (l.type !== "Boolean" || r.type !== "Boolean")
            runtimeError(`Invalid operands for '||' operator: ${l.type} and ${r.type}`)

        return {type: "Boolean", value: l.value || r.value}
    }
}

namespace Arithmetic {
    export function plus(l: AnyValue, r: AnyValue): AnyValue {
        if (l.type === "String" && r.type === "Number")
            return {type: "String", value: l.value + castValue(r, "String").value}

        if (l.type === "Number" && r.type === "String")
            return {type: "String", value: castValue(l, "String").value + r.value}

        if (l.type === "Boolean" && r.type === "String")
            return {type: "String", value: castValue(l, "String").value + r.value}

        if (l.type === "String" && r.type === "Boolean")
            return {type: "String", value: l.value + castValue(r, "String").value}

        if (l.type === "String" && r.type === "String")
            return {type: "String", value: l.value + r.value}

        if (l.type === "String" && r.type === "Vector")
            return {type: "String", value: l.value + castValue(r, "String").value}

        if (l.type === "Vector" && r.type === "String")
            return {type: "String", value: castValue(l, "String").value + r.value}

        if (l.type === "Number" && r.type === "Number")
            return {type: "Number", value: l.value + r.value}

        if (l.type === "Vector" && r.type === "Vector")
            return {
                type: "Vector",
                value: {
                    x: l.value.x + r.value.x,
                    y: l.value.y + r.value.y,
                    z: l.value.z + r.value.z
                }
            }

        if (l.type === "Vector" && r.type === "Number")
            return {
                type: "Vector",
                value: {
                    x: l.value.x + r.value,
                    y: l.value.y + r.value,
                    z: l.value.z + r.value
                }
            }

        if (l.type === "Number" && r.type === "Vector")
            return {
                type: "Vector",
                value: {
                    x: l.value + r.value.x,
                    y: l.value + r.value.y,
                    z: l.value + r.value.z
                }
            }

        if (l.type === "Array")
            return {
                type: "Array",
                value: [...l.value, r]
            }

        if (r.type === "Array")
            return {
                type: "Array",
                value: [l, ...r.value]
            }

        runtimeError(`Invalid operands for '+' operator: ${l.type} and ${r.type}`)
    }

    export function minus(l: AnyValue, r: AnyValue): AnyValue {
        if (l.type === "Vector" && r.type === "Vector")
            return {
                type: "Vector",
                value: {
                    x: l.value.x - r.value.x,
                    y: l.value.y - r.value.y,
                    z: l.value.z - r.value.z
                }
            }

        if (l.type === "Vector" && r.type === "Number")
            return {
                type: "Vector",
                value: {
                    x: l.value.x - r.value,
                    y: l.value.y - r.value,
                    z: l.value.z - r.value
                }
            }

        if (l.type === "Number" && r.type === "Number")
            return {type: "Number", value: l.value - r.value}

        runtimeError(`Invalid operands for '-' operator: ${l.type} and ${r.type}`)
    }

    export function times(l: AnyValue, r: AnyValue): AnyValue {
        if (l.type === "Vector" && r.type === "Number")
            return {
                type: "Vector",
                value: {
                    x: l.value.x * r.value,
                    y: l.value.y * r.value,
                    z: l.value.z * r.value
                }
            }

        if (l.type === "Number" && r.type === "Number")
            return {type: "Number", value: l.value * r.value}

        runtimeError(`Invalid operands for '*' operator: ${l.type} and ${r.type}`)
    }

    export function divide(l: AnyValue, r: AnyValue): AnyValue {
        if (l.type === "Vector" && r.type === "Number")
            return {
                type: "Vector",
                value: {
                    x: l.value.x / r.value,
                    y: l.value.y / r.value,
                    z: l.value.z / r.value
                }
            }

        if (l.type === "Number" && r.type === "Number")
            return {type: "Number", value: l.value / r.value}

        runtimeError(`Invalid operands for '/' operator: ${l.type} and ${r.type}`)
    }
}

export function evalBinaryExpression(interpreter: Interpreter, node: AST.BinaryExpr): AnyValue {
    const left = interpreter.evaluate(node.left)
    const right = interpreter.evaluate(node.right)

    return BinaryOpHandlers[node.operator](left, right)
}