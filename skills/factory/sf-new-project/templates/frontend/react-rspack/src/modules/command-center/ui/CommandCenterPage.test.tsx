import { describe, expect, it } from "@rstest/core"
import { screen, waitFor } from "@testing-library/react"
import { HttpResponse, http } from "msw"

import { buildApiFleet, buildApiVehicleLive } from "@/data/vehicles/testing"
import { renderWithProviders } from "@/test/render"
import { apiUrl, server } from "@/test/server"

import { CommandCenterPage } from "./CommandCenterPage"

function serveFleets() {
  server.use(
    http.get(apiUrl("/fleets"), () =>
      HttpResponse.json([
        buildApiFleet({ fleetid: "f1", fleetname: "North depot" }),
        buildApiFleet({ fleetid: "f2", fleetname: "South depot" }),
      ])
    ),
    http.post(apiUrl("/vehicles/liveinfo"), async ({ request }) => {
      const { fleetid } = (await request.json()) as { fleetid: string }
      const vehicleid = fleetid === "f1" ? "north-1" : "south-1"
      return HttpResponse.json([buildApiVehicleLive({ vehicleid })])
    })
  )
}

describe("CommandCenterPage", () => {
  it("asks for a fleet when none is selected", async () => {
    serveFleets()
    renderWithProviders(<CommandCenterPage />)

    expect(await screen.findByText("Choose a fleet to see its vehicles.")).toBeInTheDocument()
  })

  it("shows the other fleet's vehicles after the user switches fleet", async () => {
    serveFleets()
    const { user, state } = renderWithProviders(<CommandCenterPage />, {
      appState: { fleetId: "f1" },
    })
    expect(await screen.findByRole("link", { name: "north-1" })).toBeInTheDocument()

    await user.click(await screen.findByRole("button", { name: "North depot" }))
    await user.click(screen.getByRole("button", { name: "South depot" }))

    expect(await screen.findByRole("link", { name: "south-1" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "north-1" })).not.toBeInTheDocument()
    expect(state.selectedFleetId.get()).toBe("f2")
  })

  it("closes the old fleet's socket topics when the user switches fleet", async () => {
    serveFleets()
    const { user, socket } = renderWithProviders(<CommandCenterPage />, {
      appState: { fleetId: "f1" },
    })
    await screen.findByRole("link", { name: "north-1" })

    await user.click(await screen.findByRole("button", { name: "North depot" }))
    await user.click(screen.getByRole("button", { name: "South depot" }))
    await screen.findByRole("link", { name: "south-1" })

    await waitFor(() => expect(socket.subscriptions()).toEqual(["pubsub/combinfo/south-1"]))
  })
})
