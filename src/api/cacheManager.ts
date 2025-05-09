/**
 * Interface for cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Interface for cache options
 */
export interface CacheOptions {
  /** Cache key */
  key: string;
  /** Time to live in milliseconds (default: 5 minutes) */
  ttl?: number;
  /** Whether to bypass the cache for this request (default: false) */
  bypass?: boolean;
}

/**
 * Cache manager for API requests
 */
class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Get data from cache
   * @param key Cache key
   * @returns Cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    const now = Date.now();
    
    // Check if entry has expired
    if (entry.expiresAt < now) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set data in cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  /**
   * Check if cache has a valid entry for key
   * @param key Cache key
   * @returns Whether cache has a valid entry
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    const now = Date.now();
    
    // Check if entry has expired
    if (entry.expiresAt < now) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete entry from cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all entries from cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries from cache
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size
   * @returns Number of entries in cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all cache keys
   * @returns Array of cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Generate a cache key from a URL and parameters
   * @param url The URL
   * @param params The parameters
   * @returns The cache key
   */
  generateKey(url: string, params?: any): string {
    if (!params) {
      return url;
    }
    
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);
    
    return `${url}:${JSON.stringify(sortedParams)}`;
  }
}

// Export a singleton instance
export const cacheManager = new CacheManager();
