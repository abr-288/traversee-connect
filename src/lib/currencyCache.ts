/**
 * Currency conversion cache with TTL
 * Reduces API calls by caching exchange rates
 */

interface CachedRate {
  rate: number;
  converted: number;
  timestamp: number;
}

interface CurrencyCache {
  [key: string]: CachedRate;
}

const CACHE_KEY = 'currency_exchange_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Generate cache key from conversion parameters
 */
function getCacheKey(from: string, to: string, amount: number): string {
  return `${from}_${to}_${amount}`;
}

/**
 * Check if cached value is still valid (not expired)
 */
function isValidCache(cachedItem: CachedRate): boolean {
  const now = Date.now();
  return (now - cachedItem.timestamp) < CACHE_TTL;
}

/**
 * Get cached conversion if available and valid
 */
export function getCachedConversion(
  from: string,
  to: string,
  amount: number
): { rate: number; converted: number } | null {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return null;

    const cache: CurrencyCache = JSON.parse(cacheStr);
    const key = getCacheKey(from, to, amount);
    const cachedItem = cache[key];

    if (cachedItem && isValidCache(cachedItem)) {
      console.log('✓ Using cached currency conversion:', key);
      return {
        rate: cachedItem.rate,
        converted: cachedItem.converted,
      };
    }

    return null;
  } catch (error) {
    console.error('Error reading currency cache:', error);
    return null;
  }
}

/**
 * Store conversion result in cache
 */
export function setCachedConversion(
  from: string,
  to: string,
  amount: number,
  rate: number,
  converted: number
): void {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    const cache: CurrencyCache = cacheStr ? JSON.parse(cacheStr) : {};

    const key = getCacheKey(from, to, amount);
    cache[key] = {
      rate,
      converted,
      timestamp: Date.now(),
    };

    // Clean expired entries to prevent cache bloat
    cleanExpiredCache(cache);

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log('✓ Cached currency conversion:', key);
  } catch (error) {
    console.error('Error storing currency cache:', error);
  }
}

/**
 * Remove expired cache entries
 */
function cleanExpiredCache(cache: CurrencyCache): void {
  const now = Date.now();
  let cleaned = 0;

  Object.keys(cache).forEach((key) => {
    if ((now - cache[key].timestamp) >= CACHE_TTL) {
      delete cache[key];
      cleaned++;
    }
  });

  if (cleaned > 0) {
    console.log(`✓ Cleaned ${cleaned} expired cache entries`);
  }
}

/**
 * Clear all cached conversions
 */
export function clearCurrencyCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('✓ Currency cache cleared');
  } catch (error) {
    console.error('Error clearing currency cache:', error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
} {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) {
      return { totalEntries: 0, validEntries: 0, expiredEntries: 0 };
    }

    const cache: CurrencyCache = JSON.parse(cacheStr);
    const entries = Object.values(cache);
    const validEntries = entries.filter(isValidCache).length;

    return {
      totalEntries: entries.length,
      validEntries,
      expiredEntries: entries.length - validEntries,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { totalEntries: 0, validEntries: 0, expiredEntries: 0 };
  }
}
