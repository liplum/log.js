import test from 'ava'
import { LogLevels, createLogger, createLoggerProvider } from "./dist/index.js"

test('test logging', t => {
  const log = createLogger("Main")
  log.info("hello, world!")
  log.warn("hello, warning!")
  log.error("hello, error!")
  log.verbose("hello, hello, hello!")
  log.debug("hello, bug!")
  t.pass()
})

test('test errors', t => {
  const log = createLogger("Error")
  log.error(new Error("Something was wrong"))
  log.error(new AggregateError([
    new Error("Error 1"),
    new Error("Error 2"),
  ]))
  t.pass()
})

test('test logger provider', t => {
  const logProvider = createLoggerProvider()
  const log = logProvider.createLogger("Provider")
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
    consoleRequiredLevel: LogLevels.INFO,
  })
  const log = logProvider.createLogger("Provider+Args")
  log.info("hello, world!")
  log.warn("hello, warning!")
  log.error("hello, error!")
  log.verbose("hello, hello, hello!")
  log.debug("hello, bug!")
  t.pass()
})
