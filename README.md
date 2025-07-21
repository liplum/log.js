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

- [ ] Configuration
- [ ] Custom log levels
- [ ] Logger events
- [ ] Sub-level logger

### Configuration

### Custom log levels [WIP]

### Logger events [WIP]

The loggers can emit events like `log` when a log message comes out.

The Logger emits `log` event when a message is logged on it.

```js
const log = createLogger("Main")
log.on("log", (e) => {
  console.log("!Log!", e.id, e.channel, e.level.signal, e.message)
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
  console.log("!Log!", e.id, e.channel, e.level.signal, e.message)
})
const log = logProvider.createLogger("Provider")
log.info("hello, world!")
log.warn("hello, warning!")
log.error("hello, error!")
log.verbose("hello, hello, hello!")
log.debug("hello, bug!")
```

### Sub-level logger [WIP]
