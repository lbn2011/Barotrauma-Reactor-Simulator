import { writable } from 'svelte/store';
import log from '../lib/utils/logger';

log.info('Sidebar hidden state store initialized');

// Create sidebar hidden state store with logging
const { subscribe, set, update } = writable(false);

export const sidebarIsHidden = {
  subscribe,
  set: (value: boolean) => {
    log.info(`Setting sidebar hidden state: ${value}`);
    set(value);
  },
  update: (updater: (value: boolean) => boolean) => {
    log.trace('Updating sidebar hidden state');
    update((current) => {
      const newValue = updater(current);
      if (newValue !== current) {
        log.debug(
          `Sidebar hidden state changed from ${current} to ${newValue}`
        );
      }
      return newValue;
    });
  },
  // Convenience methods
  hide: () => {
    log.info('Hiding sidebar');
    set(true);
  },
  show: () => {
    log.info('Showing sidebar');
    set(false);
  },
  toggle: () => {
    log.info('Toggling sidebar visibility');
    update((current) => !current);
  },
};

log.success('Sidebar hidden state store creation completed');
