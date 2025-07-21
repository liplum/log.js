import { LogLevel } from "./level.js"
import { LoggingTarget, LoggingTargetEventPayload } from "./listener.js"
import chalk from "chalk"

export type Tinter = (...text: any[]) => string

export type TinterResolver = (level: LogLevel) => Tinter | undefined

export const LogLevels = {
  ERROR: chalk.bold.red,
  WARN: chalk.yellow,
  INFO: chalk.green,
  DEBUG: chalk.blue,
  VERBOSE: undefined,
}

const baseTinterResolver: TinterResolver = (level) => {
  return LogLevels[level.toLocaleUpperCase()]
}

export interface ConsoleLogging {
  on: (target: LoggingTarget) => void
  off: (target: LoggingTarget) => void
}

export const createConsoleLogging = (args?: {
  logLevels?: string[],
  tinterResolver?: TinterResolver,
}): ConsoleLogging => {
  const logLevels = args?.logLevels?.map((level) => level.toLocaleUpperCase())
  const tinterResolver = args?.tinterResolver || baseTinterResolver

  const id2Listener = new Map<string, (payload: LoggingTargetEventPayload) => void>()
  return {
    on: (target: LoggingTarget): void => {
      const listener = ({ message, level }: LoggingTargetEventPayload) => {
        // Check if the log level is in the specified log levels
        // If no log levels are specified, log everything
        // If logLevels is specified, only log messages with levels in that array
        if (logLevels && !logLevels.includes(level.toLocaleUpperCase())) return

        const tinter = tinterResolver(level)
        console.log(tint(message, tinter))
      }
      id2Listener.set(target.id, listener)
      target.on("log", listener)
    },
    off: (target: LoggingTarget): void => {
      const listener = id2Listener.get(target.id)
      if (listener) {
        target.off("log", listener)
      }
      id2Listener.delete(target.id)
    }
  }
}

const tint = (text: string, color?: Tinter): string => {
  return color ? color(text) : text
}
