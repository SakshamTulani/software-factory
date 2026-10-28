import type { ColDef, GetRowIdParams, ModelUpdatedEvent, RowClickedEvent } from "ag-grid-community"
import { AgGridProvider, AgGridReact, type AgGridReactProps } from "ag-grid-react"
import { type Ref, useCallback, useMemo } from "react"

import { cn } from "@/shared/lib/utils"
import { type ColumnKind, type ColumnKindOptions, columnKindDefaults } from "./columns"
import { compareValues } from "./comparators"
import { DateFilterInput } from "./DateFilterInput"
import { gridModules } from "./modules"
import { type GridDensity, gridTheme, rowHeights } from "./theme"

/**
 * A column: an AG Grid ColDef plus a required `kind` that decides how its
 * values sort, filter and display (see columns.ts). Rows must hold raw values
 * (Date or epoch ms, numbers, durations in ms), never text formatted for display.
 */
export type DataGridColumn<TData> = ColDef<TData> & ColumnKindOptions & { kind: ColumnKind }

export type DataGridProps<TData> = {
  rows: TData[] | undefined
  columns: DataGridColumn<TData>[]
  /** A stable, unique id for each row, so live updates patch rows instead of re-rendering the grid. */
  rowId: (row: TData) => string
  loading?: boolean
  /** Row height and padding from DESIGN.md: dense for monitoring screens. */
  density?: GridDensity
  quickFilterText?: string
  /** Off by default: cap rows and link to the full list instead. A number sets the page size. */
  pagination?: boolean | number
  /** The empty-state sentence shown inside the grid. */
  emptyMessage?: string
  onRowClick?: (row: TData, event: RowClickedEvent<TData>) => void
  /** Called with the number of rows left after filtering, for the count above the table. */
  onDisplayedRowCountChange?: (count: number) => void
  className?: string
  ref?: Ref<AgGridReact<TData>>
  /** Escape hatch for a grid option this wrapper doesn't expose. Prefer adding a prop. */
  gridOptions?: Omit<AgGridReactProps<TData>, "rowData" | "columnDefs" | "theme" | "getRowId">
}

/**
 * The only place the app renders AG Grid (enforced by dependency-cruiser).
 * Themed from DESIGN.md, with the project's filters, comparator and defaults.
 */
export function DataGrid<TData>({
  rows,
  columns,
  rowId,
  loading,
  density = "default",
  quickFilterText,
  pagination = false,
  emptyMessage = "No rows to show.",
  onRowClick,
  onDisplayedRowCountChange,
  className,
  ref,
  gridOptions,
}: DataGridProps<TData>) {
  const columnDefs = useMemo<ColDef<TData>[]>(
    () =>
      columns.map(({ kind, decimals, unit, order, ...col }) => ({
        ...columnKindDefaults<TData>(kind, { decimals, unit, order }),
        ...col,
      })),
    [columns]
  )

  const defaultColDef = useMemo<ColDef<TData>>(
    () => ({
      flex: 1,
      minWidth: 100,
      sortable: true,
      resizable: true,
      filter: true,
      comparator: compareValues,
      dateComponent: DateFilterInput,
    }),
    []
  )

  const getRowId = useCallback((params: GetRowIdParams<TData>) => rowId(params.data), [rowId])
  const reportCount = useCallback(
    (event: ModelUpdatedEvent<TData>) =>
      onDisplayedRowCountChange?.(event.api.getDisplayedRowCount()),
    [onDisplayedRowCountChange]
  )

  return (
    <AgGridProvider modules={gridModules}>
      <div className={cn("h-96 w-full", className)}>
        <AgGridReact<TData>
          ref={ref}
          theme={gridTheme}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={getRowId}
          loading={loading}
          rowHeight={rowHeights[density]}
          quickFilterText={quickFilterText}
          pagination={pagination !== false}
          paginationPageSize={typeof pagination === "number" ? pagination : 100}
          enableFilterHandlers
          enableCellTextSelection
          suppressDragLeaveHidesColumns
          localeText={{ noRowsToShow: emptyMessage }}
          onRowClicked={onRowClick ? (e) => e.data && onRowClick(e.data, e) : undefined}
          onModelUpdated={reportCount}
          {...gridOptions}
        />
      </div>
    </AgGridProvider>
  )
}
