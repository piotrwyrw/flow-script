/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {AnyValue} from "./values.js";
import {castValue} from "./casting/type-cast.js";

export type BuiltinFunction = {
    identifier: string,
    parameters: readonly string[],
    callback: (...args: AnyValue[]) => AnyValue
}

export function builtinFunction(identifier: string,
                                parameters: readonly string[],
                                callback: (...args: AnyValue[]) => AnyValue): BuiltinFunction {
    return {identifier, parameters, callback}
}

export const DefaultBuiltinMathFunctions: BuiltinFunction[] = [
    builtinFunction( "sin", ["x"], (x: AnyValue): AnyValue => {
        const xValue = castValue(x, "Number")
        return {type: "Number", value: Math.sin(xValue.value)}
    }),

    builtinFunction( "cos", ["x"], (x: AnyValue): AnyValue => {
        const xValue = castValue(x, "Number")
        return {type: "Number", value: Math.cos(xValue.value)}
    }),

    builtinFunction( "tan", ["x"], (x: AnyValue): AnyValue => {
        const xValue = castValue(x, "Number")
        return {type: "Number", value: Math.tan(xValue.value)}
    }),

    builtinFunction( "asin", ["x"], (x: AnyValue): AnyValue => {
        const xValue = castValue(x, "Number")
        return {type: "Number", value: Math.asin(xValue.value)}
    }),

    builtinFunction( "acos", ["x"], (x: AnyValue): AnyValue => {
        const xValue = castValue(x, "Number")
        return {type: "Number", value: Math.acos(xValue.value)}
    }),

    builtinFunction( "atan", ["x"], (x: AnyValue): AnyValue => {
        const xValue = castValue(x, "Number")
        return {type: "Number", value: Math.atan(xValue.value)}
    }),

    builtinFunction( "sqrt", ["x"], (x: AnyValue): AnyValue => {
        const xValue = castValue(x, "Number")
        return {type: "Number", value: Math.sqrt(xValue.value)}
    }),

    builtinFunction( "cbrt", ["x"], (x: AnyValue): AnyValue => {
        const xValue = castValue(x, "Number")
        return {type: "Number", value: Math.cbrt(xValue.value)}
    }),

    builtinFunction( "exp", ["x"], (x: AnyValue): AnyValue => {
        const xValue = castValue(x, "Number")
        return {type: "Number", value: Math.exp(xValue.value)}
    }),

    builtinFunction( "pow", ["x", "y"], (x: AnyValue, y: AnyValue): AnyValue => {
        const xValue = castValue(x, "Number")
        const yValue = castValue(y, "Number")
        return {type: "Number", value: Math.pow(xValue.value, yValue.value)}
    }),

    builtinFunction( "abs", ["x"], (x: AnyValue): AnyValue => {
        const xValue = castValue(x, "Number")
        return {type: "Number", value: Math.abs(xValue.value)}
    })
]

export const DefaultBuiltinFunctions: BuiltinFunction[] = [
    builtinFunction("print", ["str"], (str: AnyValue): AnyValue => {
        const strValue = castValue(str, "String")
        console.log(strValue.value)

        return {type: "Unit"}
    }),
    ...DefaultBuiltinMathFunctions
]