import { format, isValid, parse } from "date-fns"

/**
 * How the whole app shows values to people. Every screen, grid column, chart
 * label and export formats through these functions; nothing else may call
 * date-fns, `toLocale*String` or `Intl` formatters (dependency-cruiser and a
 * Biome rule enforce it). To change how dates or numbers look everywhere,
 * change it here. The formats themselves are specified in DESIGN.md "Formats".
 *
 * Values arrive raw: Date or epoch ms (or ISO-8601 strings) for instants,
 * milliseconds for durations, numbers for quantities, null when missing.
 */

/** Shown for a missing value. A real zero is printed as 0. */
export const MISSING = "—"

/** Display patterns (date-fns tokens). */
export const DATE_PATTERN = "yyyy-MM-dd"
export const DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm"
export const TIME_PATTERN = "HH:mm"

/**
 * Number locale. undefined = the viewer's browser locale. Set a fixed locale
 * (for example "en-IN" for lakh grouping) if a client needs every viewer to see
 * the same separators.
 */
const NUMBER_LOCALE: string | undefined = undefined

/** Milliseconds since the epoch for a Date, an epoch number or an ISO-8601 string; null when missing or unparseable. */
export function toTime(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : null
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string") {
    // Only ISO-8601: "29/10/2026" is ambiguous and must be parsed in the mapper.
    if (!/^\d{4}-\d{2}-\d{2}/.test(value.trim())) return null
    const t = Date.parse(value)
    return Number.isFinite(t) ? t : null
  }
  return null
}

const withTime = (value: unknown, pattern: string) => {
  const t = toTime(value)
  return t === null ? MISSING : format(t, pattern)
}

/** 2026-10-29 */
export const formatDate = (value: unknown) => withTime(value, DATE_PATTERN)
/** 2026-10-29 14:05 */
export const formatDateTime = (value: unknown) => withTime(value, DATE_TIME_PATTERN)
/** 14:05 */
export const formatTime = (value: unknown) => withTime(value, TIME_PATTERN)

/** For recency: "just now", "5 min ago", "3 h ago", "Yesterday", then the date. Future instants show the date-time. */
export function formatRelative(value: unknown, now: number = Date.now()): string {
  const t = toTime(value)
  if (t === null) return MISSING
  const diff = now - t
  if (diff < 0) return formatDateTime(t)
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (format(t, DATE_PATTERN) === format(yesterday, DATE_PATTERN)) return "Yesterday"
  return formatDate(t)
}

/** A length of time in milliseconds: "45s", "9m", "1h 30m", "2d 4h". */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return MISSING
  const sign = ms < 0 ? "-" : ""
  const abs = Math.abs(ms)
  if (abs < 60_000) return `${sign}${Math.round(abs / 1000)}s`
  const totalMinutes = Math.round(abs / 60_000)
  const d = Math.floor(totalMinutes / 1440)
  const h = Math.floor((totalMinutes % 1440) / 60)
  const m = totalMinutes % 60
  if (d > 0) return `${sign}${d}d${h > 0 ? ` ${h}h` : ""}`
  if (h > 0) return `${sign}${h}h${m > 0 ? ` ${m}m` : ""}`
  return `${sign}${m}m`
}

const numberFormats = new Map<number, Intl.NumberFormat>()
const numberFormat = (decimals: number) => {
  let f = numberFormats.get(decimals)
  if (!f) {
    f = new Intl.NumberFormat(NUMBER_LOCALE, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    numberFormats.set(decimals, f)
  }
  return f
}

/** A quantity with fixed decimals and thousands separators: "1,250", "42.5 km/h". */
export function formatNumber(
  value: number | null | undefined,
  opts: { decimals?: number; unit?: string } = {}
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return MISSING
  const text = numberFormat(opts.decimals ?? 0).format(value)
  return opts.unit ? `${text} ${opts.unit}` : text
}

/** A percentage given as a percent value (12.5 means 12.5%): "12.5%". */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return MISSING
  return `${numberFormat(decimals).format(value)}%`
}

/** The text a date input shows and accepts: the ISO date. */
export const formatDateInput = (date: Date | null) => (date ? format(date, DATE_PATTERN) : "")

/** Parses a date input's text; null for empty or invalid text. */
export function parseDateInput(text: string): Date | null {
  if (text.trim() === "") return null
  const parsed = parse(text.trim(), DATE_PATTERN, new Date())
  return isValid(parsed) ? parsed : null
}
