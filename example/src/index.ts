import {Parser, TokenStream} from "flow-script";

const parser = new Parser(new TokenStream("<|1 + 2, 3, 4|>"))
console.log(JSON.stringify(parser.parse()))