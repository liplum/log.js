import { EventEmitter } from "stream"
import { LoggerEventLogPayload } from "./logger"

export type LoggingTargetEventPayload = LoggerEventLogPayload

export interface LoggingTarget extends EventEmitter {
  readonly id: string
}

export interface LogListener {
  on: (target: LoggingTarget) => void
  off: (target: LoggingTarget) => void
}

export const createLogListener = ({
  onLogged,
}: {
  onLogged: (payload: LoggingTargetEventPayload) => Promise<void> | void
}): LogListener => {
  const id2Listener = new Map<string, (payload: LoggingTargetEventPayload) => void>()
  return {
    on: (target: LoggingTarget): void => {
      const listener = async (payload: LoggingTargetEventPayload) => {
        await onLogged(payload)
      }
      id2Listener.set(target.id, listener)
      target.on("log", listener)
    },
    off: (target: LoggingTarget): void => {
      const listener = id2Listener.get(target.id)
      if (listener) {
        target.off("log", listener)
      }
      id2Listener.delete(target.id)
    }
  }
}
