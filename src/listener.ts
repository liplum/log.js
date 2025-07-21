import { LoggerEventLogPayload } from "./logger"

export type LoggingTargetEventLogPayload = LoggerEventLogPayload

export type LoggingTargetEvent = "log"

export type LoggingTargetEventPayload<T extends LoggingTargetEvent> =
  T extends "log" ? (LoggingTargetEventLogPayload) :
  never

export interface LoggingTarget {
  readonly id: string

  on<T extends LoggingTargetEvent>(event: T, listener: (payload: LoggingTargetEventPayload<T>) => void): this
  off<T extends LoggingTargetEvent>(event: T, listener: (payload: LoggingTargetEventPayload<T>) => void): this
}