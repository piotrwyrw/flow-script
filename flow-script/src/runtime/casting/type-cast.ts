/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {AnyValue, ArrayValue, BooleanValue, NumberValue, StringValue, UnitValue, VectorValue} from "../values.js";
import {runtimeError} from "../../log/error.js";

type Kind = AnyValue["type"];

type AnyCastFn = (value: AnyValue) => AnyValue;

type CastFn<A extends Kind, B extends Kind> =
    (value: Extract<AnyValue, { type: A }>) =>
        Extract<AnyValue, { type: B }>;

const castRegistry = new Map<Kind, Map<Kind, AnyCastFn>>();

function registerCast<A extends Kind, B extends Kind>(from: A, to: B, fn: CastFn<A, B>) {
    let inner = castRegistry.get(from)

    if (!inner) {
        inner = new Map();
        castRegistry.set(from, inner);
    }

    inner.set(to, fn as unknown as AnyCastFn);
}

function RegisterCast<A extends Kind, B extends Kind>(from: A, to: B) {
    return (value: CastFn<A, B>) => {
        if (castRegistry.has(from) && castRegistry.get(from)?.has(to)) {
            throw new Error(`A cast between ${from} and ${to} was already previously registered.`)
        }

        registerCast<A, B>(from, to, value)
    }
}

export function castValue<T extends Kind>(value: AnyValue, toType: T): Extract<AnyValue, { type: T }> {
    const cast = tryCastValue(value, toType)
    if (!cast)
        runtimeError(`Cannot cast value of type ${value.type} to ${toType}`)

    return cast
}

export function tryCastValue<T extends Kind>(value: AnyValue, toType: T): Extract<AnyValue, { type: T }> | undefined {
    if (value.type === toType)
        return {...value} as Extract<AnyValue, { type: T }>

    const map = castRegistry.get(value.type)
    if (!map) return undefined;

    const fn = map.get(toType)
    if (!fn) return undefined;

    return fn(value) as Extract<AnyValue, { type: T }>
}

// I need a class to use decorators, but the instance is completely irrelevant. Hence, `void class`
void class {
    @RegisterCast("Unit", "String")
    unitToString(value: UnitValue): StringValue {
        return {type: "String", value: "Unit"}
    }

    @RegisterCast("Number", "String")
    numberToString(value: NumberValue): StringValue {
        return {type: "String", value: value.value.toString()}
    }

    @RegisterCast("Boolean", "String")
    booleanToString(value: BooleanValue): StringValue {
        return {type: "String", value: value.value ? "true" : "false"}
    }

    @RegisterCast("Vector", "String")
    vectorToString(value: VectorValue): StringValue {
        return {type: "String", value: `<|${value.value.x}, ${value.value.y}, ${value.value.z}|>`}
    }

    @RegisterCast("String", "Array")
    stringToArray(value: StringValue): ArrayValue {
        return {type: "Array", value: [...value.value].map(v => ({type: "String", value: v}))}
    }
}