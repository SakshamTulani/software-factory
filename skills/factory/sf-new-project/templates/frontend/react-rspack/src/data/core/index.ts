/**
 * The cache every store builds on, shared by every project instead of each
 * writing its own. Copied from Intellicar's earlier frontend query library
 * (commit 56ecc9d, 2026-10-22). Changes from that source:
 * - GC timers check refCount before removing a query, so a query a component
 *   mounted again without calling getQuery (React StrictMode) isn't destroyed
 *   while it is watched (query-cache.test.ts).
 * - `any` replaced with `unknown` and casts, for Biome's noExplicitAny.
 * - A request cancelled by axios (CanceledError) counts as an abort, like
 *   fetch's AbortError, so a forced refetch doesn't flash an error state.
 * - The React hooks live in src/bindings/react/, so this folder has no React.
 */
export * from "./base-cache-store"
export * from "./infinite-query-observer"
export * from "./query-cache"
export * from "./query-observer"
export * from "./types"
