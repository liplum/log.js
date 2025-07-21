import EventEmitter from "events"
import { LogFormat, EntryFormat, formatEntry, formatMessages } from "./format.js"
import { LogLevel } from "./level.js"
import { Logger, LoggerEventLogPayload, LoggerImpl } from "./logger.js"
import fs from "fs"
import path from "path"

export type LoggerProviderEventLoggerCreatedPayload = {
  id: string
  logger: Logger
  channel?: string
  time: Date
}

export type LoggerProviderEventLogPayload = LoggerEventLogPayload

export type LoggerProviderEvent = "logger-created" | "log"

export type LoggerProviderEventPayload<T extends LoggerProviderEvent> =
  T extends "logger-created" ? (LoggerProviderEventLoggerCreatedPayload) :
  T extends "log" ? (LoggerProviderEventLogPayload) :
  never

export interface LoggerProvider extends EventEmitter {
  readonly options: LoggerProviderOptions

  createLogger: (channel?: string) => Logger

  on<T extends LoggerProviderEvent>(event: T, listener: (payload: LoggerProviderEventPayload<T>) => void): this
  off<T extends LoggerProviderEvent>(event: T, listener: (payload: LoggerProviderEventPayload<T>) => void): this
  emit<T extends LoggerProviderEvent>(event: T, payload: LoggerProviderEventPayload<T>): boolean
}

export interface LoggerProviderOptions {
  logFile?: string
  consoleRequiredLevel?: LogLevel
  fileRequiredLevel?: LogLevel
  logFormat: LogFormat
  entryFormat: EntryFormat
}

export class LoggerProviderImpl extends EventEmitter implements LoggerProvider {
  readonly options: LoggerProviderOptions

  constructor(options: LoggerProviderOptions) {
    super()
    this.options = options
  }
  createLogger = (channel?: string): Logger => {
    const logger = new LoggerImpl(this, channel)
    this.emit("logger-created", {
      id: logger.id,
      logger,
      channel,
      time: new Date(),
    })
    return logger
  }
}

export const generateLogFileName = (): string => {
  return `${new Date().toISOString().slice(0, 10)}.log`
}

export const createLoggerProvider = (args?: {
  logDir?: string,
  getLogFileName?: () => string,
  consoleRequiredLevel?: LogLevel
  fileRequiredLevel?: LogLevel
  logFormat?: LogFormat
  entryFormat?: EntryFormat
}): LoggerProvider => {
  const {
    logDir,
    getLogFileName = generateLogFileName,
    consoleRequiredLevel,
    fileRequiredLevel,
    logFormat = formatMessages,
    entryFormat = formatEntry,
  } = args ?? {}
  if (logDir) {
    fs.mkdirSync(logDir, { recursive: true })
  }
  return new LoggerProviderImpl({
    logFile: logDir ? path.join(logDir, getLogFileName()) : undefined,
    consoleRequiredLevel,
    fileRequiredLevel,
    logFormat,
    entryFormat,
  })
}