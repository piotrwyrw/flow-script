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