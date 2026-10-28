import { z } from "zod"

/**
 * Browser configuration, inlined at build time from PUBLIC_* variables
 * (.env, .env.local or the OS environment; see .env.example). Fails fast at
 * startup when one is missing, instead of failing later on first use.
 */
const schema = z.object({
  PUBLIC_API_URL: z.url().default("http://localhost:8080"),
  PUBLIC_WS_URL: z.url().default("ws://localhost:8081"),
})

export const env = schema.parse({
  PUBLIC_API_URL: process.env.PUBLIC_API_URL,
  PUBLIC_WS_URL: process.env.PUBLIC_WS_URL,
})
