import test from 'ava'
import { createLogger } from "./dist/index.js"

test('test logging', t => {
  const log = createLogger("Main")
  log.info("hello, world!")
  log.warn("hello, warning!")
  log.error("hello, error!")
  log.verbose("hello, hello, hello!")
  log.debug("hello, bug!")
  t.pass()
})
