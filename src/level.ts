import chalk from "chalk"
export const colors = chalk

export type Tinter = (...text: any[]) => string

export interface LogLevel {
  signal: string
  level: number
  color?: Tinter
}

export function createLogLevel(
  signal: string,
  level: number,
  color?: Tinter,
): LogLevel {
  return {
    signal,
    level,
    color,
  }
}

export function extendsLogLevel(
  parent: LogLevel,
  override: Partial<LogLevel>,
): LogLevel {
  return { ...parent, ...override }
}

export const LogLevels = {
  ERROR: createLogLevel("ERROR", 100, colors.bold.red),
  WARN: createLogLevel("WARN", 50, colors.yellow),
  INFO: createLogLevel("INFO", 20, colors.green),
  DEBUG: createLogLevel("DEBUG", 10, colors.blue),
  VERBOSE: createLogLevel("VERBOSE", 1),
}
