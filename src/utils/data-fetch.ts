// Data Fetching Utility
// This utility provides a unified data fetching layer with caching, retry, and error handling

import log from '../lib/utils/logger';

/**
 * Fetch options with retry and cache support
 */
export interface FetchOptions extends RequestInit {
  /** Number of retry attempts */
  retries?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Whether to cache the response */
  cache?: boolean;
  /** Cache expiration time in milliseconds */
  cacheExpiration?: number;
  /** Cache key for storing the response */
  cacheKey?: string;
}

/**
 * Cached response structure
 */
export interface CachedResponse {
  data: any;
  timestamp: number;
  expiration?: number;
}

/**
 * Fetch error structure
 */
export interface FetchError {
  message: string;
  status: number;
  url: string;
  originalError?: Error;
}

/**
 * Unified data fetching function with caching, retry, and error handling
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns Promise with the response data
 */
export async function fetchWithCache<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    retries = 3,
    retryDelay = 1000,
    cache = true,
    cacheExpiration = 5 * 60 * 1000, // 5 minutes
    cacheKey = url,
    ...fetchOptions
  } = options;

  log.info(`Starting request: ${url}`);
  log.debug(
    `Request options: retries=${retries}, delay=${retryDelay}ms, cache=${cache}`
  );

  // Check if we have a cached response
  if (cache) {
    const cachedData = getCachedResponse<T>(cacheKey);
    if (cachedData) {
      log.success(`Using cached data: ${url}`);
      return cachedData;
    }
  }

  let lastError: FetchError;

  // Attempt to fetch with retries
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      log.debug(`Request attempt ${attempt + 1}/${retries}`);
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      log.debug(`Request successful: ${url}`);

      // Cache the response if enabled
      if (cache) {
        log.debug(`Caching response: ${url}`);
        setCachedResponse(cacheKey, data, cacheExpiration);
      }

      log.success(`Request completed: ${url}`);
      return data;
    } catch (error) {
      lastError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 0,
        url,
        originalError: error instanceof Error ? error : undefined,
      };
      log.error(`Request failed (${attempt + 1}/${retries}): ${url}`, error);

      // If this is not the last attempt, wait and retry
      if (attempt < retries - 1) {
        log.debug(`Waiting ${retryDelay}ms before retrying`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  // If all attempts failed, throw the last error
  log.fatal(`All request attempts failed: ${url}`);
  throw lastError;
}

/**
 * Get cached response from local storage
 * @param key - Cache key
 * @returns Cached data if available and not expired, otherwise null
 */
export function getCachedResponse<T>(key: string): T | null {
  try {
    log.trace(`Getting cache: ${key}`);
    const cachedString = localStorage.getItem(`cache_${key}`);
    if (!cachedString) {
      log.trace(`Cache not found: ${key}`);
      return null;
    }

    const cached: CachedResponse = JSON.parse(cachedString);
    const now = Date.now();

    // Check if the cache has expired
    if (cached.expiration && now > cached.expiration) {
      log.trace(`Cache expired: ${key}`);
      localStorage.removeItem(`cache_${key}`);
      return null;
    }

    log.trace(`Cache hit: ${key}`);
    return cached.data;
  } catch (error) {
    log.error('Error getting cache:', error);
    return null;
  }
}

/**
 * Set cached response in local storage
 * @param key - Cache key
 * @param data - Data to cache
 * @param expiration - Expiration time in milliseconds
 */
export function setCachedResponse(
  key: string,
  data: any,
  expiration?: number
): void {
  try {
    log.trace(`Setting cache: ${key}`);
    const cached: CachedResponse = {
      data,
      timestamp: Date.now(),
      expiration: expiration ? Date.now() + expiration : undefined,
    };

    localStorage.setItem(`cache_${key}`, JSON.stringify(cached));
    log.trace(`Cache set successfully: ${key}`);
  } catch (error) {
    log.error('Error setting cache:', error);
  }
}

/**
 * Clear cached response from local storage
 * @param key - Cache key
 */
export function clearCachedResponse(key: string): void {
  try {
    log.trace(`Clearing cache: ${key}`);
    localStorage.removeItem(`cache_${key}`);
    log.trace(`Cache cleared successfully: ${key}`);
  } catch (error) {
    log.error('Error clearing cache:', error);
  }
}

/**
 * Clear all cached responses
 */
export function clearAllCachedResponses(): void {
  try {
    log.info('Clearing all caches');
    let count = 0;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
        count++;
      }
    });
    log.success(`Cleared ${count} cache items`);
  } catch (error) {
    log.error('Error clearing all caches:', error);
  }
}

/**
 * Fetch with timeout
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds
 * @returns Promise with the response data
 */
export async function fetchWithTimeout<T>(
  url: string,
  options: FetchOptions = {},
  timeout: number = 30000
): Promise<T> {
  log.info(`Request with timeout: ${url} (${timeout}ms)`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetchWithCache<T>(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    log.success(`Request with timeout completed: ${url}`);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      log.error(`Request timeout: ${url}`);
      throw new Error('Fetch timeout');
    }
    throw error;
  }
}

/**
 * Batch fetch multiple URLs
 * @param requests - Array of fetch requests
 * @returns Promise with array of responses
 */
export async function batchFetch<T>(
  requests: Array<{ url: string; options?: FetchOptions }>
): Promise<T[]> {
  log.info(`Batch request: ${requests.length} URLs`);
  const fetchPromises = requests.map(({ url, options }, index) => {
    log.trace(`Batch request ${index + 1}: ${url}`);
    return fetchWithCache<T>(url, options);
  });

  const results = await Promise.all(fetchPromises);
  log.success(`Batch request completed: ${requests.length} URLs`);
  return results;
}
