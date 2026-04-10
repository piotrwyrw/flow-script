import {Parser, TokenStream} from "flow-script";
import {readFileSync} from "node:fs";

const src = readFileSync('../demo/grammar.flow', {encoding: 'utf-8'})
const parser = new Parser(new TokenStream(src))
console.log(JSON.stringify(parser.parse()))