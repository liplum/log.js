import fs from "fs"
import { createLogListener, LoggingTarget, LoggingTargetEventPayload, LogListener, } from "./listener.js"
import path from "path"
import { Logger } from "./logger.js"
import { LogLevel } from "./level.js"

export interface FileLogging extends LogListener {
}

export type LogFileNameResolver = (args: {
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

export const createFileLogging = (args: {
  logLevels?: string[],
  logDir: string,
  resolveLogFileName?: LogFileNameResolver,
}): FileLogging => {

  const logLevels = args?.logLevels?.map((level) => level.toLocaleUpperCase())
  const {
    logDir,
    resolveLogFileName = generateDefaultLogFileName
  } = args

  return createLogListener({
    onLogged: async (target, { message, level, ...args }) => {
      // Check if the log level is in the specified log levels
      // If no log levels are specified, log everything
      // If logLevels is specified, only log messages with levels in that array
      if (logLevels && !logLevels.includes(level)) return

      await fs.promises.mkdir(logDir, { recursive: true })

      const fileName = await resolveLogFileName({
        id: target.id,
        logger: args.logger,
        level,
        time: new Date(),
        channel: args.channel,
      })

      const logFile = path.join(logDir, fileName)

      // Write to the global log file
      await fs.promises.appendFile(logFile, `${message}\n`)
    }
  })
}