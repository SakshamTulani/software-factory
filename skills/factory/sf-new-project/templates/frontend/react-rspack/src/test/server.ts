import { setupServer } from "msw/node"

import { env } from "@/shared/config/env"

/**
 * The one MSW server. It starts with no handlers: each test declares the
 * endpoints it relies on with server.use(), so a test reads as its own story.
 * setup.ts fails any request no handler answers (MSW 3: onUnhandledFrame).
 */
export const server = setupServer()

/** The absolute URL httpClient calls for an API path, for MSW handlers. */
export function apiUrl(path: string) {
  return `${env.PUBLIC_API_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`
}
