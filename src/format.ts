import { format } from "util"
import { LogLevel } from "./level.js"
import { LogMessage } from "./logger.js"

export type LogFormat = ({
  time, level, channel, messages
}: {
  time: Date,
  level: LogLevel,
  channel?: string,
  messages: string[]
}) => string

export type EntryFormat = (entry: LogMessage) => string

export const formatEntry: EntryFormat = (entry): string => {
  if (entry instanceof Error) {
    return `${entry.message} ${entry?.stack ?? ""}`
  } else if (typeof entry === "function" && entry.length == 0) {
    return formatEntry(entry())
  } else {
    return format(entry)
  }
}

export const formatMessage = (entry: any, formatter: EntryFormat): string => {
  if (entry instanceof AggregateError) {
    return `${entry.message} ${entry.stack ?? ""}\n AggregatedErrors: ${entry.errors.map(it => formatter(it)).join("\n")}`
  } else {
    return formatter(entry)
  }
}

export const formatMessages: LogFormat = ({
  time, level, channel, messages,
}): string => {
  const timestamp = time.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 2, // Milliseconds (2 digits)
    hour12: false, // Use 24-hour format
  })
  const channelRaw = channel ? `[${channel}]` : ""
  const line = `|${timestamp}|${level}|${channelRaw}` + " " + messages.join(" ")
  return line
}
