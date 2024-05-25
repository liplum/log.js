import test from 'ava'
import { createLogger, createLoggerProvider } from "./dist/index.js"

test('test logging', t => {
  const log = createLogger("Main")
  log.info("hello, world!")
  log.warn("hello, warning!")
  log.error("hello, error!")
  log.verbose("hello, hello, hello!")
  log.debug("hello, bug!")
  t.pass()
})

test('test logger provider', t => {
  const logProvider = createLoggerProvider()
  const log = logProvider.createLogger()
  log.info("hello, world!")
  log.warn("hello, warning!")
  log.error("hello, error!")
  log.verbose("hello, hello, hello!")
  log.debug("hello, bug!")
  t.pass()
})

test('test logger provider with args', t => {
  const logProvider = createLoggerProvider({
    entryFormat: () => "test",
  })
  const log = logProvider.createLogger()
  log.info("hello, world!")
  log.warn("hello, warning!")
  log.error("hello, error!")
  log.verbose("hello, hello, hello!")
  log.debug("hello, bug!")
  t.pass()
})