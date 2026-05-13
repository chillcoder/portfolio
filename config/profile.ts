/**
 * Re-export shim. Static portfolio content moved to `lib/portfolio-data.ts`
 * so it can be shared between the bento route (`/`) and the OS route
 * (`/os`). All existing imports of `@/config/profile` continue to work
 * unchanged.
 */
export * from "@/lib/portfolio-data";
