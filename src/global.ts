import fs from "fs"
import path from "path"
import { Logger } from "./logger.js"
import { LoggerProvider, LoggerProviderOptions, createLoggerProvider, generateLogFileName } from "./provider.js"

export const globalProvider: LoggerProvider & LoggerProviderOptions = createLoggerProvider() as (LoggerProvider & LoggerProviderOptions)

export const globalOptions: LoggerProviderOptions = globalProvider

export const initGlobalLogDir = (
  logDir: string,
  getLogFileName: () => string = generateLogFileName,
): void => {
  fs.mkdirSync(logDir, { recursive: true })
  globalOptions.logFile = path.join(logDir, getLogFileName())
}

export const createLogger = (channel?: string): Logger => {
  return globalProvider.createLogger(channel)
}
