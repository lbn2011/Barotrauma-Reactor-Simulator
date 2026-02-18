import { writable } from 'svelte/store';
import log from '../lib/utils/logger';

log.info('Reduced motion preference store initialized');

// Create a store for prefers-reduced-motion preference
const { subscribe, set, update } = writable(false);

// Enhanced store object
const prefersReducedMotion = {
  subscribe,
  set: (value: boolean) => {
    log.info(`Setting reduced motion preference: ${value}`);
    set(value);
  },
  update: (updater: (value: boolean) => boolean) => {
    log.trace('Updating reduced motion preference');
    update((current) => {
      const newValue = updater(current);
      if (newValue !== current) {
        log.debug(
          `Reduced motion preference changed from ${current} to ${newValue}`
        );
      }
      return newValue;
    });
  },
};

// Initialize the store with the user's preference
if (typeof window !== 'undefined') {
  log.debug('Detecting browser reduced motion preference');
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  log.trace('Media query created successfully');

  // Set initial value
  const initialValue = mediaQuery.matches;
  log.info(`Initial reduced motion preference: ${initialValue}`);
  prefersReducedMotion.set(initialValue);

  // Listen for changes
  log.debug('Starting to listen for reduced motion preference changes');
  mediaQuery.addEventListener('change', (e) => {
    log.info(`Reduced motion preference changed: ${e.matches}`);
    prefersReducedMotion.set(e.matches);
  });
} else {
  log.warn(
    'Non-browser environment, using default reduced motion preference: false'
  );
}

log.success('Reduced motion preference store initialization completed');

export { prefersReducedMotion };
