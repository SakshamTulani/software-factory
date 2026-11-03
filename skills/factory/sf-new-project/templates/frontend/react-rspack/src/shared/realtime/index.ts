import { env } from "@/shared/config/env"
import { createRealtimeConnection } from "./connection"

export type { RealtimeConnection, RealtimeMessage, RealtimeStatus } from "./connection"
export { createRealtimeConnection } from "./connection"

/** The app's single connection. src/app connects it; createStores passes it to the stores that stream. */
export const realtime = createRealtimeConnection(env.PUBLIC_WS_URL)
