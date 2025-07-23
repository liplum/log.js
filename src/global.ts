import { createConsoleLogging } from "./console.js"
import { Logger } from "./logger.js"
import { LoggerProvider, createLoggerProvider } from "./provider.js"

export const globalLoggerProvider: LoggerProvider = createLoggerProvider()

const globalConsoleLogging = createConsoleLogging({
  logLevels: process.env.NODE_ENV === "production"
    ? ["error", "warn", "info"]
    : undefined,
})

globalConsoleLogging.on(globalLoggerProvider)

export const createLogger = (channel?: string): Logger => {
  return globalLoggerProvider.createLogger(channel)
}
