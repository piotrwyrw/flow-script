/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function retrieveErrorMessage(e: any): string {
    if (!e)
        return "Unknown error"

    if ("message" in e)
        return e.message

    if ("name" in e)
        return e.name

    return "Unknown error"
}

export function assert(cond: any, msg?: string): asserts cond {
    if (!cond) throw new Error(msg ?? "assertion failed")
}