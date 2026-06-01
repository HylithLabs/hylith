export const CACHE_TTL_SECONDS = {
  availabilitySlots: 300,
  rbacPermissions: 3600,
  sessionMetadata: 60 * 60 * 24 * 30,
  meetingsAdminList: 600,
  swrSoft: 120,
} as const;

export const CACHE_KEYS = {
  availabilitySlots: (date: string) => `cache:availability:${date}`,
  userPermissions: (userId: string) => `cache:user:permissions:${userId}`,
  userSession: (sessionId: string) => `cache:user:session:${sessionId}`,
  meetingsAdmin: () => 'cache:meetings:admin',
  swrLock: (key: string) => `cache:swr:lock:${key}`,
  wsOfflineUser: (userId: string) => `ws:offline:user:${userId}`,
} as const;
