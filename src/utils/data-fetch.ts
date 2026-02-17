// Data Fetching Utility
// This utility provides a unified data fetching layer with caching, retry, and error handling

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

  // Check if we have a cached response
  if (cache) {
    const cachedData = getCachedResponse<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  let lastError: FetchError;

  // Attempt to fetch with retries
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Cache the response if enabled
      if (cache) {
        setCachedResponse(cacheKey, data, cacheExpiration);
      }

      return data;
    } catch (error) {
      lastError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 0,
        url,
        originalError: error instanceof Error ? error : undefined,
      };

      // If this is not the last attempt, wait and retry
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // If all attempts failed, throw the last error
  throw lastError;
}

/**
 * Get cached response from local storage
 * @param key - Cache key
 * @returns Cached data if available and not expired, otherwise null
 */
export function getCachedResponse<T>(key: string): T | null {
  try {
    const cachedString = localStorage.getItem(`cache_${key}`);
    if (!cachedString) {
      return null;
    }

    const cached: CachedResponse = JSON.parse(cachedString);
    const now = Date.now();

    // Check if the cache has expired
    if (cached.expiration && now > cached.expiration) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }

    return cached.data;
  } catch (error) {
    console.warn('Error getting cached response:', error);
    return null;
  }
}

/**
 * Set cached response in local storage
 * @param key - Cache key
 * @param data - Data to cache
 * @param expiration - Expiration time in milliseconds
 */
export function setCachedResponse(key: string, data: any, expiration?: number): void {
  try {
    const cached: CachedResponse = {
      data,
      timestamp: Date.now(),
      expiration: expiration ? Date.now() + expiration : undefined,
    };

    localStorage.setItem(`cache_${key}`, JSON.stringify(cached));
  } catch (error) {
    console.warn('Error setting cached response:', error);
  }
}

/**
 * Clear cached response from local storage
 * @param key - Cache key
 */
export function clearCachedResponse(key: string): void {
  try {
    localStorage.removeItem(`cache_${key}`);
  } catch (error) {
    console.warn('Error clearing cached response:', error);
  }
}

/**
 * Clear all cached responses
 */
export function clearAllCachedResponses(): void {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Error clearing all cached responses:', error);
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetchWithCache<T>(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
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
  const fetchPromises = requests.map(({ url, options }) =>
    fetchWithCache<T>(url, options)
  );

  return Promise.all(fetchPromises);
}
