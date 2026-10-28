import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/** Merge Tailwind classes; shadcn components import this. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
