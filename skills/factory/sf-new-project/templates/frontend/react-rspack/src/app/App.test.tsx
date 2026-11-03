import { expect, it } from "@rstest/core"
import { render, screen } from "@testing-library/react"

import { App } from "./App"

it("links to every registered module from the navigation", async () => {
  render(<App />)

  expect(await screen.findByRole("link", { name: "Command center" })).toBeInTheDocument()
})
