<script lang="ts">
import type { Action } from '~/types';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

export let action: Action | undefined | null;

function handleClick (event: MouseEvent) {
  if (action?.destination?.url) {
    event.preventDefault();
    // Check if it's an external link
    if (
      action.destination.url.startsWith('http://') ||
      action.destination.url.startsWith('https://')
    ) {
      window.open(action.destination.url, '_blank');
    } else {
      goto(resolve(action.destination.url));
    }
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
  <a on:click={handleClick} class="link-wrapper" rel="noopener noreferrer" target="_blank">
    <slot />
  </a>
{:else}
  <div class="link-wrapper">
    <slot />
  </div>
{/if}
