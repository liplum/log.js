import fs from "fs"
import path from "path"
import { format } from "util"
import { LogLevel, LogLevels, Tinter } from "./level"

export interface LoggerProvider {
  createLogger: (channel?: string) => Logger
}

interface LoggerProviderOptions {
  logFile?: string
  consoleOutputRequired?: LogLevel
}

class LoggerProviderImpl implements LoggerProvider, LoggerProviderOptions {
  logFile?: string
  consoleOutputRequired?: LogLevel
  constructor(logFile?: string, consoleOutputRequired?: LogLevel) {
    this.logFile = logFile
    this.consoleOutputRequired = consoleOutputRequired
  }
  createLogger = (channel?: string): Logger => {
    return new LoggerImpl(this, channel)
  }
}

const generateLogFilePath = (logDir: string): string => {
  fs.mkdirSync(logDir, { recursive: true })
  return path.join(
    logDir,
    `${new Date().toISOString().slice(0, 10)}.log`
  )
}


export const createLoggerProvider = (logDir: string): LoggerProvider => {
  return new LoggerProviderImpl(generateLogFilePath(logDir))
}

export interface Logger {
  error: (...msgs: any[]) => void
  warn: (...msgs: any[]) => void
  info: (...msgs: any[]) => void
  debug: (...msgs: any[]) => void
  verbose: (...msgs: any[]) => void
  log: (level: LogLevel, ...msgs: any[]) => void
}

export const createLogger = (channel?: string): Logger => {
  return new LoggerImpl(globalProvider, channel)
}

class LoggerImpl implements Logger {
  private readonly channel?: string
  private readonly provider?: LoggerProviderOptions

  constructor(provider?: LoggerProviderOptions, channel?: string) {
    this.provider = provider
    this.channel = channel
  }

  error = (...msgs: any[]): void => {
    this.log(LogLevels.ERROR, ...msgs)
  }

  warn = (...msgs: any[]): void => {
    this.log(LogLevels.WARN, ...msgs)
  }

  info = (...msgs: any[]): void => {
    this.log(LogLevels.INFO, ...msgs)
  }

  debug = (...msgs: any[]): void => {
    this.log(LogLevels.DEBUG, ...msgs)
  }

  verbose = (...msgs: any[]): void => {
    this.log(LogLevels.VERBOSE, ...msgs)
  }

  log = (level: LogLevel, ...msgs: any[]): void => {
    const timestamp = new Date().toISOString().slice(11, -2)
    const channel = this.channel ? `[${this.channel}] ` : " "
    let logLine = `|${timestamp}|${level.signal}|${channel}`

    for (const entry of msgs) {
      logLine = appendLogEntry(logLine, entry)
    }
    const provider = this.provider
    if (provider?.logFile) {
      // Write to the global log file
      fs.appendFileSync(provider.logFile, `${logLine}\n`)
    }
    const consoleOutputRequired = provider?.consoleOutputRequired?.level
    if (!consoleOutputRequired || level.level >= consoleOutputRequired) {
      // Write to the console for levels higher than the minimum required level
      console.log(tint(logLine, level.color))
    }
  }
}

const appendLogEntry = (origin: string, entry: any): string => {
  if (entry instanceof Error) {
    origin += `${entry.message} ${entry?.stack ?? ""}`
  } else {
    origin += format(entry)
  }
  return origin
}

const tint = (text: string, color?: Tinter): string => {
  return color ? color(text) : text
}

export const globalProvider: LoggerProvider & LoggerProviderOptions = new LoggerProviderImpl()

export const globalOptions: LoggerProviderOptions = globalProvider

export const initGlobalLogDir = (logDir: string): void => {
  globalOptions.logFile = generateLogFilePath(logDir)
}