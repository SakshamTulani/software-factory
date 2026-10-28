import { pluginReact } from "@rsbuild/plugin-react"
import { withRspackConfig } from "@rstest/adapter-rspack"
import { defineConfig } from "@rstest/core"

// Tests build with the app's own rspack.config.ts (aliases, defines), so the
// two can't drift. See the rstest-best-practices skill.
export default defineConfig({
  extends: withRspackConfig(),
  plugins: [pluginReact()],
  testEnvironment: "happy-dom",
  setupFiles: ["./src/test/setup.ts"],
  include: ["src/**/*.test.{ts,tsx}"],
  restoreMocks: true,
})
