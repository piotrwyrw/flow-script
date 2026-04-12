import type {AnyValue} from "../values.js";
import {runtimeError} from "../../error/FSError.js";

type Kind = AnyValue["type"];

type AnyCastFn = (value: AnyValue) => AnyValue;

type CastFn<A extends Kind, B extends Kind> =
    (value: Extract<AnyValue, { type: A }>) =>
        Extract<AnyValue, { type: B }>;

const CastRegistry = new Map<Kind, Map<Kind, AnyCastFn>>();

function registerCast<A extends Kind, B extends Kind>(from: A, to: B, fn: CastFn<A, B>) {
    let inner = CastRegistry.get(from)

    if (!inner) {
        inner = new Map();
        CastRegistry.set(from, inner);
    }

    inner.set(to, fn as unknown as AnyCastFn);
}

export function castValue<T extends Kind>(value: AnyValue, toType: T): Extract<AnyValue, { type: T }> {
    const err = `Cannot cast value of type ${value.type} to ${toType}`

    const map = CastRegistry.get(value.type)
    if (!map) runtimeError(err)

    const fn = map.get(toType)
    if (!fn) runtimeError(err)

    return fn(value) as Extract<AnyValue, { type: T }>
}

registerCast("Unit", "String", (value) => ({
    type: "String",
    value: "Unit"
}))

registerCast("Number", "String", (value) => ({
    type: "String",
    value: value.value.toString()
}))

registerCast("String", "String", (value) => ({
    type: "String",
    value: value.value
}))

registerCast("Boolean", "String", (value) => ({
    type: "String",
    value: value.value ? "true" : "false"
}))

registerCast("Vector", "String", (value) => ({
    type: "String",
    value: `<|${value.value.x}, ${value.value.y}, ${value.value.z}|>`
}))