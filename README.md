# @liplum/log

## Installation

Install this package.

```bash
npm i @liplum/log
```

## Getting started

```js
import { createLogger } from "@liplum/log"

const log = createLogger("Main")

log.info("hello, world!")
log.warn("hello, warning!")
log.error("hello, error!")
log.verbose("hello, hello, hello!")
log.debug("hello, bug!")
```

## Features

- [x] Configuration
- [x] Custom log levels
- [x] Logger events
- [x] Logging to console and file
- [ ] Sub-level logger

### Custom log levels

You can define your own log levels in a string.

### Logging to console and file

The log messages can be output into console and file with logger level filter.

You can create a console logger with `createConsoleLogging` function.

```js
const log = createLogger("Main")
const consoleLogging = createConsoleLogging({
  logLevels: ["INFO", "WARN", "ERROR"]
})
consoleLogging.on(log)
log.info("hello, world!")
log.warn("hello, warning!")
log.error("hello, error!")
log.verbose("hello, hello, hello!")
log.debug("hello, bug!")
consoleLogging.off(log)
```

You can also create a log provider with `createLoggerProvider` function, which can manage multiple loggers.

```js
const logProvider = createLoggerProvider()
const consoleLogging = createConsoleLogging({
  logLevels: ["INFO", "WARN", "ERROR"]
})
consoleLogging.on(logProvider)
const logA = logProvider.createLogger("ProviderA")
const logB = logProvider.createLogger("ProviderB")
logA.info("hello, world!")
logA.warn("hello, warning!")
logA.error("hello, error!")
logA.verbose("hello, hello, hello!")
logA.debug("hello, bug!")

logB.info("hello, world!")
logB.warn("hello, warning!")
logB.error("hello, error!")
logB.verbose("hello, hello, hello!")
logB.debug("hello, bug!")
consoleLogging.off(logProvider)
```

Logging into local file.

```js
const fileLogging = createFileLogging({
  logLevels: ["INFO", "WARN", "ERROR"],
  logDir: path.join(os.tmpdir(), randomUUID()),
  filePath: "./test.log",
})
const log = createLogger("FileLogger")
fileLogging.on(log)
log.info("hello, world!")
log.warn("hello, warning!")
log.error("hello, error!")
log.verbose("hello, hello, hello!")
log.debug("hello, bug!")
fileLogging.off(log)
```

### Logger events

The loggers can emit events like `log` when a log message comes out.

The Logger emits `log` event when a message is logged on it.

```js
const log = createLogger("Main")
log.on("log", (e) => {
  console.log("!Log!", e.id, e.channel, e.level, e.message)
})
log.info("hello, world!")
log.warn("hello, warning!")
log.error("hello, error!")
log.verbose("hello, hello, hello!")
log.debug("hello, bug!")
```

The LogProvider emits `logger-created` when a logger is created from it, and `log` when its loggers emit a log message.

```js
const logProvider = createLoggerProvider()
logProvider.on("logger-created", (e) => {
  console.log("!Logger Created!", e.id, e.channel)
})
logProvider.on("log", (e) => {
  console.log("!Log!", e.id, e.channel, e.level, e.message)
})
const log = logProvider.createLogger("Provider")
log.info("hello, world!")
log.warn("hello, warning!")
log.error("hello, error!")
log.verbose("hello, hello, hello!")
log.debug("hello, bug!")
```

You can create your own LoggingListener.

```js
const messages = []
const listener = createLoggingListener({
  onLogged: (target,{channel,level,message}) => {
    messages.push({ channel, level, message })
  },
})
const log = createLogger("Main")
listener.on(log)
log.info("hello, world!")
log.warn("hello, warning!")
log.error("hello, error!")
log.verbose("hello, hello, hello!")
log.debug("hello, bug!")
listener.off(log)
console.log("Logged Messages:", messages)
```
