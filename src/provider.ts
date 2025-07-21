import EventEmitter from "events"
import { LogFormat, EntryFormat, formatEntry, formatMessages } from "./format.js"
import { Logger, LoggerEventLogPayload, LoggerImpl } from "./logger.js"

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
  readonly id: string
  readonly options: LoggerProviderOptions

  createLogger: (channel?: string) => Logger

  on<T extends LoggerProviderEvent>(event: T, listener: (payload: LoggerProviderEventPayload<T>) => void): this
  off<T extends LoggerProviderEvent>(event: T, listener: (payload: LoggerProviderEventPayload<T>) => void): this
  emit<T extends LoggerProviderEvent>(event: T, payload: LoggerProviderEventPayload<T>): boolean
}

export interface LoggerProviderOptions {
  logFormat: LogFormat
  entryFormat: EntryFormat
}

export class LoggerProviderImpl extends EventEmitter implements LoggerProvider {
  readonly id: string
  readonly options: LoggerProviderOptions

  constructor(options: LoggerProviderOptions) {
    super()
    this.id = crypto.randomUUID()
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
  logFormat?: LogFormat
  entryFormat?: EntryFormat
}): LoggerProvider => {
  const {
    logFormat = formatMessages,
    entryFormat = formatEntry,
  } = args ?? {}
  return new LoggerProviderImpl({
    logFormat,
    entryFormat,
  })
}