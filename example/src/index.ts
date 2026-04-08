import {Parser, TokenStream} from "flow-script";

const parser = new Parser(new TokenStream("\"Test\""))
console.log(JSON.stringify(parser.parse()))