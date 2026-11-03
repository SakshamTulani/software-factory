/**
 * Architecture rules for the react-rspack template (the frontend-architecture skill).
 *
 *   src/app/        composition root: builds stores and app state, mounts modules
 *   src/modules/    features: ui → hooks → model.ts
 *   src/bindings/   the only React glue for stores and app state
 *   src/data/       server state, plain TypeScript, one folder per backend domain:
 *                     <domain>Store → <domain>Mappers → types.ts
 *                     core/ (the cache), events.ts, stores.ts (createStores)
 *   src/state/      app state (what the user picked), plain TypeScript
 *   src/shared/     infrastructure with no domain knowledge
 *
 * - Data never imports business logic, React, app state or features.
 * - Outside src/data/, import it only through @/data (src/data/index.ts).
 * - A domain imports another domain only through that domain's index.ts.
 * - Components read data through hooks; ui/ and model.ts may import entity types only.
 *
 * Test files are exempt from the layer rules (a test needs builders and fakes).
 */

const MODULE = "^src/modules/([^/]+)/"
const DOMAIN = "^src/data/([^/]+)/"
const TEST = "\\.test\\.tsx?$"
const FRAMEWORK =
  "node_modules/(react|react-dom|react-router|react-router-dom|@radix-ui|radix-ui|ag-grid-[^/]+)/"

module.exports = {
  forbidden: [
    // ── modules: ui → hooks → model.ts ──
    {
      name: "module-ui",
      severity: "error",
      comment:
        "Components get data from hooks/, never from @/bindings or a store. They may import entity types from @/data.",
      from: { path: `${MODULE}ui/`, pathNot: TEST },
      to: { path: "^src/(bindings|state)/" },
    },
    {
      name: "module-ui-types-only",
      severity: "error",
      comment: "Components may import entity types from @/data, never a store or createStores.",
      from: { path: `${MODULE}ui/`, pathNot: TEST },
      to: { path: "^src/data/", dependencyTypesNot: ["type-only"] },
    },
    {
      name: "module-hooks",
      severity: "error",
      comment: "hooks read stores and app state through @/bindings/react and apply model.ts.",
      from: { path: `${MODULE}hooks/`, pathNot: TEST },
      to: { path: `^src/modules/$1/ui/` },
    },
    {
      name: "module-model",
      severity: "error",
      comment:
        "model.ts holds pure business rules over entity types: no React, no stores, no hooks, no ui.",
      from: { path: `${MODULE}model(\\.ts$|/)`, pathNot: TEST },
      to: { path: `^src/(modules/$1/(ui|hooks)/|bindings/|state/|app/)` },
    },
    {
      name: "module-model-types-only",
      severity: "error",
      comment: "model.ts may import entity types from @/data, never a store.",
      from: { path: `${MODULE}model(\\.ts$|/)`, pathNot: TEST },
      to: { path: "^src/data/", dependencyTypesNot: ["type-only"] },
    },
    {
      name: "module-model-pure",
      severity: "error",
      comment: "model.ts must not depend on React or the WS client.",
      from: { path: `${MODULE}model(\\.ts$|/)` },
      to: { path: `${FRAMEWORK}|node_modules/fmswsclientjs/` },
    },

    // ── data: plain TypeScript, by domain ──
    {
      name: "data-is-plain",
      severity: "error",
      comment:
        "src/data/ is server state in plain TypeScript: no React, no UI library, no app state, no features. Bindings live in src/bindings/.",
      from: { path: "^src/data/" },
      to: { path: `${FRAMEWORK}|^src/(modules|app|bindings|state)/` },
    },
    {
      name: "data-never-imports-business-logic",
      severity: "error",
      comment: "Stores and mappers never import model.ts; business hooks apply it to store data.",
      from: { path: "^src/data/" },
      to: { path: "^src/modules/[^/]+/model(\\.ts$|/)" },
    },
    {
      name: "data-via-index",
      severity: "error",
      comment: "Outside src/data/, import the data layer only through @/data.",
      from: { path: "^src/", pathNot: ["^src/data/", "^src/test/", TEST] },
      to: { path: "^src/data/", pathNot: "^src/data/index\\.ts$" },
    },
    {
      name: "domain-via-index",
      severity: "error",
      comment:
        "A domain imports another domain only through its index.ts. Writes affecting another domain go through events.ts.",
      from: { path: DOMAIN, pathNot: ["^src/data/core/", TEST] },
      to: {
        path: "^src/data/[^/]+/",
        pathNot: ["^src/data/$1/", "^src/data/[^/]+/index\\.ts$", "^src/data/core/"],
      },
    },
    {
      name: "mappers-only-types",
      severity: "error",
      comment: "Mappers are pure conversion: they import only their domain's types.ts.",
      from: { path: `${DOMAIN}[^/]*Mappers\\.ts$` },
      to: { path: "^src/", pathNot: "^src/data/$1/types\\.ts$" },
    },
    {
      name: "schemas-only-types",
      severity: "error",
      comment:
        "schemas.ts describes valid write inputs: it imports only zod and its domain's types.ts.",
      from: { path: `${DOMAIN}schemas\\.ts$` },
      to: { path: "^src/", pathNot: "^src/data/$1/types\\.ts$" },
    },
    {
      name: "domain-types-import-nothing",
      severity: "error",
      comment: "types.ts is the contract every tier shares: entity types only.",
      from: { path: `${DOMAIN}types\\.ts$` },
      to: { path: "^src/" },
    },
    {
      name: "core-is-self-contained",
      severity: "error",
      comment: "src/data/core/ is the shared cache. It knows nothing about domains or the app.",
      from: { path: "^src/data/core/", pathNot: TEST },
      to: { path: "^src/", pathNot: "^src/data/core/" },
    },

    // ── state, bindings, shared ──
    {
      name: "state-is-plain",
      severity: "error",
      comment: "src/state/ is app state in plain TypeScript and imports nothing else from src/.",
      from: { path: "^src/state/", pathNot: TEST },
      to: { path: `${FRAMEWORK}|^src/(?!state/)` },
    },
    {
      name: "bindings-know-no-features",
      severity: "error",
      comment: "src/bindings/ connects React to stores and app state; it knows no module or app.",
      from: { path: "^src/bindings/" },
      to: { path: "^src/(modules|app)/" },
    },
    {
      name: "ws-client-only-in-shared-realtime",
      severity: "error",
      comment:
        "Only src/shared/realtime/ uses the WS client. Stores receive the connection in createStores.",
      from: { path: "^src/", pathNot: ["^src/shared/realtime/", TEST] },
      to: { path: "node_modules/fmswsclientjs/" },
    },
    {
      name: "date-fns-only-in-format",
      severity: "error",
      comment:
        "Format and parse dates for display with @/shared/lib/format, so every screen shows them the same way.",
      from: { path: "^src/", pathNot: ["^src/shared/lib/format\\.ts$", TEST] },
      to: { path: "node_modules/date-fns/" },
    },
    {
      name: "ag-grid-only-in-data-grid",
      severity: "error",
      comment:
        "Render tables through DataGrid (@/shared/ui/data-grid) so every grid shares the theme, modules and defaults.",
      from: { path: "^src/", pathNot: ["^src/shared/ui/data-grid/", TEST] },
      to: { path: "node_modules/(ag-grid-community|ag-grid-react)/" },
    },
    {
      name: "no-ag-grid-enterprise",
      severity: "error",
      comment:
        "AG Grid Enterprise needs a commercial licence the project doesn't have. Use Community features only.",
      from: {},
      to: { path: "ag-grid-enterprise" },
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
      name: "testing-only-in-tests",
      severity: "error",
      comment:
        "testing.ts holds test builders and fakes (frontend-testing). Only tests and src/test/ import it.",
      from: { path: "^src/", pathNot: [TEST, "^src/test/", "(^|/)testing\\.ts$"] },
      to: { path: "(^|/)testing\\.ts$" },
    },
    {
      name: "shared-is-leaf",
      severity: "error",
      comment:
        "shared/ is infrastructure: it must not import data, state, bindings, modules or app.",
      from: { path: "^src/shared/" },
      to: { path: "^src/(modules|app|data|state|bindings)/" },
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
        // Test setup and shared helpers (cn, the fake socket) exist before anything imports them.
        pathNot: ["\\.d\\.ts$", TEST, "(^|/)\\.[^/]+\\.(c?js|json)$", "^src/test/", "^src/shared/"],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "^(dist|coverage)/" },
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
