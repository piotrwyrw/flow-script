export enum FSErrorType {
    Tokenizer = "Tokenizer Error",
    Syntax = "Syntax Error"
}

export class FSError extends Error {
    type: FSErrorType

    constructor(type: FSErrorType, message: string) {
        super();
        this.name = type
        this.message = message
        this.type = type
        Object.setPrototypeOf(this, FSError.prototype)
    }
}

export function tokenizerError(message: string): never {
    throw new FSError(FSErrorType.Tokenizer, message)
}

export function syntaxError(message: string): never {
    throw new FSError(FSErrorType.Syntax, message)
}