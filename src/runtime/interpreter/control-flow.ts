/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {AnyValue, StringValue} from "../values.js";

export class ReturnSignal {
    readonly value: AnyValue

    constructor(value: AnyValue) {
        this.value = value
    }
}

export class ContinueSignal {
}

export class BreakSignal {
}

export class ErrorSignal {
    message: string

    constructor(message: string) {
        this.message = message
    }
}