import { LogLevel } from "./level.js"
import { createLoggingListener, LoggingTarget, LoggingTargetEventPayload, LoggingListener } from "./listener.js"
import chalk from "chalk"
import * as jsEnv from "browser-or-node"

export type Tinter = (...text: any[]) => string
export type TinterResolver = (level: LogLevel) => Tinter | undefined

export const defaultLogLevelTinters: Record<string, Tinter | undefined> = {
  ERROR: chalk.bold.red,
  WARN: chalk.yellow,
  INFO: chalk.green,
  DEBUG: chalk.blue,
  VERBOSE: undefined,
}

const baseTinterResolver: TinterResolver = (level) => {
  return defaultLogLevelTinters[level.toLocaleUpperCase()]
}

const tint = (text: string, color?: Tinter): string => {
  return color ? color(text) : text
}

export interface ConsoleLogging extends LoggingListener {
}

export const createConsoleLogging = (args?: {
  logLevels?: string[],
  tinterResolver?: TinterResolver,
}): ConsoleLogging => {
  const logLevels = args?.logLevels?.map((level) => level.toLocaleUpperCase())
  const tinterResolver = args?.tinterResolver || baseTinterResolver

  return createLoggingListener({
    onLogged: async (target, { message, level, ...args }) => {
      // Check if the log level is in the specified log levels
      // If no log levels are specified, log everything
      // If logLevels is specified, only log messages with levels in that array
      if (logLevels && !logLevels.includes(level.toLocaleUpperCase())) return

      if (jsEnv.isNode) {
        const tinter = tinterResolver(level)
        message = tint(message, tinter)
      }
      if (level === "ERROR") {
        console.error(message)
      } else if (level === "WARN") {
        console.warn(message)
      } else if (level === "INFO") {
        console.info(message)
      } else if (level === "DEBUG" || level === "VERBOSE") {
        console.debug(message)
      } else {
        console.log(message)
      }
    }
  })
}

