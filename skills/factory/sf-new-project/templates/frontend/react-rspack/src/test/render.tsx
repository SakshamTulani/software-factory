import { render, renderHook } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactElement, ReactNode } from "react"
import { MemoryRouter } from "react-router-dom"

import { DataProvider } from "@/bindings/react"
import { createStores } from "@/data"
import { httpClient } from "@/shared/api"
import { createFakeRealtimeConnection } from "@/shared/realtime/testing"
import { createAppState } from "@/state"

type Options = {
  /** The URL the component renders at. */
  route?: string
  /** Initial app state, such as the selected fleet. */
  appState?: Parameters<typeof createAppState>[0]
  /** How long stores buffer socket deltas. Default 0, so a test sees them on the next tick. */
  flushMs?: number
}

/** The app's providers around a test: real stores over MSW, the fake socket, fresh app state. */
function createProviders({ route = "/", appState, flushMs = 0 }: Options) {
  const socket = createFakeRealtimeConnection()
  const stores = createStores({ http: httpClient, realtime: socket, flushMs })
  const state = createAppState(appState)
  function Providers({ children }: { children: ReactNode }) {
    return (
      <DataProvider stores={stores} state={state}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </DataProvider>
    )
  }
  return { socket, stores, state, Providers }
}

/**
 * Renders ui the way the app does: every real store (REST through MSW), the
 * fake socket and fresh app state, under a router.
 */
export function renderWithProviders(ui: ReactElement, options: Options = {}) {
  const { socket, stores, state, Providers } = createProviders(options)
  const user = userEvent.setup()
  return { ...render(ui, { wrapper: Providers }), user, socket, stores, state }
}

/** renderHook inside the same providers, for a hook no component test covers well. */
export function renderHookWithProviders<Result>(hook: () => Result, options: Options = {}) {
  const { socket, stores, state, Providers } = createProviders(options)
  return { ...renderHook(hook, { wrapper: Providers }), socket, stores, state }
}
