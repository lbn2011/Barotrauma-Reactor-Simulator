import { fly } from 'svelte/transition';
import log from '../lib/utils/logger';

export function flyAndBlur(node: Element, options: any) {
  log.trace('Applying fly animation effect');
  return fly(node, {
    ...options,
    // Add blur effect if needed
  });
}
