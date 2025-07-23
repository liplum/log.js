import { EventEmitter } from "stream"
import { LoggerEventLogPayload } from "./logger"

export type LoggingTargetEventPayload = LoggerEventLogPayload

export interface LoggingTarget extends EventEmitter {
  readonly id: string
}