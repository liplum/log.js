export enum LogLevels {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
  VERBOSE = "VERBOSE",
}

export type LogLevel = LogLevels | keyof typeof LogLevels | string