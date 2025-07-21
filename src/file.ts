import fs from "fs"
import { LoggingTarget, LoggingTargetEventLogPayload } from "./listener.js"
import path from "path"
import { Logger } from "./logger.js"
import { LogLevel } from "./level.js"

export interface FileLogging {
  on: (target: LoggingTarget) => void
  off: (target: LoggingTarget) => void
}

const generateDefaultLogFileName = (): string => {
  return `${new Date().toISOString().slice(0, 10)}.log`
}

export const createFileLogging = (args: {
  logLevels?: string[],
  logDir: string,
  resolveLogFileName?: (args: {
    id: string
    logger: Logger
    level: LogLevel
    time: Date
    channel?: string
  }) => string,
}): FileLogging => {
  const logLevels = args?.logLevels?.map((level) => level.toLocaleUpperCase())
  const {
    logDir,
    resolveLogFileName = generateDefaultLogFileName
  } = args

  const id2Listener = new Map<string, (payload: LoggingTargetEventLogPayload) => void>()
  return {
    on: (target: LoggingTarget): void => {
      const listener = async ({ message, level, ...args }: LoggingTargetEventLogPayload) => {
        // Check if the log level is in the specified log levels
        // If no log levels are specified, log everything
        // If logLevels is specified, only log messages with levels in that array
        if (logLevels && !logLevels.includes(level.signal)) return

        await fs.promises.mkdir(logDir, { recursive: true })

        const logFile = path.join(logDir, resolveLogFileName({
          id: target.id,
          logger: args.logger,
          level,
          time: new Date(),
          channel: args.channel,
        }))

        // Write to the global log file
        await fs.promises.appendFile(logFile, `${message}\n`)
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
