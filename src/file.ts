import fs from "fs"
import { createLoggingListener, LoggingTarget, LoggingTargetEventPayload, LoggingListener, } from "./listener.js"
import path from "path"
import { Logger } from "./logger.js"
import { LogLevel } from "./level.js"

export interface FileLogging extends LoggingListener {
}

export type LogFileNameResolver = (args: {
  id: string
  logger: Logger
  level: LogLevel
  time: Date
  channel?: string
}) => string | Promise<string>

export type LogDirResolver = (args: {
  id: string
  logger: Logger
  level: LogLevel
  time: Date
  channel?: string
}) => string | Promise<string>

/**
 * Generates a default log file name based on the current date.
 * The format is `YYYY-MM-DD.log`, which creates a new log file for each day.
 * For example, if today is October 1, 2023, the log file name will be `2023-10-01.log`.
 * This function is used to create a new log file for each day, ensuring that logs are organized by date.
 */
const generateDefaultLogFileName: LogFileNameResolver = () => {
  return `${new Date().toISOString().slice(0, 10)}.log`
}

/**
 * @param logLevels an array of log levels to filter logs. If not provided, all log levels will be logged.
 * @param logDir the directory where log files will be stored. It will be created recursively, if it does not exist.
 * @param resolveLogFileName by default, it generates a log file name based on the current date. You can provide a custom function to resolve the log file name. If a string is provided, it will be used as the log file name directly.
 * @returns 
 */
export const createFileLogging = (args: {
  logLevels?: string[],
  logDir: LogDirResolver | string,
  resolveLogFileName?: LogFileNameResolver | string,
}): FileLogging => {

  const logLevels = args?.logLevels?.map((level) => level.toLocaleUpperCase())
  const {
    logDir,
    resolveLogFileName = generateDefaultLogFileName
  } = args

  return createLoggingListener({
    onLogged: async (target, { message, level, ...args }) => {
      // Check if the log level is in the specified log levels
      // If no log levels are specified, log everything
      // If logLevels is specified, only log messages with levels in that array
      if (logLevels && !logLevels.includes(level)) return
      const actualLogDir = typeof logDir === "string"
        ? logDir
        : await logDir({
          id: target.id,
          logger: args.logger,
          level,
          time: args.time,
          channel: args.channel,
        })

      await fs.promises.mkdir(actualLogDir, { recursive: true })

      const fileName = typeof resolveLogFileName === "string"
        ? resolveLogFileName
        : await resolveLogFileName({
          id: target.id,
          logger: args.logger,
          level,
          time: args.time,
          channel: args.channel,
        })

      const logFile = path.join(actualLogDir, fileName)

      // Write to the global log file
      await fs.promises.appendFile(logFile, `${message}\n`, {
        encoding: "utf-8",
      })
    }
  })
}