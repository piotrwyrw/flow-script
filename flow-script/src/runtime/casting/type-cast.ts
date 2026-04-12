import type {AnyValue, BooleanValue, NumberValue, StringValue, UnitValue, VectorValue} from "../values.js";
import {runtimeError} from "../../error/FSError.js";

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
    const err = `Cannot cast value of type ${value.type} to ${toType}`

    if (value.type === toType)
        return {...value} as Extract<AnyValue, { type: T }>

    const map = castRegistry.get(value.type)
    if (!map) runtimeError(err)

    const fn = map.get(toType)
    if (!fn) runtimeError(err)

    return fn(value) as Extract<AnyValue, { type: T }>
}

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
}