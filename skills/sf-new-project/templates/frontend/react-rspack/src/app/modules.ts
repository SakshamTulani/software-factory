import type { AppModule } from "@/shared/lib/app-module"

/**
 * Every module the app mounts, at /<featureId>/*. sf-new-module adds each new
 * module here: an import from "@/modules/<name>" and an entry in this list.
 */
export const modules: AppModule[] = []
