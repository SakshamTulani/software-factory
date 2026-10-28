import {
  WsFmsMsgClient,
  type WsFmsSubscriptionMessage,
} from "fmswsclientjs/wsfmsmsgclient/wsfmsmsgclient.js"

export type RealtimeMessage = WsFmsSubscriptionMessage
export type RealtimeStatus = "active" | "inactive"

/**
 * The app's one WebSocket. A module's realtime/ layer subscribes to the
 * (channel, topic) pairs it needs and receives only those messages.
 */
export interface RealtimeConnection {
  connect(): void
  disconnect(): void
  /** Returns the unsubscribe function. Safe to call it more than once. */
  subscribe(
    channel: string,
    topic: string,
    onMessage: (message: RealtimeMessage) => void
  ): () => void
  onStatus(listener: (status: RealtimeStatus) => void): () => void
  status(): RealtimeStatus
}

/** The part of WsFmsMsgClient this file uses, so tests can pass a stand-in. */
export type WsClientLike = Pick<
  WsFmsMsgClient,
  "Connect" | "Disconnect" | "Subscribe" | "UnSubscribe"
>
export type WsClientFactory = (
  onMessage: (message: WsFmsSubscriptionMessage) => void,
  onState: (state: string) => void
) => WsClientLike

const key = (channel: string, topic: string) => `${channel}\u0000${topic}`

/**
 * Wraps fmswsclientjs. The client itself keeps its subscriptions and re-sends
 * them after a reconnect; this adds routing by (channel, topic) and reference
 * counting, because the client drops a topic on the first UnSubscribe.
 */
export function createRealtimeConnection(
  url: string,
  createClient: WsClientFactory = (onMessage, onState) =>
    new WsFmsMsgClient(url, onMessage, onState, {
      heartbeatinterval: 30_000,
      activenodatatimeout: 120_000,
    })
): RealtimeConnection {
  const handlers = new Map<string, Set<(message: RealtimeMessage) => void>>()
  const statusListeners = new Set<(status: RealtimeStatus) => void>()
  let current: RealtimeStatus = "inactive"

  const client = createClient(
    (message) => {
      for (const handler of handlers.get(key(message.channel, message.topic)) ?? []) {
        try {
          handler(message)
        } catch (error) {
          console.error(`realtime handler failed for ${message.channel}/${message.topic}`, error)
        }
      }
    },
    (state) => {
      current = state === WsFmsMsgClient.STATE_ACTIVE ? "active" : "inactive"
      for (const listener of statusListeners) listener(current)
    }
  )

  return {
    connect: () => client.Connect(),
    disconnect: () => client.Disconnect(),
    subscribe(channel, topic, onMessage) {
      const k = key(channel, topic)
      let set = handlers.get(k)
      if (!set) {
        set = new Set()
        handlers.set(k, set)
        client.Subscribe(channel, topic)
      }
      set.add(onMessage)
      let done = false
      return () => {
        if (done) return
        done = true
        set.delete(onMessage)
        if (set.size === 0) {
          handlers.delete(k)
          client.UnSubscribe(channel, topic)
        }
      }
    },
    onStatus(listener) {
      statusListeners.add(listener)
      return () => statusListeners.delete(listener)
    },
    status: () => current,
  }
}
