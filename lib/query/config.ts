/** React Query tuning — realtime is primary; polling is a rare fallback only. */

/** Default stale window for portal entity lists (meetings, settings). */
export const PORTAL_STALE_TIME_MS = 30_000;

/** Longer stale window for rarely edited admin config (notification recipients). */
export const STATIC_ADMIN_STALE_TIME_MS = 5 * 60 * 1000;

/** Fallback poll when no Supabase Realtime covers the resource (e.g. recipients list). */
export const FALLBACK_POLL_INTERVAL_MS = 90_000;

/** In-memory cache TTL for React Query after unmount. */
export const PORTAL_GC_TIME_MS = 10 * 60 * 1000;
