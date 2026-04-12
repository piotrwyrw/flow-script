export type UnitValue = { type: "Unit" }

export type NumberValue = { type: "Number", value: number }

export type StringValue = { type: "String", value: string }

export type BooleanValue = { type: "Boolean", value: boolean }

export type VectorValue = { type: "Vector", value: { x: number, y: number, z: number } }

export type AnyValue =
    | UnitValue
    | NumberValue
    | StringValue
    | BooleanValue
    | VectorValue