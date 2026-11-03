---
name: react-best-practices
description: React performance rules from Vercel Engineering, adapted for a client-side React app built with Rspack. Use when writing, reviewing or refactoring React components and hooks for waterfalls, bundle size, re-renders, rendering cost or JavaScript hot paths.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

# Vercel React Best Practices

Performance rules for React applications, from Vercel's guide with its Next.js and server-rendering rules removed. Contains 56 rules across 7 categories, prioritized by impact to guide automated refactoring and code generation.

## When to Apply

Reference these guidelines when:
- Writing new React components or hooks
- Wiring data into components (in this project, through hooks over the stores in `src/data/`)
- Reviewing code for performance issues
- Refactoring existing React code
- Optimizing bundle size or load times

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` |
| 2 | Bundle Size Optimization | CRITICAL | `bundle-` |
| 3 | Client-Side Data Fetching | MEDIUM-HIGH | `client-` |
| 4 | Re-render Optimization | MEDIUM | `rerender-` |
| 5 | Rendering Performance | MEDIUM | `rendering-` |
| 6 | JavaScript Performance | LOW-MEDIUM | `js-` |
| 7 | Advanced Patterns | LOW | `advanced-` |

## Quick Reference

### 1. Eliminating Waterfalls (CRITICAL)

- `async-cheap-condition-before-await` - Check cheap sync conditions before awaiting flags or remote values
- `async-defer-await` - Move await into branches where actually used
- `async-parallel` - Use Promise.all() for independent operations
- `async-dependencies` - Use better-all for partial dependencies
- `async-suspense-boundaries` - Use Suspense to stream content

### 2. Bundle Size Optimization (CRITICAL)

- `bundle-barrel-imports` - Import directly, avoid barrel files
- `bundle-analyzable-paths` - Prefer statically analyzable import and file-system paths to avoid broad bundles and traces
- `bundle-dynamic-imports` - Use React.lazy for heavy components
- `bundle-defer-third-party` - Load analytics/logging after hydration
- `bundle-conditional` - Load modules only when feature is activated
- `bundle-preload` - Preload on hover/focus for perceived speed

### 3. Client-Side Data Fetching (MEDIUM-HIGH)

- `client-event-listeners` - Deduplicate global event listeners
- `client-passive-event-listeners` - Use passive listeners for scroll
- `client-localstorage-schema` - Version and minimize localStorage data

### 4. Re-render Optimization (MEDIUM)

- `rerender-defer-reads` - Don't subscribe to state only used in callbacks
- `rerender-memo` - Extract expensive work into memoized components
- `rerender-memo-with-default-value` - Hoist default non-primitive props
- `rerender-dependencies` - Use primitive dependencies in effects
- `rerender-derived-state` - Subscribe to derived booleans, not raw values
- `rerender-derived-state-no-effect` - Derive state during render, not effects
- `rerender-functional-setstate` - Use functional setState for stable callbacks
- `rerender-lazy-state-init` - Pass function to useState for expensive values
- `rerender-simple-expression-in-memo` - Avoid memo for simple primitives
- `rerender-split-combined-hooks` - Split hooks with independent dependencies
- `rerender-move-effect-to-event` - Put interaction logic in event handlers
- `rerender-transitions` - Use startTransition for non-urgent updates
- `rerender-use-deferred-value` - Defer expensive renders to keep input responsive
- `rerender-use-ref-transient-values` - Use refs for transient frequent values
- `rerender-no-inline-components` - Don't define components inside components

### 5. Rendering Performance (MEDIUM)

- `rendering-animate-svg-wrapper` - Animate div wrapper, not SVG element
- `rendering-content-visibility` - Use content-visibility for long lists
- `rendering-hoist-jsx` - Extract static JSX outside components
- `rendering-svg-precision` - Reduce SVG coordinate precision
- `rendering-activity` - Use Activity component for show/hide
- `rendering-conditional-render` - Use ternary, not && for conditionals
- `rendering-usetransition-loading` - Prefer useTransition for loading state
- `rendering-resource-hints` - Use React DOM resource hints for preloading
- `rendering-script-defer-async` - Use defer or async on script tags

### 6. JavaScript Performance (LOW-MEDIUM)

- `js-batch-dom-css` - Group CSS changes via classes or cssText
- `js-index-maps` - Build Map for repeated lookups
- `js-cache-property-access` - Cache object properties in loops
- `js-cache-function-results` - Cache function results in module-level Map
- `js-cache-storage` - Cache localStorage/sessionStorage reads
- `js-combine-iterations` - Combine multiple filter/map into one loop
- `js-length-check-first` - Check array length before expensive comparison
- `js-early-exit` - Return early from functions
- `js-hoist-regexp` - Hoist RegExp creation outside loops
- `js-min-max-loop` - Use loop for min/max instead of sort
- `js-set-map-lookups` - Use Set/Map for O(1) lookups
- `js-tosorted-immutable` - Use toSorted() for immutability
- `js-flatmap-filter` - Use flatMap to map and filter in one pass
- `js-request-idle-callback` - Defer non-critical work to browser idle time

### 7. Advanced Patterns (LOW)

- `advanced-effect-event-deps` - Don't put `useEffectEvent` results in effect deps
- `advanced-event-handler-refs` - Store event handlers in refs
- `advanced-init-once` - Initialize app once per app load
- `advanced-use-latest` - useLatest for stable callback refs

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/async-parallel.md
rules/bundle-barrel-imports.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references

## This project

- **Data fetching goes through the stores.** Components never fetch; they read a store's query through hooks built on `useQuery` from `@/bindings/react` (see `frontend-architecture`). The shared cache in `src/data/core` already de-duplicates requests, which is why upstream's SWR rule was removed.
- **Real-time updates arrive through the store,** which buffers socket deltas and applies them in one update. For re-render cost, select one item with `useQuerySelector` in the hook rather than memoising in the component (`rerender-derived-state`).
- **Code splitting:** lazy-load heavy components and module routes with `React.lazy` (`bundle-dynamic-imports`); use `rspack-split-chunks` when tuning chunks.
