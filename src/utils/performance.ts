// Performance Optimization Utilities
// This module provides utilities for optimizing application performance

import log from '../lib/utils/logger';

/**
 * Debounce function to limit the rate at which a function can fire
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @param immediate - Whether to execute the function immediately
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  log.debug(
    `Creating debounce function, wait time: ${wait}ms, immediate: ${immediate}`
  );
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

/**
 * Throttle function to limit the rate at which a function can fire
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  log.debug(`Creating throttle function, limit time: ${limit}ms`);
  let inThrottle = false;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Measure the execution time of a function
 * @param func - Function to measure
 * @param label - Label for the measurement
 * @returns Result of the function
 */
export function measureExecutionTime<T> (func: () => T, label: string): T {
  log.time(label);
  const start = performance.now();
  const result = func();
  const end = performance.now();
  log.timeEnd(label);
  log.debug(`${label} execution time: ${end - start}ms`);
  return result;
}

/**
 * Lazy load images using Intersection Observer
 * @param images - Array of image elements to lazy load
 * @param options - Intersection Observer options
 */
export function lazyLoadImages (
  images: HTMLImageElement[],
  options: IntersectionObserverInit = {}
): void {
  log.info(`Starting lazy loading for ${images.length} images`);

  if (!('IntersectionObserver' in window)) {
    // Fallback if Intersection Observer is not supported
    log.warn('Browser does not support Intersection Observer, using fallback');
    images.forEach((img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          log.trace(`Loading image: ${img.dataset.src}`);
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, options);

  images.forEach((img) => {
    if (img.dataset.src) {
      observer.observe(img);
    }
  });

  log.success('Image lazy loading setup completed');
}

/**
 * Preload critical resources
 * @param resources - Array of resources to preload
 */
export function preloadCriticalResources (
  resources: Array<{
    href: string;
    as: string;
    type?: string;
    crossorigin?: string;
  }>
): void {
  log.info(`Preloading ${resources.length} critical resources`);

  resources.forEach((resource) => {
    log.trace(`Preloading resource: ${resource.href} (${resource.as})`);
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
    document.head.appendChild(link);
  });

  log.success('Critical resources preloading completed');
}

/**
 * Optimize animations for performance
 * @param element - Element to optimize
 */
export function optimizeForAnimation (element: HTMLElement): void {
  log.trace('Optimizing element animation performance');
  element.style.transform = 'translateZ(0)';
  element.style.willChange = 'transform';
  element.style.backfaceVisibility = 'hidden';
  element.style.perspective = '1000px';
}

/**
 * Check if the browser supports requestAnimationFrame
 * @returns Whether requestAnimationFrame is supported
 */
export function supportsRequestAnimationFrame (): boolean {
  const result = 'requestAnimationFrame' in window;
  log.trace(`Browser supports requestAnimationFrame: ${result}`);
  return result;
}

/**
 * Schedule a function to run in the next animation frame
 * @param func - Function to schedule
 * @returns Request ID
 */
export function scheduleAnimationFrame (func: () => void): number {
  log.trace('Scheduling animation frame function execution');
  if (supportsRequestAnimationFrame()) {
    return window.requestAnimationFrame(func);
  } else {
    log.warn(
      'Browser does not support requestAnimationFrame, falling back to setTimeout'
    );
    return window.setTimeout(func, 16); // Fallback to ~60fps
  }
}

/**
 * Cancel a scheduled animation frame
 * @param id - Request ID
 */
export function cancelAnimationFrame (id: number): void {
  log.trace('Cancelling animation frame function execution');
  if (supportsRequestAnimationFrame()) {
    window.cancelAnimationFrame(id);
  } else {
    window.clearTimeout(id);
  }
}

/**
 * Detect if the device is low-end
 * @returns Whether the device is low-end
 */
export function isLowEndDevice (): boolean {
  log.trace('Detecting device performance level');
  // Check for memory
  const memory = (navigator as any).deviceMemory || 4;
  log.trace(`Device memory: ${memory}GB`);

  // Check for CPU cores
  const cores = navigator.hardwareConcurrency || 4;
  log.trace(`CPU cores: ${cores}`);

  // Check for screen resolution
  const resolution = window.screen.width * window.screen.height;
  log.trace(`Screen resolution: ${resolution}`);

  // Check for touch support
  const isTouch = 'ontouchstart' in window;
  log.trace(`Touch support: ${isTouch}`);

  // Combine checks
  const result =
    memory < 4 ||
    cores < 4 ||
    resolution < 1024 * 768 ||
    (isTouch && memory < 2);

  log.info(`Device performance level: ${result ? 'Low' : 'High'}`);
  return result;
}

/**
 * Optimize based on device capabilities
 */
export function optimizeBasedOnDevice (): void {
  log.info('Optimizing application based on device performance');
  if (isLowEndDevice()) {
    // Disable heavy animations
    log.warn(
      'Low-performance device detected, applying performance optimizations'
    );
    document.documentElement.classList.add('low-end-device');

    // Reduce image quality
    document.documentElement.setAttribute('data-image-quality', 'low');

    // Disable some features
    document.documentElement.setAttribute('data-features', 'reduced');
    log.success('Low-performance device optimization completed');
  } else {
    log.info('High-performance device detected, enabling full features');
    document.documentElement.classList.remove('low-end-device');
    document.documentElement.setAttribute('data-image-quality', 'high');
    document.documentElement.setAttribute('data-features', 'full');
    log.success('High-performance device configuration completed');
  }
}
