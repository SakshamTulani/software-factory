import { themeQuartz } from "ag-grid-community"

/**
 * The grid's theme, built from DESIGN.md tokens. Colours reference the CSS
 * variables in src/index.css, so the grid follows light and dark mode with the
 * rest of the app. Change a value in DESIGN.md and index.css, not here.
 */
export const gridTheme = themeQuartz.withParams({
  fontFamily: "inherit",
  fontSize: 13,
  dataFontSize: 13,
  headerFontSize: 11,
  headerFontWeight: 700,
  headerHeight: 40,
  rowHeight: 44,
  spacing: 4,
  cellHorizontalPadding: 14,
  iconSize: 16,
  borderRadius: 8,
  wrapperBorderRadius: 12,
  accentColor: "var(--primary)",
  backgroundColor: "var(--card)",
  chromeBackgroundColor: "var(--card)",
  foregroundColor: "var(--foreground)",
  textColor: "var(--foreground)",
  subtleTextColor: "var(--muted-foreground)",
  headerBackgroundColor: "var(--card)",
  headerTextColor: "var(--subtle-foreground)",
  borderColor: "var(--border)",
  wrapperBorder: false,
  columnBorder: false,
  headerColumnBorder: false,
  rowBorder: { color: "var(--border)" },
  headerRowBorder: { color: "var(--border-strong)" },
  oddRowBackgroundColor: "var(--card)",
  rowHoverColor: "color-mix(in oklab, var(--accent) 50%, transparent)",
  selectedRowBackgroundColor: "var(--accent)",
  menuBackgroundColor: "var(--popover)",
  inputFocusBorder: { color: "var(--ring)" },
  browserColorScheme: "inherit",
})

/** Row heights per DESIGN.md density mode. */
export const rowHeights = { comfortable: 48, default: 44, dense: 36 } as const
export type GridDensity = keyof typeof rowHeights
