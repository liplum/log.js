import EventEmitter from "events"
import { LogFormat, EntryFormat, formatEntry, formatMessages } from "./format.js"
import { LogLevel } from "./level.js"
import { Logger, LoggerEvent, LoggerImpl } from "./logger.js"
import fs from "fs"
import path from "path"

export type LoggerProviderEventLoggerCreatedPayload = {
  id: string
  level: LogLevel
  logger: Logger
  channel?: string
  time: Date
}

export type LoggerProviderEvent = "logger-created"

export type LoggerProviderEventPayload<T extends LoggerEvent> =
  T extends "logger-created" ? (LoggerProviderEventLoggerCreatedPayload) :
  never


export interface LoggerProvider {
  createLogger: (channel?: string) => Logger
}

export interface LoggerProviderOptions {
  logFile?: string
  consoleRequiredLevel?: LogLevel
  fileRequiredLevel?: LogLevel
  logFormat: LogFormat
  entryFormat: EntryFormat
}

export class LoggerProviderImpl extends EventEmitter implements LoggerProvider, LoggerProviderOptions {
  logFile?: string
  consoleRequiredLevel?: LogLevel
  fileRequiredLevel?: LogLevel
  logFormat: LogFormat
  entryFormat: EntryFormat
  constructor({
    logFile,
    consoleRequiredLevel,
    fileRequiredLevel,
    logFormat,
    entryFormat,
  }: LoggerProviderOptions
  ) {
    super()
    this.logFile = logFile
    this.consoleRequiredLevel = consoleRequiredLevel
    this.fileRequiredLevel = fileRequiredLevel
    this.logFormat = logFormat
    this.entryFormat = entryFormat
  }
  createLogger = (channel?: string): Logger => {
    return new LoggerImpl(this, channel)
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