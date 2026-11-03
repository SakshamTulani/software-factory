import { describe, expect, it } from "@rstest/core"
import { screen, within } from "@testing-library/react"
import { HttpResponse, http } from "msw"

import { buildApiCommand, buildApiHistoryItem } from "@/data/commands/testing"
import { buildApiVehicleDetails, buildApiVehicleLive } from "@/data/vehicles/testing"
import { renderWithProviders } from "@/test/render"
import { apiUrl, server } from "@/test/server"

import { CommandPanel } from "./CommandPanel"

function serveVehicle({ sent = false } = {}) {
  let commandSent = sent
  server.use(
    http.post(apiUrl("/commands/listcommandsbyvehicle"), () =>
      HttpResponse.json([buildApiCommand({ cmdid: 1, cmdname: "Immobilize" })])
    ),
    http.post(apiUrl("/commands/getcommandupdatesbyvehicle"), () =>
      HttpResponse.json(
        commandSent ? [buildApiHistoryItem({ cmdname: "Immobilize", status: 0 })] : []
      )
    ),
    http.post(apiUrl("/vehicles/details"), () =>
      HttpResponse.json(buildApiVehicleDetails({ lastcmdat: commandSent ? Date.now() : null }))
    ),
    http.post(apiUrl("/vehicles/liveinfo"), () =>
      HttpResponse.json([buildApiVehicleLive({ vehicleid: "v1", utctime: Date.now() })])
    ),
    http.post(apiUrl("/commands/sendcommandtovehicle"), () => {
      commandSent = true
      return HttpResponse.json({})
    })
  )
}

describe("CommandPanel", () => {
  it("sends a command, then shows it in the history and the last-command time, with no refresh code", async () => {
    serveVehicle()
    const { user } = renderWithProviders(<CommandPanel fleetId="f1" vehicleId="v1" />)

    await user.click(await screen.findByRole("button", { name: "Immobilize" }))

    const history = screen.getByRole("list", { name: "History" })
    expect(await within(history).findByText(/Immobilize · pending/)).toBeInTheDocument()
    expect(await screen.findByText(/Last command/)).toBeInTheDocument()
  })

  it("shows the vehicle as immobilized when the socket reports it", async () => {
    serveVehicle()
    const { socket } = renderWithProviders(<CommandPanel fleetId="f1" vehicleId="v1" />)
    expect(await screen.findByText(/Mobile/)).toBeInTheDocument()

    socket.emit("pubsub", "combinfo/v1", {
      parsedcandata: { immobilization_status: { pidvalue: 1 } },
    })

    expect(await screen.findByText(/Immobilized/)).toBeInTheDocument()
  })

  it("lets the user retry when the commands fail to load", async () => {
    serveVehicle()
    server.use(
      http.post(
        apiUrl("/commands/listcommandsbyvehicle"),
        () => new HttpResponse(null, { status: 500 }),
        {
          once: true,
        }
      )
    )
    const { user } = renderWithProviders(<CommandPanel fleetId="f1" vehicleId="v1" />)

    await user.click(await screen.findByRole("button", { name: "Try again" }))

    expect(await screen.findByRole("button", { name: "Immobilize" })).toBeInTheDocument()
  })
})
