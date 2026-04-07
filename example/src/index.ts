import {Tokenizer} from "flow-script";


(() => {
    const tokenizer = new Tokenizer("let a = 0;")
    tokenizer.tokenize()
    console.log(tokenizer.tokens)
})()