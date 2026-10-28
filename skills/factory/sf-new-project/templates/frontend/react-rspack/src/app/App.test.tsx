import { expect, it } from "@rstest/core"
import { render, screen } from "@testing-library/react"

import { App } from "./App"

it("shows the empty state while no module is registered", async () => {
  render(<App />)

  expect(await screen.findByText(/No modules yet/)).toBeInTheDocument()
})
