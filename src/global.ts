import { createConsoleLogging } from "./console.js"
import { Logger } from "./logger.js"
import { LoggerProvider, createLoggerProvider } from "./provider.js"
import * as jsEnv from "browser-or-node"
import { onExit } from "signal-exit"

export const globalLoggerProvider: LoggerProvider = createLoggerProvider()

const globalConsoleLogging = createConsoleLogging({
  logLevels: jsEnv.isNode && process.env.NODE_ENV === "production"
    ? ["error", "warn", "info"]
    : undefined,
})

globalConsoleLogging.on(globalLoggerProvider)

export const createLogger = (channel?: string): Logger => {
  return globalLoggerProvider.createLogger(channel)
}

onExit(() => {
  globalConsoleLogging.off(globalLoggerProvider)
})
