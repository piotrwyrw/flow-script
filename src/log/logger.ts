/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export enum LogLevel {
    EVERYTHING = -1,
    TRACE = 1,
    DEBUG = 2,
    INFO = 3,
    WARN = 4,
    ERROR = 5,
    CRIT = 6,
    OFF = Number.MAX_SAFE_INTEGER
}

export enum FSErrorType {
    Tokenizer = "Tokenizer Error",
    Syntax = "Syntax Error",
    Runtime = "Runtime Error"
}

export type LogField = {
    name: string,
    value: string
}

export type LogBody = {
    message: string,
    fields: LogField[]
}

export type Log = LogBody & { level: LogLevel }

export abstract class LogSubscriber {
    onRegistered(): void {
    };

    abstract getLogLevel(): LogLevel;

    abstract receive(log: Log): void;
}

export class Logger {
    private static singletonInstance: Logger | undefined

    private logs: Log[] = []
    private subscribers: LogSubscriber[] = []

    private static ensureInstance() {
        if (!Logger.singletonInstance)
            Logger.singletonInstance = new Logger();
    }

    static getInstance(): Logger {
        Logger.ensureInstance()
        return Logger.singletonInstance!
    }

    registerSubscriber(subscriber: LogSubscriber) {
        this.subscribers.push(subscriber)
    }

    private notifySubscribers(log: Log) {
        this.subscribers.forEach(subscriber => {
            if (log.level >= subscriber.getLogLevel())
                subscriber.receive(log)
        })
    }

    log(log: Log): void {
        this.logs.push(log)
        this.notifySubscribers(log)
    }

    trace(log: LogBody): void {
        this.log({level: LogLevel.TRACE, ...log})
    }

    debug(log: LogBody): void {
        this.log({level: LogLevel.DEBUG, ...log})
    }

    info(log: LogBody): void {
        this.log({level: LogLevel.INFO, ...log})
    }

    warn(log: LogBody): void {
        this.log({level: LogLevel.WARN, ...log})
    }

    error(log: LogBody): void {
        this.log({level: LogLevel.ERROR, ...log})
    }

    critical(log: LogBody): void {
        this.log({level: LogLevel.CRIT, ...log})
    }

    pastLogs(level: LogLevel = LogLevel.EVERYTHING) {
        // If all logs are to be retrieved, skip filtering which could cause performance issues with large log quantities
        if (level == LogLevel.EVERYTHING)
            return this.logs;

        // Same as above
        if (level == LogLevel.OFF)
            return [];

        return this.logs.filter(log => log.level >= level);
    }
}

const LoggerPropertyName = "logger" as const

Object.defineProperty(globalThis, LoggerPropertyName, {
    value: Logger.getInstance(),
    enumerable: false,
    configurable: false,
    writable: false
})

declare global {
    const logger: Logger
}

// Shorthand to automatically trace function calls, so I don't have to contaminate
// the entire codebase with copious amounts of logger calls
export function TraceCall() {
    return (value: Function, context: ClassMethodDecoratorContext) => {
        return (thisArg: any, ...args: any[]): any => {
            const logger = thisArg.logger

            const functionName = String(context.name)
            const callId = crypto.randomUUID()
            const fields = [{name: "callId", value: callId}]

            logger.trace({
                message: `Entering function ${functionName}`,
                fields
            })

            const result = value.apply(thisArg, args)

            logger.trace({
                message: `Function ${functionName} returned`,
                fields
            })

            return result
        }
    }
}