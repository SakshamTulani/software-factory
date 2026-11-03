import { RouterProvider } from "react-router-dom"

import { DataProvider } from "@/bindings/react"
import { createStores } from "@/data"
import { httpClient } from "@/shared/api"
import { realtime } from "@/shared/realtime"
import { createAppState } from "@/state"

import { router } from "./router"
import { syncFleetWithUrl } from "./syncFleetWithUrl"

// The composition root: stores and app state are built once, before the first render.
// The WebSocket is not opened here: call realtime.connect() once the user is
// signed in and the backend expects it.
const stores = createStores({ http: httpClient, realtime })
const state = createAppState()
syncFleetWithUrl(state)

export function App() {
  return (
    <DataProvider stores={stores} state={state}>
      <RouterProvider router={router} />
    </DataProvider>
  )
}
