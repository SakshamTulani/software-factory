import { createContext, type ReactNode, useContext, useMemo } from "react"

import type { Stores } from "@/data"
import type { AppState } from "@/state"

type Container = { stores: Stores; state: AppState }

const DataContext = createContext<Container | null>(null)

/**
 * Gives every hook below it the stores and the app state. src/app/App.tsx
 * renders it once with the real ones; src/test/render.tsx with fresh ones per test.
 */
export function DataProvider({ stores, state, children }: Container & { children: ReactNode }) {
  const value = useMemo(() => ({ stores, state }), [stores, state])
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

function useContainer(): Container {
  const container = useContext(DataContext)
  if (!container) throw new Error("DataProvider is missing above this component")
  return container
}

/** The stores built by createStores(). Data hooks call their get…() and mutation methods. */
export const useStores = (): Stores => useContainer().stores

/** The app state built by createAppState(). */
export const useAppState = (): AppState => useContainer().state
