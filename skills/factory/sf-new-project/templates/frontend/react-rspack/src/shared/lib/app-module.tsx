import type { QueryClient } from "@tanstack/react-query"
import type { ComponentType, ReactNode } from "react"
import type { RouteObject } from "react-router-dom"

import type { RealtimeConnection } from "@/shared/realtime"

/**
 * What every module's store is built from. src/app passes the real cache and
 * socket; tests pass a fresh QueryClient and the fake socket (src/test/render.tsx).
 */
export type AppDeps = { qc: QueryClient; realtime: RealtimeConnection }

/** What a module's module.tsx exports, and what src/app/modules.ts lists. */
export type AppModule = {
  /** URL segment and stable id: the module is mounted at /<featureId>/*. */
  featureId: string
  /** Label in the navigation. */
  title: string
  /** Routes relative to /<featureId>. */
  routes: RouteObject[]
  /** Builds the module's store from deps once and provides it to the module's hooks. */
  Provider: ComponentType<{ deps: AppDeps; children: ReactNode }>
}

/** Wraps children in every module's Provider, so any module's hooks work anywhere below. */
export function ModuleProviders({
  modules,
  deps,
  children,
}: {
  modules: AppModule[]
  deps: AppDeps
  children: ReactNode
}) {
  let tree = children
  for (const { Provider } of [...modules].reverse()) {
    tree = <Provider deps={deps}>{tree}</Provider>
  }
  return <>{tree}</>
}
