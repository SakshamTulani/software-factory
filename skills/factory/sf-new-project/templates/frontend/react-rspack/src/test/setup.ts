import { afterAll, afterEach, beforeAll, expect } from "@rstest/core"
import * as jestDomMatchers from "@testing-library/jest-dom/matchers"
import { cleanup } from "@testing-library/react"

import { server } from "./server"

expect.extend(jestDomMatchers)

beforeAll(() => server.listen({ onUnhandledFrame: "error" }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => server.close())
