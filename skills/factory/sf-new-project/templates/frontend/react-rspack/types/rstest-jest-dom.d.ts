// jest-dom ships typings for Vitest, Jest and Bun but not Rstest. This mirrors
// its vitest.d.ts, so matchers registered in src/test/setup.ts type-check.
import "@rstest/core"
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers"

declare module "@rstest/core" {
  // biome-ignore lint/suspicious/noExplicitAny: the matcher type parameter is any upstream too
  interface Assertion<T = any> extends TestingLibraryMatchers<any, T> {}
}
