import { expect, it } from "@rstest/core"
import { render, screen } from "@testing-library/react"

import { DataGrid, type DataGridColumn } from "./DataGrid"

type Vehicle = { id: string; name: string; speed: number }

const columns: DataGridColumn<Vehicle>[] = [
  { field: "name", headerName: "Vehicle", kind: "text" },
  { field: "speed", headerName: "Speed", kind: "number", unit: "km/h" },
]

it("renders a row per item", async () => {
  render(
    <DataGrid<Vehicle>
      rows={[
        { id: "v1", name: "Truck 1", speed: 42 },
        { id: "v2", name: "Truck 2", speed: 0 },
      ]}
      columns={columns}
      rowId={(v) => v.id}
    />
  )

  expect(await screen.findByText("Truck 1")).toBeInTheDocument()
  expect(screen.getByText("Truck 2")).toBeInTheDocument()
  expect(screen.getByText("42 km/h")).toBeInTheDocument()
})

it("shows the empty-state sentence when there are no rows", async () => {
  render(
    <DataGrid<Vehicle>
      rows={[]}
      columns={columns}
      rowId={(v) => v.id}
      emptyMessage="No vehicles in this fleet."
    />
  )

  expect(await screen.findByText("No vehicles in this fleet.")).toBeInTheDocument()
})
