import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, renderHook } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactElement, ReactNode } from "react"
import { MemoryRouter } from "react-router-dom"

import { type AppModule, ModuleProviders } from "@/shared/lib/app-module"
import { createFakeRealtimeConnection } from "@/shared/realtime/testing"

/** A cache for one test: no retries, so a failed request shows its error state at once. */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Number.POSITIVE_INFINITY },
      mutations: { retry: false },
    },
  })
}

type Options = {
  /** Modules whose stores the component's hooks need. */
  modules?: AppModule[]
  /** The URL the component renders at. */
  route?: string
}

/** The app's providers around a test: a fresh cache, the fake socket, real module stores. */
function createProviders({ modules = [], route = "/" }: Options) {
  const qc = createTestQueryClient()
  const socket = createFakeRealtimeConnection()
  function Providers({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <ModuleProviders modules={modules} deps={{ qc, realtime: socket }}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </ModuleProviders>
      </QueryClientProvider>
    )
  }
  return { qc, socket, Providers }
}

/**
 * Renders ui the way the app does: a fresh QueryClient, the fake socket and
 * each listed module's real store, under a router. REST goes through MSW.
 */
export function renderWithProviders(ui: ReactElement, options: Options = {}) {
  const { qc, socket, Providers } = createProviders(options)
  const user = userEvent.setup()
  return { ...render(ui, { wrapper: Providers }), user, qc, socket }
}

/** renderHook inside the same providers, for a hook no component test covers well. */
export function renderHookWithProviders<Result>(hook: () => Result, options: Options = {}) {
  const { qc, socket, Providers } = createProviders(options)
  return { ...renderHook(hook, { wrapper: Providers }), qc, socket }
}
