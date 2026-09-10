interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Simple in-memory TTL cache to protect the free 100k queries/month quota
 * during local development (hot reloads, repeated demo clicks).
 */
export class TtlCache {
  private store = new Map<string, CacheEntry<unknown>>();

  constructor(private defaultTtlMs = 60_000) {}

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs = this.defaultTtlMs): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  clear(): void {
    this.store.clear();
  }
}

export const queryCache = new TtlCache(60_000);
