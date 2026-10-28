import { describe, expect, it, vi } from "vitest"

import { createRealtimeConnection, type WsClientLike } from "./connection"
import { createFakeRealtimeConnection } from "./testing"

function stubClient() {
  let deliver: (m: { channel: string; topic: string; payload: Uint8Array }) => void = () => {}
  let setState: (s: string) => void = () => {}
  const client: WsClientLike = {
    Connect: vi.fn(),
    Disconnect: vi.fn(),
    Subscribe: vi.fn(),
    UnSubscribe: vi.fn(),
  }
  const connection = createRealtimeConnection("ws://test", (onMessage, onState) => {
    deliver = onMessage
    setState = onState
    return client
  })
  const send = (channel: string, topic: string) =>
    deliver({ channel, topic, payload: new Uint8Array() })
  return { client, connection, send, setState: (s: string) => setState(s) }
}

describe("createRealtimeConnection", () => {
  it("delivers a message only to subscribers of its channel and topic", () => {
    const { connection, send } = stubClient()
    const a = vi.fn()
    const b = vi.fn()
    connection.subscribe("pubsub", "vehicle.1", a)
    connection.subscribe("pubsub", "vehicle.2", b)

    send("pubsub", "vehicle.1")

    expect(a).toHaveBeenCalledTimes(1)
    expect(b).not.toHaveBeenCalled()
  })

  it("subscribes on the server once per topic and unsubscribes after the last subscriber leaves", () => {
    const { client, connection } = stubClient()
    const first = connection.subscribe("pubsub", "vehicle.1", vi.fn())
    const second = connection.subscribe("pubsub", "vehicle.1", vi.fn())
    expect(client.Subscribe).toHaveBeenCalledTimes(1)

    first()
    first()
    expect(client.UnSubscribe).not.toHaveBeenCalled()

    second()
    expect(client.UnSubscribe).toHaveBeenCalledWith("pubsub", "vehicle.1")
  })

  it("keeps delivering to other subscribers when one handler throws", () => {
    const { connection, send } = stubClient()
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const healthy = vi.fn()
    connection.subscribe("pubsub", "vehicle.1", () => {
      throw new Error("boom")
    })
    connection.subscribe("pubsub", "vehicle.1", healthy)

    send("pubsub", "vehicle.1")

    expect(healthy).toHaveBeenCalledTimes(1)
    error.mockRestore()
  })

  it("reports the client's state as active or inactive", () => {
    const { connection, setState } = stubClient()
    const seen: string[] = []
    connection.onStatus((s) => seen.push(s))

    setState("ACTIVE")
    setState("INACTIVE")

    expect(seen).toEqual(["active", "inactive"])
    expect(connection.status()).toBe("inactive")
  })
})

describe("createFakeRealtimeConnection", () => {
  it("decodes emitted payloads the way the real connection delivers them", () => {
    const fake = createFakeRealtimeConnection()
    const received: unknown[] = []
    fake.subscribe("pubsub", "vehicle.1", (m) =>
      received.push(JSON.parse(new TextDecoder().decode(m.payload)))
    )

    fake.emit("pubsub", "vehicle.1", { speed: 42 })

    expect(received).toEqual([{ speed: 42 }])
    expect(fake.subscriptions()).toEqual(["pubsub/vehicle.1"])
  })
})
