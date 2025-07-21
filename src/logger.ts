import { LogLevel, LogLevels } from "./level.js"
import EventEmitter from "events"
import { EntryFormat, formatMessage } from "./format.js"
import { LoggerProvider } from "./provider.js"

export type LazyLogging = () => any

export type LogMessage = any | LazyLogging

export type LoggerEventLogPayload = {
  id: string
  logger: Logger
  level: LogLevel
  rawMessages: LogMessage[]
  message: string
  time: Date
  channel?: string
}

export type LoggerEvent = "close" | "log"

export type LoggerEventPayload<T extends LoggerEvent> =
  T extends "log" ? (LoggerEventLogPayload) :
  T extends "close" ? (void) :
  never

export interface Logger extends EventEmitter {
  readonly id: string
  readonly channel?: string

  error: (...msgs: LogMessage[]) => void
  warn: (...msgs: LogMessage[]) => void
  info: (...msgs: LogMessage[]) => void
  debug: (...msgs: LogMessage[]) => void
  verbose: (...msgs: LogMessage[]) => void
  log: (level: LogLevel, ...msgs: LogMessage[]) => void

  close: () => void

  on<T extends LoggerEvent>(event: T, listener: (payload: LoggerEventPayload<T>) => void): this
  off<T extends LoggerEvent>(event: T, listener: (payload: LoggerEventPayload<T>) => void): this
  emit<T extends LoggerEvent>(event: T, payload: LoggerEventPayload<T>): boolean
}

export class LoggerImpl extends EventEmitter implements Logger {
  readonly id: string
  readonly channel?: string
  private readonly provider: LoggerProvider

  constructor(provider: LoggerProvider, channel?: string) {
    super()
    this.provider = provider
    this.channel = channel
    this.id = crypto.randomUUID()
  }

  error = (...msgs: LogMessage[]): void => {
    this.log(LogLevels.ERROR, ...msgs)
  }

  warn = (...msgs: LogMessage[]): void => {
    this.log(LogLevels.WARN, ...msgs)
  }

  info = (...msgs: LogMessage[]): void => {
    this.log(LogLevels.INFO, ...msgs)
  }

  debug = (...msgs: LogMessage[]): void => {
    this.log(LogLevels.DEBUG, ...msgs)
  }

  verbose = (...msgs: LogMessage[]): void => {
    this.log(LogLevels.VERBOSE, ...msgs)
  }

  log = (level: LogLevel, ...msgs: LogMessage[]): void => {
    const provider = this.provider
    const options = provider.options
    const time = new Date()
    const messages = msgs.map(msg => formatMessage(msg, it => options.entryFormat(it)))
    const line = options.logFormat({ time, level, channel: this.channel, messages })
    const payload: LoggerEventLogPayload = {
      id: crypto.randomUUID(),
      logger: this,
      level,
      rawMessages: msgs,
      message: line,
      time,
      channel: this.channel,
    }
    this.emit("log", payload)
    this.provider.emit("log", payload)
  }

  close = () => {
    this.emit("close")
  }
}
