import test from 'ava'
import { createConsoleLogging, createFileLogging, createLogger, createLoggerProvider, createLoggingListener } from "./dist/index.js"
import os from "os"
import path from 'path'
import { randomUUID } from 'crypto'

test('test logging', t => {
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
  t.pass()
})

test('test logger provider with config', t => {
  const logProvider = createLoggerProvider({
    entryFormat: () => "test",
  })
  const consoleLogging = createConsoleLogging({
    logLevels: ["INFO",]
  })
  consoleLogging.on(logProvider)
  const log = logProvider.createLogger("Provider+Args")
  log.info("hello, world!")
  log.warn("hello, warning!")
  log.error("hello, error!")
  log.verbose("hello, hello, hello!")
  log.debug("hello, bug!")
  consoleLogging.off(logProvider)
  t.pass()
})

test('test logger events', t => {
  const log = createLogger("Main")
  log.on("log", (e) => {
    console.log("!Log!", e.id, e.channel, e.level, e.rawMessages)
  })
  log.info("hello, world!")
  log.warn("hello, warning!")
  log.error("hello, error!")
  log.verbose("hello, hello, hello!")
  log.debug("hello, bug!")
  t.pass()
})

test('test logger provider events', t => {
  const logProvider = createLoggerProvider()
  logProvider.on("logger-created", (e) => {
    console.log("!Logger Created!", e.id, e.channel)
  })
  logProvider.on("log", (e) => {
    console.log("!Log!", e.id, e.channel, e.level, e.rawMessages)
  })
  const log = logProvider.createLogger("Provider")
  log.info("hello, world!")
  log.warn("hello, warning!")
  log.error("hello, error!")
  log.verbose("hello, hello, hello!")
  log.debug("hello, bug!")
  t.pass()
})

test('test global logging', t => {
  const logA = createLogger("GlobalA")
  const logB = createLogger("GlobalB")
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
  t.pass()
})

test('custom logging listener', t => {
  const messages = []
  const listener = createLoggingListener({
    onLogged: (target, { channel, level, rawMessages }) => {
      messages.push({ channel, level, rawMessages })
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
  t.pass()
})

test("file logging ", t => {
  const logDir = path.join(os.tmpdir(), randomUUID())
  const fileLogging = createFileLogging({
    logLevels: ["INFO", "WARN", "ERROR"],
    logDir,
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
  console.log(`Log directory: ${logDir}`)
  t.pass()
})