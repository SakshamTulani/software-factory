import type { AppModule } from "@/shared/lib/app-module"

import { CommandCenterPage } from "./ui/CommandCenterPage"

/**
 * The template's worked example: a screen that reads two stores (commands and
 * vehicles) and app state (the selected fleet). Replace it with the project's
 * first module, or delete it with the example domains in src/data/.
 */
export const commandCenterModule: AppModule = {
  featureId: "command-center",
  title: "Command center",
  routes: [
    { index: true, element: <CommandCenterPage /> },
    { path: ":vehicleId", element: <CommandCenterPage /> },
  ],
}
