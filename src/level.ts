export enum LogLevels {
  FATAL = "FATAL",
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
  VERBOSE = "VERBOSE",
  TRACE = "TRACE",
}

export type LogLevel = LogLevels | keyof typeof LogLevels | string