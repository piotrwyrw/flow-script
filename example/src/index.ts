import {TokenStream} from "flow-script/dist/syntax/tokenizer/token-stream.js";


(() => {
    const stream = new TokenStream("let a = 0;")
    stream.tokenize()
    while (stream.isCurrentPresent()) {
        const token = stream.getCurrent()
        console.table(token)
        stream.consume()
    }
})()