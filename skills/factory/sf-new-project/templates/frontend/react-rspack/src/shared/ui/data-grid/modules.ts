import {
  CellStyleModule,
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  CsvExportModule,
  CustomFilterModule,
  DateFilterModule,
  LocaleModule,
  type Module,
  NumberFilterModule,
  PaginationModule,
  QuickFilterModule,
  RowStyleModule,
  TextFilterModule,
  ValidationModule,
} from "ag-grid-community"

/**
 * The AG Grid Community features DataGrid enables. Register a feature here,
 * not in a module, so every grid behaves the same and the bundle stays small.
 * AG Grid Enterprise is not licensed: never import "ag-grid-enterprise".
 */
export const gridModules: Module[] = [
  ClientSideRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  QuickFilterModule,
  PaginationModule,
  CellStyleModule,
  RowStyleModule,
  ColumnAutoSizeModule,
  CsvExportModule,
  LocaleModule, // localeText (the empty-state sentence)
  // Full warnings in development; production gets error codes only.
  ...(process.env.NODE_ENV === "production" ? [] : [ValidationModule]),
]
