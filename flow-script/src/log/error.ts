/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {LogField} from "./logger.js";

export function critical(message: string, exceptionMessage: string, fields?: LogField[]): never {
    logger.critical({message, fields: fields || []})
    throw new Error(exceptionMessage)
}

export function runtimeError(message: string, fields?: LogField[]): never {
    return critical(message, `An unrecoverable runtime error occurred: ${message}`, fields)
}

export function tokenizerError(message: string, fields?: LogField[]): never {
    return critical(message, `An unrecoverable tokenizer error occurred: ${message}`, fields)
}