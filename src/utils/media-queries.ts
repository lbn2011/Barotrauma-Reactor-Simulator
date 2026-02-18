import { writable } from 'svelte/store';
import log from '../lib/utils/logger';

log.info('Initializing media query store');
const mediaQueries = writable('medium');

// Listen for media query changes
if (typeof window !== 'undefined') {
  log.debug('Setting media query listeners');
  const handleResize = () => {
    const width = window.innerWidth;
    let size = 'medium';

    if (width < 768) size = 'small';
    else if (width >= 1440) size = 'large';

    mediaQueries.update((current) => {
      if (current !== size) {
        log.info(`Media query updated: ${current} -> ${size}`);
        return size;
      }
      return current;
    });
  };

  // Initial execution
  handleResize();

  // Add resize event listener
  window.addEventListener('resize', handleResize);

  log.success('Media query system initialization completed successfully');
}

export default mediaQueries;
