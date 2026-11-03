import type { AppState } from "@/state"

/** Keeps ?fleet= and the selected fleet in step, so a reload or a shared link keeps the fleet. */
export function syncFleetWithUrl(state: AppState): () => void {
  const fromUrl = new URLSearchParams(window.location.search).get("fleet")
  if (fromUrl) state.selectedFleetId.set(fromUrl)

  return state.selectedFleetId.subscribe(() => {
    const url = new URL(window.location.href)
    const fleetId = state.selectedFleetId.get()
    if (fleetId) url.searchParams.set("fleet", fleetId)
    else url.searchParams.delete("fleet")
    window.history.replaceState(window.history.state, "", url)
  })
}
