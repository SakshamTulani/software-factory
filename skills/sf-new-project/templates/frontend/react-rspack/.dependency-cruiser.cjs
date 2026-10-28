/**
 * Architecture rules for the react-rspack template.
 *
 * Each module under src/modules/<name>/ is a vertical slice in three tiers.
 * A tier may import from the tiers below it, never from the tiers above:
 *
 *   PRESENTATION   ui → hooks
 *   BUSINESS       model.ts           (pure business rules)
 *   DATA ACCESS    store → repository → api
 *                    │  └─→ realtime ─→ mappers
 *   ─────────────────────────────────────────────
 *   CONTRACT       types.ts           (domain entity types, no logic; every tier may use it)
 *
 * - Data access never imports business logic: store, repository, realtime, mappers and
 *   api must not import model.ts. Business hooks apply model.ts to store data.
 * - api owns the raw REST calls and their DTO types; mappers turn DTOs (REST and WS)
 *   into types.ts entities and merge WS deltas.
 * - store is the single source of truth: it writes REST results and WS deltas into
 *   the TanStack Query cache. Only store and hooks may touch TanStack Query.
 * - Other modules may import only through a module's index.ts.
 *
 * Test files are exempt from the layer rules (a store test needs fakes of lower layers).
 */

const MODULE = "^src/modules/([^/]+)/"
const TEST = "\\.test\\.tsx?$"

// Paths of each layer *within the same module* as the importer ($1).
const LAYER_PATH = {
  api: "api/",
  mappers: "mappers/",
  repository: "repository/",
  realtime: "realtime/",
  store: "store/",
  hooks: "hooks/",
  ui: "ui/",
  model: "model(\\.ts$|/)",
  types: "types(\\.ts$|/)",
}

const ALL = Object.keys(LAYER_PATH)
const except = (...allowed) => ALL.filter((l) => !allowed.includes(l))

function layerRule(from, forbidden, comment) {
  return {
    name: `layer-${from}`,
    severity: "error",
    comment,
    from: { path: `${MODULE}${LAYER_PATH[from]}`, pathNot: TEST },
    to: {
      path: `^src/modules/$1/(${forbidden.map((l) => LAYER_PATH[l]).join("|")})`,
    },
  }
}

module.exports = {
  forbidden: [
    layerRule(
      "types",
      except("types"),
      "types.ts is the contract every tier shares: entity types only, importing nothing from the module."
    ),
    layerRule(
      "model",
      except("model", "types"),
      "model.ts holds pure business rules over types.ts entities."
    ),
    layerRule(
      "api",
      except("api"),
      "api does raw HTTP and owns its DTO types. Convert DTOs in mappers/."
    ),
    layerRule(
      "mappers",
      except("mappers", "api", "types"),
      "mappers turn api/ DTOs and WS payloads into types.ts entities. Data access never imports model.ts."
    ),
    layerRule(
      "repository",
      except("repository", "api", "mappers", "types"),
      "repository combines api + mappers and returns types.ts entities. Data access never imports model.ts."
    ),
    layerRule(
      "realtime",
      except("realtime", "mappers", "types"),
      "realtime subscribes to WS topics and emits mapped entities. It knows nothing about the cache."
    ),
    layerRule(
      "store",
      except("store", "repository", "realtime", "mappers", "types"),
      "store reaches data through repository/ and realtime/, merging deltas with mappers/. Data access never imports model.ts."
    ),
    layerRule(
      "hooks",
      except("hooks", "store", "model", "types"),
      "hooks read data through the store's query options and apply model.ts rules."
    ),
    layerRule(
      "ui",
      except("ui", "hooks", "model", "types"),
      "Components get data from hooks/, never from the store or the network."
    ),
    {
      name: "business-and-types-are-pure",
      severity: "error",
      comment: "model.ts and types.ts must not depend on React, TanStack Query or the WS client.",
      from: { path: `${MODULE}(${LAYER_PATH.model}|${LAYER_PATH.types})` },
      to: { path: "node_modules/(react|react-dom|@tanstack|fmswsclientjs)/" },
    },
    {
      name: "query-only-in-store-and-hooks",
      severity: "error",
      comment: "Only store/ and hooks/ may use TanStack Query. Components call a hook.",
      from: {
        path: "^src/",
        pathNot: [`${MODULE}(store|hooks)/`, "^src/app/", TEST],
      },
      to: { path: "node_modules/@tanstack/(react-query|query-core)/" },
    },
    {
      name: "ws-client-only-in-realtime",
      severity: "error",
      comment: "Only realtime/ (and the shared socket setup) may use the WS client.",
      from: {
        path: "^src/",
        pathNot: [`${MODULE}realtime/`, "^src/shared/realtime/", "^src/app/", TEST],
      },
      to: { path: "node_modules/fmswsclientjs/" },
    },
    {
      name: "cross-module-via-index",
      severity: "error",
      comment: "Import another module only through its index.ts.",
      from: { path: MODULE },
      to: {
        path: "^src/modules/[^/]+/",
        pathNot: ["^src/modules/$1/", "^src/modules/[^/]+/index\\.tsx?$"],
      },
    },
    {
      name: "shared-is-leaf",
      severity: "error",
      comment: "shared/ is used by modules; it must not import modules or app.",
      from: { path: "^src/shared/" },
      to: { path: "^src/(modules|app)/" },
    },
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "not-to-unresolvable",
      severity: "error",
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: "no-orphans",
      severity: "warn",
      from: {
        orphan: true,
        pathNot: ["\\.d\\.ts$", TEST, "(^|/)\\.[^/]+\\.(c?js|json)$"],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "(^|/)(dist|coverage)/" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
}
