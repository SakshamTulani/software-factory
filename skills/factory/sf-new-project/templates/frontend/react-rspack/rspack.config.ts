import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { defineConfig } from "@rspack/cli"
import { DefinePlugin, HtmlRspackPlugin, type SwcLoaderOptions } from "@rspack/core"
import { ReactRefreshRspackPlugin } from "@rspack/plugin-react-refresh"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV === "development"

const fromFile = (file: string) =>
  fs.existsSync(file)
    ? fs
        .readFileSync(file, "utf8")
        .split("\n")
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const [key, ...rest] = line.split("=")
          return [key?.trim() ?? "", rest.join("=").trim()] as const
        })
    : []

/** `.env` then `.env.local`, OS env last. Only `PUBLIC_*` reaches the browser. */
function publicEnv(): Record<string, string> {
  const merged = Object.fromEntries([
    ...fromFile(path.resolve(__dirname, ".env")),
    ...fromFile(path.resolve(__dirname, ".env.local")),
    ...Object.entries(process.env).map(([k, v]) => [k, v ?? ""] as const),
  ])
  return Object.fromEntries(Object.entries(merged).filter(([k]) => k.startsWith("PUBLIC_")))
}

/**
 * What the browser bundle sees for each `process.env.PUBLIC_*`. Every name in
 * `.env.example` is defined, as `undefined` when unset or blank, so `src/shared/config/env.ts`
 * falls back to its default instead of the browser failing on `process`. A new
 * PUBLIC_* variable goes in `.env.example` too.
 */
function publicDefines(): Record<string, string> {
  const values = publicEnv()
  const declared = fromFile(path.resolve(__dirname, ".env.example"))
    .map(([key]) => key)
    .filter((key) => key.startsWith("PUBLIC_"))
  const names = new Set([...declared, ...Object.keys(values)])
  return Object.fromEntries(
    [...names].map((name) => [
      `process.env.${name}`,
      values[name] ? JSON.stringify(values[name]) : "undefined",
    ])
  )
}

const swc = (tsx: boolean): SwcLoaderOptions => ({
  detectSyntax: "auto",
  ...(tsx && {
    jsc: { transform: { react: { runtime: "automatic", development: isDev, refresh: isDev } } },
  }),
})

export default defineConfig({
  entry: { main: "./src/main.tsx" },
  target: ["browserslist:last 2 versions, > 0.2%, not dead, Firefox ESR"],
  resolve: {
    extensions: ["...", ".ts", ".tsx"],
    alias: { "@": path.resolve(__dirname, "src") },
  },
  module: {
    rules: [
      { test: /\.(?:js|mjs|cjs|ts|mts|cts)$/, loader: "builtin:swc-loader", options: swc(false) },
      { test: /\.(?:jsx|tsx)$/, loader: "builtin:swc-loader", options: swc(true) },
      { test: /\.css$/, use: ["postcss-loader"], type: "css" },
      { test: /\.(?:png|jpe?g|gif|webp|avif|ico|svg)$/, type: "asset" },
    ],
  },
  plugins: [
    new HtmlRspackPlugin({ template: "./index.html" }),
    new DefinePlugin(publicDefines()),
    isDev && new ReactRefreshRspackPlugin(),
  ],
  devServer: { port: 3000, historyApiFallback: true, hot: true },
  output: { publicPath: "/", clean: true },
})
