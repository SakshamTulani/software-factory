/** A finite number, or null for missing, blank, "—", "-" or "NA". Dates compare by time. */
export function parseNumericValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : null
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (trimmed === "" || trimmed === "NA" || trimmed === "—" || trimmed === "-") return null
    const n = Number(trimmed)
    return Number.isFinite(n) ? n : null
  }
  return null
}

const isMissing = (v: unknown) =>
  v === null ||
  v === undefined ||
  (typeof v === "string" && ["", "—", "-", "NA"].includes(v.trim()))

/**
 * The default column comparator. Numbers (and numeric strings, and dates) sort
 * numerically, text sorts naturally ("Truck 2" before "Truck 10"), and missing
 * values stay at the bottom in both directions.
 */
export function compareValues(
  valueA: unknown,
  valueB: unknown,
  _nodeA?: unknown,
  _nodeB?: unknown,
  isDescending?: boolean
): number {
  const missingA = isMissing(valueA)
  const missingB = isMissing(valueB)
  if (missingA && missingB) return 0
  if (missingA) return isDescending ? -1 : 1
  if (missingB) return isDescending ? 1 : -1
  const numA = parseNumericValue(valueA)
  const numB = parseNumericValue(valueB)
  if (numA !== null && numB !== null) return numA - numB
  return String(valueA).localeCompare(String(valueB), undefined, {
    numeric: true,
    sensitivity: "base",
  })
}
