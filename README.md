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
- [ ] Log events
- [ ] Sub-level logger

### Configuration

### Custom log levels [WIP]

### Log events [WIP]

The loggers can emit events like `log` when a log message comes out.

### Sub-level logger [WIP]
