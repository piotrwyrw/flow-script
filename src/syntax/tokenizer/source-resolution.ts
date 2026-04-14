/*
 * Copyright (c) 2026 Piotr Krzysztof Wyrwas [FlowScript]
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {retrieveErrorMessage} from "../../utils";

export type SourceStringResolutionStrategy = {
    kind: "string",
    sourceString: string
}

export type BasicWebResourceResolutionStrategy = {
    kind: "web",
    resourceUrl: string
}

export type AnySourceResolutionStrategy =
    | SourceStringResolutionStrategy
    | BasicWebResourceResolutionStrategy

export type RedundantSourceResolutionStrategy = AnySourceResolutionStrategy & {fallback?: RedundantSourceResolutionStrategy}

function resolveSourceString(strategy: SourceStringResolutionStrategy): string {
    logger.debug({
        message: "Resolved source through the source string resolution strategy.", fields: [
            {name: "size", value: `${strategy.sourceString.length} bytes`}
        ]
    })

    return strategy.sourceString
}

async function resolveBasicWeb(strategy: BasicWebResourceResolutionStrategy): Promise<string> {
    try {
        const resp = await fetch(strategy.resourceUrl)

        if (!resp.ok) {
            logger.error({
                message: "Could not resolve source file from a web resource.",
                fields: [
                    {name: "url", value: strategy.resourceUrl},
                    {name: "status", value: String(resp.status)}
                ]
            })

            throw new Error(`Failed to fetch resource: HTTP ${resp.status}`);
        }

        const text = await resp.text()

        logger.debug({
            message: "Resolved source through web resolution strategy.",
            fields: [
                {name: "size", value: `${text.length} bytes`}
            ]
        })

        return text
    } catch (e) {
        logger.error({
            message: "An error occurred while trying to resolve a web resource.",
            fields: [
                {name: "error", value: retrieveErrorMessage(e)},
                {name: "url", value: strategy.resourceUrl}
            ]
        })

        throw e
    }
}

export async function resolveSource(strategy: AnySourceResolutionStrategy): Promise<string> {
    switch (strategy.kind) {
        case "string":
            return resolveSourceString(strategy);
        case "web":
            return resolveBasicWeb(strategy);
    }
}