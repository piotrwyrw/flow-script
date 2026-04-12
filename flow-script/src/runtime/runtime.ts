import {AST} from "../syntax/ast/ast.js";
import {Interpreter} from "./interpreter.js";

export class Runtime {
    private readonly program: AST.Program

    private interpreter: Interpreter

    constructor(program: AST.Program) {
        this.program = program
        this.interpreter = new Interpreter()
    }

    interpret() {
        this.program.expressions.forEach(expr => {
            console.log(JSON.stringify(this.interpreter.evaluate(expr)))
        })
    }

}