import { Logger } from "./logger.js"
import { LoggerProvider, createLoggerProvider } from "./provider.js"

export const globalLoggerProvider: LoggerProvider = createLoggerProvider()

export const createLogger = (channel?: string): Logger => {
  return globalLoggerProvider.createLogger(channel)
}
