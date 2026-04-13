/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {Parser, Runtime, TokenStream} from "flow-script";
import {type Log, LogLevel} from "flow-script/dist/log/logger.js";

logger.registerSubscriber({
    getLogLevel(): LogLevel {
        return LogLevel.EVERYTHING;
    },

    onRegistered(): void {
    },

    receive(log: Log): void {
        console.log(`${log.level}: ${log.message}`)
        console.log(`---> ${JSON.stringify(log.fields)}`)
    }
})

const tokenStream = await TokenStream.fromResolvedSource({
    kind: "fs",
    filePath: "../demo/grammar.flow"
}, true)

if (!tokenStream)
    throw new Error("Token stream is undefined.")

const parser = new Parser(tokenStream)
const program = parser.parse()

if (!parser.ok()) {
    logger.error({message: "Parser failed. Aborting.", fields: []})
} else {
    console.log(JSON.stringify(program))
    const runtime = new Runtime(program)
    runtime.interpret()
}