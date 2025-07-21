import fs from "fs"
import { LogLevel, LogLevels, Tinter } from "./level.js"
import { v7 as uuidv7 } from "uuid"
import EventEmitter from "events"
import { EntryFormat, formatMessage } from "./format.js"
import { LoggerProviderOptions } from "./provider.js"

export type LazyLogging = () => any

export type LogMessage = any | LazyLogging

export type LoggerEventLogPayload = {
  id: string
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
  id: string
  channel?: string

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
  private readonly provider: LoggerProviderOptions

  constructor(provider: LoggerProviderOptions, channel?: string) {
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
    const shouldLogConsole = shouldLog(level, provider.consoleRequiredLevel)
    const shouldLogFile = provider.logFile && shouldLog(level, provider.fileRequiredLevel)
    if (!shouldLogConsole && !shouldLogFile) return
    const time = new Date()
    const messages = msgs.map(msg => formatMessage(msg, it => provider.entryFormat(it)))
    const line = provider.logFormat({ time, level, channel: this.channel, messages })
    const payload: LoggerEventLogPayload = {
      id: uuidv7(),
      level,
      rawMessages: msgs,
      message: line,
      time,
      channel: this.channel,
    }
    this.emit("log", payload)
    if (provider.logFile && shouldLogFile) {
      // Write to the global log file
      fs.appendFileSync(provider.logFile, `${line}\n`)
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
