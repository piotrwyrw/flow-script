/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export class Location {
    line: number
    column: number

    constructor(line: number, column: number) {
        this.line = line
        this.column = column
    }

    toString() {
        return `[${this.line}:${this.column}]`
    }
}