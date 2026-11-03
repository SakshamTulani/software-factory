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

## Sorting and filtering follow the value, not the text

The grid sorts and filters the **raw value** in the row, and shows it through a formatter. If the row holds text formatted for display, sorting and filtering run on that text and are wrong: "03 Oct" sorts before "30 Sep", "1h 30m" before "9m", "10" before "9", and a date filter can't match "29 Oct 2026, 14:05".

So:

1. **Rows hold raw, typed values.** Dates and times are `Date`, epoch milliseconds or ISO-8601 strings; durations are milliseconds; quantities are numbers; states are their code (`"critical"`, not "Critical ⚠"). The domain's mapper in `src/data/` converts whatever the API sends into these (`frontend-architecture`). Never format in the mapper, the store or the hook.
2. **Every column declares a `kind`**, which TypeScript requires. The kind sets the comparator, the filter and the formatter together (`data-grid/columns.ts`):

| `kind` | Raw value | Sorts | Filter | Shows |
|---|---|---|---|---|
| `text` | string | natural (Truck 2 before Truck 10) | text | as is |
| `number` | number | numerically | number | fixed `decimals` + `unit` |
| `date` | Date, epoch ms or ISO string | chronologically | date, whole days | 2026-10-29 |
| `datetime` | Date, epoch ms or ISO string | chronologically | date, whole days | 2026-10-29 14:05 |
| `duration` | milliseconds | numerically | number, in minutes | 1h 30m |
| `enum` | code from a fixed set | by `order` if given, else A to Z | checkbox list | as is |
| `action` | none | not sortable | none | the cell renderer |

3. **Display goes in `valueFormatter` or `cellRenderer` only, through `@/shared/lib/format`.** Each kind already formats with it. If you override `valueFormatter` (for example `formatRelative` for a "last seen" column), keep the kind: the sort and filter still use the raw value. If you override `valueGetter`, it must return the raw value, not text.
4. **Missing values are `null`**, shown as "—" and sorted last in both directions. Never put "—", "NA" or "" in the row.
5. **A value whose order means something** (severity, priority, lifecycle stage) is an `enum` with an `order`; alphabetical "critical, high, low, medium" is wrong.

### Checklist for every new column

- [ ] What is the raw value and its type? Does the mapper produce it, not a display string?
- [ ] Which `kind`? Would sorting it ascending put the rows in the order a user expects?
- [ ] Does the filter type match (date picker for dates, numbers for numbers, a checkbox list for a fixed set)?
- [ ] Is anything formatted outside `valueFormatter` or `cellRenderer`?
- [ ] For a computed column (`valueGetter`), does it return a raw value?

If a column needs a comparator or filter none of the kinds covers, add it to `columns.ts` as a new kind with a test, rather than writing a one-off comparator in a module.

## Using DataGrid

```tsx
import { DataGrid, type DataGridColumn } from "@/shared/ui/data-grid"

// Vehicle comes from the mapper: lastSeen is epoch ms, idleMs is ms, speedKmh a number.
const columns: DataGridColumn<Vehicle>[] = [
  { field: "registration", headerName: "Vehicle", kind: "text", minWidth: 160 },
  { field: "severity", headerName: "Alert", kind: "enum", order: ["critical", "high", "medium", "low"], cellRenderer: SeverityPill },
  { field: "speedKmh", headerName: "Speed", kind: "number", decimals: 0, unit: "km/h" },
  { field: "idleMs", headerName: "Idle", kind: "duration" },
  { field: "lastSeen", headerName: "Last seen", kind: "datetime" },
  { colId: "actions", headerName: "", kind: "action", cellRenderer: VehicleActions, maxWidth: 96 },
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
| Status, links, actions in a cell | a small `cellRenderer` component using shadcn and the `DESIGN.md` status pills; the column keeps its `kind` |
| Search box over the table | pass its text as `quickFilterText` |
| Count above the table | `onDisplayedRowCountChange` (reflects filters) |
| CSV export | `ref` to the grid, then `ref.current?.api.exportDataAsCsv()`; exports use the formatted values |
| Many rows | Client-side rendering is virtualised; tens of thousands of rows are fine. Turn `pagination` on only when the list is a work queue that people page through. |
| Row heights | `density`: `comfortable` 48, `default` 44, `dense` 36 (monitoring screens) |

## Live data

- Rows come from a store's query, which the store patches from the WebSocket (`frontend-architecture`). Pass the new array as `rows`; `rowId` lets AG Grid update the changed rows in place instead of redrawing, keeping scroll, sort, filter and selection.
- `rowId` must be stable and unique: the entity's id, never an index.
- Don't put `rows` through `useMemo` that recreates every row object on each update; give the grid the cache's objects so unchanged rows stay unchanged.

## Testing

`src/shared/ui/data-grid/DataGrid.test.tsx` shows the pattern: render `<DataGrid>` with rows and assert on visible text with Testing Library (`findByText`, since the grid renders asynchronously). `columns.test.ts` shows how each kind's sort and filter are tested; a new kind gets the same kind of test. In a module, test that the mapper produces raw values (a `Date` or epoch ms, not a formatted string): that is where most sorting bugs start.

## Docs

Read the AG Grid docs for version 36 as Markdown by adding `.md` to a page URL, for example https://www.ag-grid.com/react-data-grid/component-filter.md. The index is https://www.ag-grid.com/llms.txt. Check the module a feature needs on https://www.ag-grid.com/react-data-grid/modules.md before using it.
