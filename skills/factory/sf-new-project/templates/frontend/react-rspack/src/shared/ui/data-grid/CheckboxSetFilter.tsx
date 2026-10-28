import { useVirtualizer } from "@tanstack/react-virtual"
import type { DoesFilterPassParams, IRowNode } from "ag-grid-community"
import { type CustomFilterDisplayProps, useGridFilterDisplay } from "ag-grid-react"
import { Search } from "lucide-react"
import { useCallback, useId, useMemo, useRef, useState } from "react"

import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Input } from "@/shared/ui/input"

/** The filter model: the values to keep. `null` means no filter. */
export type CheckboxSetFilterModel = { values: string[] }

const ITEM_HEIGHT = 32

function distinctValues(
  api: CustomFilterDisplayProps["api"],
  getValue: (node: IRowNode) => unknown
) {
  const seen = new Set<string>()
  api.forEachNode((node) => {
    const v = getValue(node)
    if (v !== null && v !== undefined && v !== "") seen.add(String(v))
  })
  return [...seen].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

/** A searchable checkbox list of a column's distinct values (like Excel's filter). */
export function CheckboxSetFilter({
  model,
  onModelChange,
  getValue,
  api,
}: CustomFilterDisplayProps<unknown, unknown, CheckboxSetFilterModel>) {
  const selectAllId = useId()
  const hidePopup = useRef<(() => void) | null>(null)
  const [allValues, setAllValues] = useState(() => distinctValues(api, getValue))
  const [search, setSearch] = useState("")

  const selected = useMemo(
    () => new Set(model?.values?.length ? model.values : allValues),
    [model, allValues]
  )
  const visible = useMemo(
    () => allValues.filter((v) => v.toLowerCase().includes(search.toLowerCase())),
    [allValues, search]
  )

  const apply = useCallback(
    (next: Set<string>) => {
      const kept = allValues.filter((v) => next.has(v))
      onModelChange(kept.length === 0 || kept.length === allValues.length ? null : { values: kept })
    },
    [allValues, onModelChange]
  )

  useGridFilterDisplay({
    afterGuiAttached: (params) => {
      hidePopup.current = params?.hidePopup ?? null
      setAllValues(distinctValues(api, getValue))
    },
  })

  const allVisibleSelected = visible.length > 0 && visible.every((v) => selected.has(v))
  const someVisibleSelected = !allVisibleSelected && visible.some((v) => selected.has(v))

  const toggleAll = (checked: boolean) => {
    const next = new Set(selected)
    for (const v of visible) checked ? next.add(v) : next.delete(v)
    apply(next)
  }
  const toggle = (value: string) => {
    const next = new Set(selected)
    next.has(value) ? next.delete(value) : next.add(value)
    apply(next)
  }

  const listRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: visible.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  })

  return (
    <div className="flex w-56 flex-col bg-popover text-popover-foreground">
      <div className="relative p-2">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search values"
          className="h-8 pl-8"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Checkbox
          id={selectAllId}
          checked={someVisibleSelected ? "indeterminate" : allVisibleSelected}
          onCheckedChange={(c) => toggleAll(c === true)}
        />
        <label htmlFor={selectAllId} className="cursor-pointer select-none font-semibold">
          Select all
        </label>
      </div>
      <div
        ref={listRef}
        role="listbox"
        aria-multiselectable="true"
        className="overflow-y-auto"
        style={{ height: Math.min(Math.max(visible.length, 1) * ITEM_HEIGHT, 208) }}
      >
        {visible.length === 0 ? (
          <p className="px-3 py-2 text-muted-foreground">No matching values.</p>
        ) : (
          <div className="relative" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((item) => {
              const value = visible[item.index] ?? ""
              return (
                <div
                  key={value}
                  role="option"
                  tabIndex={0}
                  aria-selected={selected.has(value)}
                  className="absolute inset-x-0 flex cursor-pointer items-center gap-2 px-3 hover:bg-accent"
                  style={{ top: item.start, height: ITEM_HEIGHT }}
                  onClick={() => toggle(value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      toggle(value)
                    }
                  }}
                >
                  <Checkbox checked={selected.has(value)} tabIndex={-1} aria-hidden="true" />
                  <span className="truncate">{value}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div className="flex gap-2 border-t p-2">
        <Button variant="ghost" size="sm" className="flex-1" onClick={() => onModelChange(null)}>
          Reset
        </Button>
        <Button variant="ghost" size="sm" className="flex-1" onClick={() => hidePopup.current?.()}>
          Close
        </Button>
      </div>
    </div>
  )
}

/** Keeps a row when its value is one of the model's values. */
export function doesCheckboxSetFilterPass({
  model,
  node,
  handlerParams,
}: DoesFilterPassParams<unknown, unknown, CheckboxSetFilterModel>) {
  if (!model?.values?.length) return true
  return model.values.includes(String(handlerParams.getValue(node) ?? ""))
}

/** Use as a column's `filter`, or set `checkboxFilter: true` on a DataGrid column. */
export const checkboxSetFilter = {
  component: CheckboxSetFilter,
  doesFilterPass: doesCheckboxSetFilterPass,
}
