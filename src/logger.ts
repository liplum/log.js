import fs from "fs"
import path from "path"
import { format } from "util"
import { LogLevel, LogLevels, Tinter } from "./level.js"

export interface LoggerProvider {
  createLogger: (channel?: string) => Logger
}
interface LoggerProviderOptions {
  logFile?: string
  consoleOutputRequired?: LogLevel
  logFormat: LogFormat
  entryFormat: EntryFormat
}

class LoggerProviderImpl implements LoggerProvider, LoggerProviderOptions {
  logFile?: string
  consoleOutputRequired?: LogLevel
  logFormat: LogFormat
  entryFormat: EntryFormat
  constructor({
    logFile,
    consoleOutputRequired,
    logFormat,
    entryFormat,
  }: LoggerProviderOptions
  ) {
    this.logFile = logFile
    this.consoleOutputRequired = consoleOutputRequired
    this.logFormat = logFormat
    this.entryFormat = entryFormat
  }
  createLogger = (channel?: string): Logger => {
    return new LoggerImpl(this, channel)
  }
}

const generateLogFileName = (): string => {
  return `${new Date().toISOString().slice(0, 10)}.log`
}

export const createLoggerProvider = (args?: {
  logDir?: string,
  getLogFileName: () => string,
  consoleOutputRequired?: LogLevel
  logFormat: LogFormat
  entryFormat: EntryFormat
}): LoggerProvider => {
  const {
    logDir,
    getLogFileName = generateLogFileName,
    consoleOutputRequired,
    logFormat = formatMessages,
    entryFormat = formatEntry,
  } = args ?? {}
  if (logDir) {
    fs.mkdirSync(logDir, { recursive: true })
  }
  return new LoggerProviderImpl({
    logFile: logDir ? path.join(logDir, getLogFileName()) : undefined,
    consoleOutputRequired: consoleOutputRequired,
    logFormat: logFormat,
    entryFormat: entryFormat,
  })
}
export type LazyLogging = () => any

export type LogMessage = any | LazyLogging

export interface Logger {
  error: (...msgs: LogMessage[]) => void
  warn: (...msgs: LogMessage[]) => void
  info: (...msgs: LogMessage[]) => void
  debug: (...msgs: LogMessage[]) => void
  verbose: (...msgs: LogMessage[]) => void
  log: (level: LogLevel, ...msgs: LogMessage[]) => void
}

export const createLogger = (channel?: string): Logger => {
  return new LoggerImpl(globalProvider, channel)
}

export type LogFormat = ({
  time, level, channel, messages
}: {
  time: Date,
  level: LogLevel,
  channel?: string,
  messages: string[]
}) => string

export type EntryFormat = (entry: LogMessage) => string


class LoggerImpl implements Logger {
  private readonly channel?: string
  private readonly provider: LoggerProviderOptions

  constructor(provider: LoggerProviderOptions, channel?: string) {
    this.provider = provider
    this.channel = channel
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
    const time = new Date()
    const provider = this.provider
    const messages = msgs.map(msg => provider.entryFormat(msg))
    const line = provider.logFormat({ time, level, channel: this.channel, messages })
    if (provider.logFile) {
      // Write to the global log file
      fs.appendFileSync(provider.logFile, `${line}\n`)
    }
    const consoleOutputRequired = provider.consoleOutputRequired?.level
    if (!consoleOutputRequired || level.level >= consoleOutputRequired) {
      // Write to the console for levels higher than the minimum required level
      console.log(tint(line, level.color))
    }
  }
}

const formatEntry: EntryFormat = (entry): string => {
  if (entry instanceof Error) {
    return `${entry.message} ${entry?.stack ?? ""}`
  } else if (typeof entry === "function" && entry.length == 0) {
    return formatEntry(entry())
  } else {
    return format(entry)
  }
}

const formatMessages: LogFormat = ({
  time, level, channel, messages,
}): string => {
  const timestamp = time.toISOString().slice(11, -2)
  channel = channel ? `[${channel}] ` : " "
  let line = `|${timestamp}|${level.signal}|${channel}` + messages.join(", ")
  return line
}

const tint = (text: string, color?: Tinter): string => {
  return color ? color(text) : text
}

export const globalProvider: LoggerProvider & LoggerProviderOptions = new LoggerProviderImpl({
  entryFormat: formatEntry,
  logFormat: formatMessages
})

export const globalOptions: LoggerProviderOptions = globalProvider

export const initGlobalLogDir = (
  logDir: string,
  getLogFileName: () => string = generateLogFileName,
): void => {
  fs.mkdirSync(logDir, { recursive: true })
  globalOptions.logFile = path.join(logDir, getLogFileName())
}