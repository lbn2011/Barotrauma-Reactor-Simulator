<script lang="ts">
  import type { Action } from '~/types';

  export let action: Action | undefined | null;

  function handleClick(event: MouseEvent) {
    if (action?.destination?.url) {
      window.location.href = action.destination.url;
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
    href={action.destination?.url || '#'}
    on:click={handleClick}
    class="link-wrapper"
  >
    <slot />
  </a>
{:else}
  <div class="link-wrapper">
    <slot />
  </div>
{/if}
