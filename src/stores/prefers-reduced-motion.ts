import { writable } from 'svelte/store';

// Create a store for prefers-reduced-motion preference
const prefersReducedMotion = writable(false);

// Initialize the store with the user's preference
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Set initial value
  prefersReducedMotion.set(mediaQuery.matches);

  // Listen for changes
  mediaQuery.addEventListener('change', (e) => {
    prefersReducedMotion.set(e.matches);
  });
}

export { prefersReducedMotion };
