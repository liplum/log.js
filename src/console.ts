import { LoggingTarget, LoggingTargetEventPayload } from "./listener.js"

export interface ConsoleLogging {
  on: (target: LoggingTarget) => void
  off: (target: LoggingTarget) => void
}

export const createConsoleLogging = (args?: {
  logLevels?: string[],
}): ConsoleLogging => {
  // uppercase all log levels for consistency
  const logLevels = args?.logLevels?.map((level) => level.toLocaleUpperCase())

  const id2Listener = new Map<string, (payload: LoggingTargetEventPayload) => void>()
  return {
    on: (target: LoggingTarget): void => {
      const listener = ({ message, level }: LoggingTargetEventPayload) => {
        // Check if the log level is in the specified log levels
        // If no log levels are specified, log everything
        // If logLevels is specified, only log messages with levels in that array
        if (logLevels && !logLevels.includes(level.toLocaleUpperCase())) return

        if (level === "ERROR") {
          console.error(message)
        } else if (level === "WARN") {
          console.warn(message)
        } else if (level === "INFO") {
          console.info(message)
        } else if (level === "DEBUG") {
          console.debug(message)
        } else if (level === "VERBOSE") {
          console.debug(message)
        } else {
          console.log(message)
        }
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
