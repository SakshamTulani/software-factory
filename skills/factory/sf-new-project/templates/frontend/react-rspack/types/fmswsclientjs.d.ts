declare module "fmswsclientjs/wsfmsmsgclient/wsfmsmsgclient.js" {
  export type WsFmsSubscriptionMessage = {
    channel: string
    topic: string
    payload: Uint8Array
  }

  export class WsFmsMsgClient {
    static STATE_ACTIVE: string
    static STATE_INACTIVE: string

    constructor(
      baseurl: string,
      recvcallback: (message: WsFmsSubscriptionMessage) => void,
      statecallback: (state: string) => void,
      opts: Record<string, unknown>
    )

    Connect(): void
    Disconnect(): void
    Subscribe(channel: string, topic: string): void
    UnSubscribe(channel: string, topic: string): void
    UpdateOpts(opts: Record<string, unknown>): void
  }
}
