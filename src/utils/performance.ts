// Performance Optimization Utilities
// This module provides utilities for optimizing application performance

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
  let timeout: NodeJS.Timeout | null = null;

  return function(...args: Parameters<T>) {
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
  let inThrottle = false;

  return function(...args: Parameters<T>) {
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
export function measureExecutionTime<T>(
  func: () => T,
  label: string
): T {
  const start = performance.now();
  const result = func();
  const end = performance.now();
  console.log(`${label} took ${end - start}ms`);
  return result;
}

/**
 * Lazy load images using Intersection Observer
 * @param images - Array of image elements to lazy load
 * @param options - Intersection Observer options
 */
export function lazyLoadImages(
  images: HTMLImageElement[],
  options: IntersectionObserverInit = {}
): void {
  if (!('IntersectionObserver' in window)) {
    // Fallback if Intersection Observer is not supported
    images.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, options);

  images.forEach(img => {
    if (img.dataset.src) {
      observer.observe(img);
    }
  });
}

/**
 * Preload critical resources
 * @param resources - Array of resources to preload
 */
export function preloadCriticalResources(resources: Array<{
  href: string;
  as: string;
  type?: string;
  crossorigin?: string;
}>): void {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
    document.head.appendChild(link);
  });
}

/**
 * Optimize animations for performance
 * @param element - Element to optimize
 */
export function optimizeForAnimation(element: HTMLElement): void {
  element.style.transform = 'translateZ(0)';
  element.style.willChange = 'transform';
  element.style.backfaceVisibility = 'hidden';
  element.style.perspective = '1000px';
}

/**
 * Check if the browser supports requestAnimationFrame
 * @returns Whether requestAnimationFrame is supported
 */
export function supportsRequestAnimationFrame(): boolean {
  return 'requestAnimationFrame' in window;
}

/**
 * Schedule a function to run in the next animation frame
 * @param func - Function to schedule
 * @returns Request ID
 */
export function scheduleAnimationFrame(func: () => void): number {
  if (supportsRequestAnimationFrame()) {
    return window.requestAnimationFrame(func);
  } else {
    return window.setTimeout(func, 16); // Fallback to ~60fps
  }
}

/**
 * Cancel a scheduled animation frame
 * @param id - Request ID
 */
export function cancelAnimationFrame(id: number): void {
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
export function isLowEndDevice(): boolean {
  // Check for memory
  const memory = (navigator as any).deviceMemory || 4;
  
  // Check for CPU cores
  const cores = navigator.hardwareConcurrency || 4;
  
  // Check for screen resolution
  const resolution = window.screen.width * window.screen.height;
  
  // Check for touch support
  const isTouch = 'ontouchstart' in window;
  
  // Combine checks
  return (
    memory < 4 ||
    cores < 4 ||
    resolution < 1024 * 768 ||
    (isTouch && memory < 2)
  );
}

/**
 * Optimize based on device capabilities
 */
export function optimizeBasedOnDevice(): void {
  if (isLowEndDevice()) {
    // Disable heavy animations
    document.documentElement.classList.add('low-end-device');
    
    // Reduce image quality
    document.documentElement.setAttribute('data-image-quality', 'low');
    
    // Disable some features
    document.documentElement.setAttribute('data-features', 'reduced');
  } else {
    document.documentElement.classList.remove('low-end-device');
    document.documentElement.setAttribute('data-image-quality', 'high');
    document.documentElement.setAttribute('data-features', 'full');
  }
}
