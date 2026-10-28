---
name: ag-grid
description: "Build data tables with the project's DataGrid (AG Grid Community 36): columns, filters, sorting, live updates, export, density and theming. Use when showing tabular data, adding or changing a grid column or filter, or when an AG Grid warning or error appears."
---

# Data grids (AG Grid)

Interactive tables (sortable, filterable, many rows, live updates, CSV export) use **`DataGrid` from `@/shared/ui/data-grid`**. It is a thin wrapper over AG Grid Community 36.2.0 that sets the theme, modules, filters, comparator and defaults. Small static tables (a few rows in a card, a key-value list) use plain markup styled per `DESIGN.md`, not a grid.

## Rules

- **Only `src/shared/ui/data-grid/` imports `ag-grid-community` or `ag-grid-react`** (dependency-cruiser rule `ag-grid-only-in-data-grid`). A module renders `<DataGrid>`; if it needs something the wrapper doesn't offer, add a prop to the wrapper, or as a last resort use `gridOptions`.
- **Community only.** AG Grid Enterprise needs a commercial licence the project doesn't have: never install or import `ag-grid-enterprise` (rule `no-ag-grid-enterprise`). Row grouping, pivoting, set filters, range selection, Excel export and integrated charts are Enterprise; use the alternatives below.
- **A feature needs its module.** AG Grid 36 only runs features registered in `data-grid/modules.ts`. If development logs `AG Grid: error #200 … Module is not registered`, add that Community module there, not in a component.
- **The theme comes from `DESIGN.md`.** `data-grid/theme.ts` maps grid parameters to the CSS variables in `src/index.css`, so light and dark follow the app. Don't set colours, fonts or row heights on a grid instance; change the tokens.
- **Version-specific APIs.** This is AG Grid 36. Custom filters use `enableFilterHandlers` with `filter: { component, doesFilterPass }` and `useGridFilterDisplay`, and custom date inputs use the `dateComponent` column property. Older patterns you may remember (`useGridFilter` with the filter logic inside the component, `ag-theme-*` CSS classes, `@ag-grid-community/*` packages, global `ModuleRegistry` calls) are legacy here.

## Using DataGrid

```tsx
import { DataGrid, type DataGridColumn } from "@/shared/ui/data-grid"

const columns: DataGridColumn<Vehicle>[] = [
  { field: "registration", headerName: "Vehicle", minWidth: 160 },
  { field: "status", headerName: "Status", checkboxFilter: true, cellRenderer: StatusPillCell },
  { field: "speedKmh", headerName: "Speed", numeric: true, valueFormatter: (p) => formatKmh(p.value) },
  { field: "lastSeen", headerName: "Last seen", filter: "agDateColumnFilter" },
]

export function VehiclesTable() {
  const { data, isPending } = useVehiclesQuery() // a hook over the store (frontend-architecture)
  const [count, setCount] = useState(0)
  return (
    <>
      <p className="text-muted-foreground">{count} vehicles</p>
      <DataGrid
        rows={data}
        columns={columns}
        rowId={(v) => v.id}
        loading={isPending}
        density="dense"
        emptyMessage="No vehicles in this fleet."
        onDisplayedRowCountChange={setCount}
      />
    </>
  )
}
```

| Need | How |
|---|---|
| Numbers | `numeric: true`: right-aligned and a number filter. Format with `valueFormatter` (fixed decimals and units per `DESIGN.md`); tabular figures are global. |
| Pick-from-values filter | `checkboxFilter: true` (the project's free replacement for Enterprise's set filter) |
| Dates | `filter: "agDateColumnFilter"`; the date input with a calendar is wired by default |
| Status, links, actions in a cell | a small `cellRenderer` component using shadcn and the `DESIGN.md` status pills |
| Search box over the table | pass its text as `quickFilterText` |
| Count above the table | `onDisplayedRowCountChange` (reflects filters) |
| CSV export | `ref` to the grid, then `ref.current?.api.exportDataAsCsv()` |
| Many rows | Client-side rendering is virtualised; tens of thousands of rows are fine. Turn `pagination` on only when the list is a work queue that people page through. |
| Row heights | `density`: `comfortable` 48, `default` 44, `dense` 36 (monitoring screens) |

## Live data

- Rows come from the TanStack Query cache, which the store patches from the WebSocket (`frontend-architecture`). Pass the new array as `rows`; `rowId` lets AG Grid update the changed rows in place instead of redrawing, keeping scroll, sort, filter and selection.
- `rowId` must be stable and unique: the entity's id, never an index.
- Don't put `rows` through `useMemo` that recreates every row object on each update; give the grid the cache's objects so unchanged rows stay unchanged.

## Testing

`src/shared/ui/data-grid/DataGrid.test.tsx` shows the pattern: render `<DataGrid>` with rows and assert on visible text with Testing Library (`findByText`, since the grid renders asynchronously). Test a module's columns and renderers through the module's own component, not AG Grid internals.

## Docs

Read the AG Grid docs for version 36 as Markdown by adding `.md` to a page URL, for example https://www.ag-grid.com/react-data-grid/component-filter.md. The index is https://www.ag-grid.com/llms.txt. Check the module a feature needs on https://www.ag-grid.com/react-data-grid/modules.md before using it.
