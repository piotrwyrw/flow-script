/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {Parser, Runtime, TokenStream} from "flow-script";
import {readFileSync} from "node:fs";

const src = readFileSync('../demo/grammar.flow', {encoding: 'utf-8'})
const parser = new Parser(new TokenStream(src))
const program = parser.parse()
console.log(JSON.stringify(program))
const runtime = new Runtime(program)
runtime.interpret()