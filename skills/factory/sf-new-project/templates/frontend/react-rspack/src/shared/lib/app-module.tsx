import type { RouteObject } from "react-router-dom"

/** What a module's module.tsx exports, and what src/app/modules.ts lists. */
export type AppModule = {
  /** URL segment and stable id: the module is mounted at /<featureId>/*. */
  featureId: string
  /** Label in the navigation. */
  title: string
  /** Routes relative to /<featureId>. */
  routes: RouteObject[]
}
