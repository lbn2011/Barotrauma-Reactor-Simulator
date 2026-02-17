import { fly } from 'svelte/transition';

export function flyAndBlur (node: Element, options: any) {
  return fly(node, {
    ...options,
    // Add blur effect if needed
  });
}
