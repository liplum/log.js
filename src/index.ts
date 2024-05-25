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
  constructor(logFile?: string) {
    this.logFile = logFile
  }
  createLogger(channel?: string): Logger {
    return new LoggerImpl(channel, this.logFile)
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


const _globalLoggerProvider = new LoggerProviderImpl()

export const globalLoggerProvider: LoggerProvider = _globalLoggerProvider

export const globalOptions: {
  logFilePath?: string
  consoleOutputRequired?: LogLevel
} = {
  get logFilePath(): string | undefined {
    return _globalLoggerProvider.logFile
  },
  set logFilePath(path: string) {
    _globalLoggerProvider.logFile = path
  },
  consoleOutputRequired: undefined,
}

const generateLogFilePath = (logDir:string):string=>{
  fs.mkdirSync(logDir, { recursive: true })
  return path.join(
    logDir,
    `${new Date().toISOString().slice(0, 10)}.log`
  )
}

export function initGlobalLogDir(logDir: string): void {
  globalOptions.logFilePath = generateLogFilePath(logDir)
}

export const createLoggerProvider = (logDir: string): LoggerProvider => {
  return new LoggerProviderImpl(generateLogFilePath(logDir))
}

export interface Logger {
  error(...msgs: any[]): void
  warn(...msgs: any[]): void
  info(...msgs: any[]): void
  debug(...msgs: any[]): void
  verbose(...msgs: any[]): void
  log(level: LogLevel, ...msgs: any[]): void
}

export function createLogger(channel?: string, logFile?: string): Logger {
  return new LoggerImpl(channel, logFile)
}

class LoggerImpl implements Logger {
  logFile?: string
  private readonly channel?: string

  constructor(channel?: string, logFile?: string) {
    this.channel = channel
    this.logFile = logFile
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

    if (this.logFile) {
      // Write to the global log file
      fs.appendFileSync(this.logFile, logLine)
      fs.appendFileSync(this.logFile, "\n")
    }
    const globalRequiredLevel = globalOptions.consoleOutputRequired?.level
    if (!globalRequiredLevel || level.level >= globalRequiredLevel) {
      // Write to the console for levels higher than the minimum required level
      console.log(tint(logLine, level.color))
    }
  }
}

function appendLogEntry(origin: string, entry: any): string {
  if (entry instanceof Error) {
    origin += `${entry.message} ${entry?.stack ?? ""}`
  } else {
    origin += format(entry)
  }
  return origin
}

function tint(text: string, color?: ChalkInstance): string {
  return color ? color(text) : text
}
