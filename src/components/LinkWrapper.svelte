<script lang="ts">
/* eslint-disable svelte/no-navigation-without-resolve */
import type { Action } from '../types';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { logger } from '../lib/utils/logger';

export let action: Action | undefined | null;

function handleClick (event: MouseEvent) {
  if (action?.destination?.url) {
    event.preventDefault();
    const resolved = resolve(action.destination.url as any);
    logger.info('Internal navigation', { url: action.destination.url });
    goto(resolved);
  }
}

function handleKeyDown (event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick(event as any);
  }
}
</script>

<style lang="scss">
.link-wrapper {
  display: contents;
}

a {
  text-decoration: none;
  color: inherit;
}
</style>

{#if action}
  <a
    on:click={handleClick}
    on:keydown={handleKeyDown}
    href={action.destination?.url ? resolve(action.destination.url as any) : '#'}
    class="link-wrapper"
    rel="noopener noreferrer"
    target="_blank"
    role="button"
    tabindex="0"
  >
    <slot />
  </a>
{:else}
  <div class="link-wrapper">
    <slot />
  </div>
{/if}
