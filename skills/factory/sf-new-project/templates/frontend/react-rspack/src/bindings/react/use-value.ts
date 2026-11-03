import { useSyncExternalStore } from "react"

import type { State } from "@/state"

/** The current value of one piece of app state, such as the selected fleet. */
export function useValue<T>(state: State<T>): T {
  return useSyncExternalStore(state.subscribe, state.get)
}
