import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"

import { type AppDeps, ModuleProviders } from "@/shared/lib/app-module"
import { realtime } from "@/shared/realtime"

import { modules } from "./modules"
import { queryClient } from "./queryClient"
import { router } from "./router"

// The WebSocket is not opened here: call realtime.connect() once the user is
// signed in and the backend expects it.
const deps: AppDeps = { qc: queryClient, realtime }

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ModuleProviders modules={modules} deps={deps}>
        <RouterProvider router={router} />
      </ModuleProviders>
    </QueryClientProvider>
  )
}
