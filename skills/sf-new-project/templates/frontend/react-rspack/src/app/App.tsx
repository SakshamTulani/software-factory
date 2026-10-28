import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"

import { queryClient } from "./queryClient"
import { router } from "./router"

// The WebSocket (`realtime` from @/shared/realtime) is not opened here: call
// realtime.connect() once the user is signed in and the backend expects it.

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
