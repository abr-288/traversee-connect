// IP-based rate limiting for Supabase Edge Functions
// Uses in-memory store with sliding window algorithm

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (resets on function cold start, which is acceptable for rate limiting)
const ipStore: Map<string, RateLimitEntry> = new Map();

// Cleanup old entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  for (const [key, entry] of ipStore.entries()) {
    if (entry.resetAt < now) {
      ipStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  windowMs: number;     // Time window in milliseconds
  maxRequests: number;  // Max requests per window
  keyPrefix?: string;   // Optional prefix for the key
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
}

/**
 * Extract client IP from request headers
 * Supports various proxy headers used by Cloudflare, AWS, etc.
 */
export function getClientIP(req: Request): string {
  // Priority order for IP detection
  const headers = [
    'cf-connecting-ip',      // Cloudflare
    'x-real-ip',             // Nginx
    'x-forwarded-for',       // Standard proxy header
    'x-client-ip',           // Apache
    'true-client-ip',        // Akamai
    'x-cluster-client-ip',   // Rackspace
  ];

  for (const header of headers) {
    const value = req.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(',')[0].trim();
      if (ip) return ip;
    }
  }

  // Fallback to a default identifier
  return 'unknown';
}

/**
 * Check if a request is within rate limits
 * @param ip - Client IP address
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(ip: string, config: RateLimitConfig): RateLimitResult {
  cleanupExpiredEntries();

  const key = config.keyPrefix ? `${config.keyPrefix}:${ip}` : ip;
  const now = Date.now();
  const entry = ipStore.get(key);

  if (!entry || entry.resetAt < now) {
    // First request in window or window expired
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    ipStore.set(key, newEntry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt,
      retryAfterMs: 0,
    };
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterMs: entry.resetAt - now,
    };
  }

  // Increment counter
  entry.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
    retryAfterMs: 0,
  };
}

/**
 * Create rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult, config: RateLimitConfig): Record<string, string> {
  return {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
  };
}

/**
 * Create a 429 Too Many Requests response
 */
export function createRateLimitResponse(
  result: RateLimitResult, 
  config: RateLimitConfig,
  corsHeaders: Record<string, string>
): Response {
  const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000);
  
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Trop de requêtes. Veuillez réessayer plus tard.',
      retryAfter: retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        ...getRateLimitHeaders(result, config),
        'Retry-After': retryAfterSeconds.toString(),
        'Content-Type': 'application/json',
      },
    }
  );
}

// Predefined configurations for different endpoint types
export const RATE_LIMITS = {
  // Search endpoints - more lenient (30 requests per minute)
  SEARCH: {
    windowMs: 60000,    // 1 minute
    maxRequests: 30,
  },
  // AI endpoints - more restrictive (10 requests per minute)
  AI: {
    windowMs: 60000,    // 1 minute
    maxRequests: 10,
  },
  // Autocomplete endpoints - very lenient (60 requests per minute)
  AUTOCOMPLETE: {
    windowMs: 60000,    // 1 minute
    maxRequests: 60,
  },
  // Booking endpoints - restrictive (5 requests per minute)
  BOOKING: {
    windowMs: 60000,    // 1 minute
    maxRequests: 5,
  },
  // Payment endpoints - very restrictive (3 requests per minute)
  PAYMENT: {
    windowMs: 60000,    // 1 minute
    maxRequests: 3,
  },
} as const;
