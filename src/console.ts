import { Tinter } from "./level.js"
import { LoggerEventLogPayload } from "./logger.js"

export type LoggingTargetEventLogPayload = LoggerEventLogPayload

export type LoggingTargetEvent = "log"

export type LoggingTargetEventPayload<T extends LoggingTargetEvent> =
  T extends "log" ? (LoggingTargetEventLogPayload) :
  never

export interface LoggingTarget {
  readonly id: string

  on<T extends LoggingTargetEvent>(event: T, listener: (payload: LoggingTargetEventPayload<T>) => void): this
  off<T extends LoggingTargetEvent>(event: T, listener: (payload: LoggingTargetEventPayload<T>) => void): this
}

export interface ConsoleLogging {
  on: (target: LoggingTarget) => void
  off: (target: LoggingTarget) => void
}

export const createConsoleLogging = (args?: {
  logLevels: string[],
}): ConsoleLogging => {
  const logLevels = args?.logLevels.map((level) => level.toLocaleUpperCase())

  const id2Listener = new Map<string, (payload: LoggingTargetEventLogPayload) => void>()
  return {
    on: (target: LoggingTarget): void => {
      const listener = ({ message, level }: LoggingTargetEventLogPayload) => {
        // Check if the log level is in the specified log levels
        // If no log levels are specified, log everything
        // If logLevels is specified, only log messages with levels in that array
        if (logLevels && !logLevels.includes(level.signal)) return

        console.log(tint(message, level.color))
      }
      id2Listener.set(target.id, listener)
      target.on("log", listener)
    },
    off: (target: LoggingTarget): void => {
      const listener = id2Listener.get(target.id)
      if (listener) {
        target.off("log", listener)
      }
    }
  }
}

const tint = (text: string, color?: Tinter): string => {
  return color ? color(text) : text
}
