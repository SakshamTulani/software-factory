import axios from "axios"

import { env } from "@/shared/config/env"

/**
 * The one HTTP client. A module's api/ layer calls it and returns the
 * response body typed as that module's DTO; nothing else does HTTP.
 */
const instance = axios.create({ baseURL: env.PUBLIC_API_URL, timeout: 30_000 })

let authToken: string | null = null

/** Set after sign-in; sent as a Bearer token on every request. */
export function setAuthToken(token: string | null) {
  authToken = token
}

instance.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`
  return config
})

type RequestOptions = { signal?: AbortSignal }

export const httpClient = {
  get: async <T>(url: string, opts?: RequestOptions) => (await instance.get<T>(url, opts)).data,
  post: async <T>(url: string, body?: unknown, opts?: RequestOptions) =>
    (await instance.post<T>(url, body, opts)).data,
  put: async <T>(url: string, body?: unknown, opts?: RequestOptions) =>
    (await instance.put<T>(url, body, opts)).data,
  patch: async <T>(url: string, body?: unknown, opts?: RequestOptions) =>
    (await instance.patch<T>(url, body, opts)).data,
  delete: async <T>(url: string, opts?: RequestOptions) =>
    (await instance.delete<T>(url, opts)).data,
}

/** The shape stores take in their deps, so tests and other clients can stand in. */
export type HttpClient = typeof httpClient
