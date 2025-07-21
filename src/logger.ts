import fs from "fs"
import { LogLevel, LogLevels, Tinter } from "./level.js"
import { v7 as uuidv7 } from "uuid"
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

export type LoggerEvent = "log"

export type LoggerEventPayload<T extends LoggerEvent> =
  T extends "log" ? (LoggerEventLogPayload) :
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
    this.id = uuidv7()
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
    const shouldLogConsole = shouldLog(level, options.consoleRequiredLevel)
    const shouldLogFile = options.logFile && shouldLog(level, options.fileRequiredLevel)
    if (!shouldLogConsole && !shouldLogFile) return
    const time = new Date()
    const messages = msgs.map(msg => formatMessage(msg, it => options.entryFormat(it)))
    const line = options.logFormat({ time, level, channel: this.channel, messages })
    const payload: LoggerEventLogPayload = {
      id: uuidv7(),
      logger: this,
      level,
      rawMessages: msgs,
      message: line,
      time,
      channel: this.channel,
    }
    this.emit("log", payload)
    this.provider.emit("log", payload)
    if (options.logFile && shouldLogFile) {
      // Write to the global log file
      fs.appendFileSync(options.logFile, `${line}\n`)
    }
    if (shouldLogConsole) {
      // Write to the console for levels higher than the minimum required level
      console.log(tint(line, level.color))
    }
  }
}

const shouldLog = (current: LogLevel, required?: LogLevel): boolean => {
  const requiredLevel = required?.level
  if (!requiredLevel) return true
  return current.level >= requiredLevel
}
const tint = (text: string, color?: Tinter): string => {
  return color ? color(text) : text
}
