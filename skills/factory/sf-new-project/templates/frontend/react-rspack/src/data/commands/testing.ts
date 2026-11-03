// Test data builders for the commands domain. Only tests import this file.
import type { ApiCommand, ApiHistoryItem } from "./commandMappers"

export const buildApiCommand = (overrides: Partial<ApiCommand> = {}): ApiCommand => ({
  cmdid: 1,
  cmdname: "Immobilize",
  needsconfirm: true,
  ...overrides,
})

export const buildApiHistoryItem = (overrides: Partial<ApiHistoryItem> = {}): ApiHistoryItem => ({
  cmdid: 1,
  cmdname: "Immobilize",
  sentat: Date.parse("2026-11-03T09:00:00Z"),
  status: 2,
  ...overrides,
})
