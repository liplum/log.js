import fs from "fs"
import path from "path"
import chalk, { type ChalkInstance } from "chalk"
import { format } from "util"
export const colors = chalk

export interface LoggerProvider {
  createLogger: (channel?: string) => Logger
}

class LoggerProviderImpl implements LoggerProvider {
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

export interface LogLevel {
  signal: string
  level: number
  color?: ChalkInstance
}

export function createLogLevel(
  signal: string,
  level: number,
  color?: ChalkInstance,
): LogLevel {
  return {
    signal,
    level,
    color,
  }
}

export function extendsLogLevel(parent: LogLevel, override: Partial<LogLevel>): LogLevel {
  return { ...parent, ...override }
}

export const LogLevels = {
  ERROR: createLogLevel("ERROR", 100, chalk.bold.red),
  WARN: createLogLevel("WARN", 50, chalk.yellow),
  INFO: createLogLevel("INFO", 20, chalk.green),
  DEBUG: createLogLevel("DEBUG", 10, chalk.blue),
  VERBOSE: createLogLevel("VERBOSE", 1),
}

const _globalProvider = new LoggerProviderImpl()

export const globalProvider: LoggerProvider = _globalProvider

export const globalOptions: {
  logFilePath?: string
  consoleOutputRequired?: LogLevel
} = {
  get logFilePath(): string | undefined {
    return _globalProvider.logFile
  },
  set logFilePath(path: string) {
    _globalProvider.logFile = path
  },
  consoleOutputRequired: undefined,
}

const generateLogFilePath = (logDir: string): string => {
  fs.mkdirSync(logDir, { recursive: true })
  return path.join(
    logDir,
    `${new Date().toISOString().slice(0, 10)}.log`
  )
}

export const initGlobalLogDir = (logDir: string): void => {
  globalOptions.logFilePath = generateLogFilePath(logDir)
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
  return new LoggerImpl(_globalProvider, channel)
}

class LoggerImpl implements Logger {
  private readonly channel?: string
  private readonly provider?: LoggerProviderImpl

  constructor(provider?: LoggerProviderImpl, channel?: string) {
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
    const globalRequiredLevel = globalOptions.consoleOutputRequired?.level
    if (!globalRequiredLevel || level.level >= globalRequiredLevel) {
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

const tint = (text: string, color?: ChalkInstance): string => {
  return color ? color(text) : text
}
