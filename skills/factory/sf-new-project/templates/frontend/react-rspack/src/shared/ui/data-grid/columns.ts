import type { ColDef, ValueFormatterParams } from "ag-grid-community"
import { format } from "date-fns"

import { checkboxSetFilter } from "./CheckboxSetFilter"
import { compareValues, parseNumericValue } from "./comparators"

/**
 * What a column's values are. Every column declares one, so sorting, filtering
 * and display all agree: the grid sorts and filters the raw value, and only the
 * formatter turns it into text.
 *
 * | kind       | raw value in the row                    | sorts            | filter                  | shows                 |
 * |------------|-----------------------------------------|------------------|-------------------------|-----------------------|
 * | `text`     | string                                  | natural, A→Z     | text                    | as is                 |
 * | `number`   | number (or numeric string)              | numerically      | number                  | fixed decimals + unit |
 * | `date`     | Date, epoch ms, or ISO-8601 string      | chronologically  | date (whole days)       | 2026-10-29            |
 * | `datetime` | Date, epoch ms, or ISO-8601 string      | chronologically  | date (whole days)       | 2026-10-29 14:05      |
 * | `duration` | number of milliseconds                  | numerically      | number, in minutes      | 1h 20m                |
 * | `enum`     | string from a fixed set                 | by `order`, else A→Z | checkbox list        | as is                 |
 * | `action`   | (none: buttons or links)                | not sortable     | none                    | the cell renderer     |
 */
export type ColumnKind = "text" | "number" | "date" | "datetime" | "duration" | "enum" | "action"

export type ColumnKindOptions = {
  /** number: fixed decimals (money 2, percentages 1, counts 0). */
  decimals?: number
  /** number: unit shown after the value, e.g. "km/h". */
  unit?: string
  /** enum: values in their meaningful order, e.g. ["critical", "high", "medium", "low"]. */
  order?: readonly string[]
}

/** Milliseconds since the epoch for a Date, an epoch number or an ISO-8601 string; null when missing or unparseable. */
export function toTime(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : null
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string") {
    // Only ISO-8601 is accepted: "29/10/2026" is ambiguous and must be parsed in the mapper.
    if (!/^\d{4}-\d{2}-\d{2}/.test(value.trim())) return null
    const t = Date.parse(value)
    return Number.isFinite(t) ? t : null
  }
  return null
}

const MISSING = "—"

export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60_000)
  if (totalMinutes < 1) return `${Math.round(ms / 1000)}s`
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`
}

const compareTimes = (a: unknown, b: unknown, _na?: unknown, _nb?: unknown, desc?: boolean) =>
  compareValues(toTime(a), toTime(b), undefined, undefined, desc)

/** The date filter compares whole days: a cell matches "2026-10-29" anywhere on that day. */
const dateFilterParams = {
  comparator: (filterDay: Date, cellValue: unknown) => {
    const t = toTime(cellValue)
    if (t === null) return -1
    const cellDay = new Date(t)
    cellDay.setHours(0, 0, 0, 0)
    return cellDay.getTime() - filterDay.getTime()
  },
}

/** Values listed in `order` sort by their position; any others follow, in natural order. Missing stays last. */
export function orderedComparator(order: readonly string[]) {
  const rank = new Map(order.map((v, i) => [v, i]))
  return (a: unknown, b: unknown, _na?: unknown, _nb?: unknown, desc?: boolean) => {
    const ra = a == null ? undefined : rank.get(String(a))
    const rb = b == null ? undefined : rank.get(String(b))
    if (ra !== undefined && rb !== undefined) return ra - rb
    if (ra !== undefined && b != null) return -1
    if (rb !== undefined && a != null) return 1
    return compareValues(a, b, undefined, undefined, desc)
  }
}

/** The ColDef settings a kind implies. Anything set on the column itself wins. */
export function columnKindDefaults<TData>(
  kind: ColumnKind,
  opts: ColumnKindOptions = {}
): ColDef<TData> {
  switch (kind) {
    case "text":
      return { filter: "agTextColumnFilter", comparator: compareValues }
    case "number": {
      const fmt = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: opts.decimals ?? 0,
        maximumFractionDigits: opts.decimals ?? 0,
      })
      return {
        type: "rightAligned",
        filter: "agNumberColumnFilter",
        comparator: compareValues,
        valueFormatter: (p: ValueFormatterParams<TData>) => {
          const n = parseNumericValue(p.value)
          return n === null ? MISSING : opts.unit ? `${fmt.format(n)} ${opts.unit}` : fmt.format(n)
        },
      }
    }
    case "date":
    case "datetime": {
      const pattern = kind === "date" ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm"
      return {
        filter: "agDateColumnFilter",
        filterParams: dateFilterParams,
        comparator: compareTimes,
        valueFormatter: (p: ValueFormatterParams<TData>) => {
          const t = toTime(p.value)
          return t === null ? MISSING : format(t, pattern)
        },
      }
    }
    case "duration":
      return {
        type: "rightAligned",
        filter: "agNumberColumnFilter",
        // Filter in whole minutes; the raw value stays milliseconds for sorting.
        filterValueGetter: (p) => {
          const ms = parseNumericValue(p.getValue(p.column.getColId()))
          return ms === null ? null : Math.round(ms / 60_000)
        },
        comparator: compareValues,
        valueFormatter: (p: ValueFormatterParams<TData>) => {
          const ms = parseNumericValue(p.value)
          return ms === null ? MISSING : formatDuration(ms)
        },
      }
    case "enum":
      return {
        filter: checkboxSetFilter,
        comparator: opts.order ? orderedComparator(opts.order) : compareValues,
      }
    case "action":
      return { sortable: false, filter: false, resizable: false }
  }
}
